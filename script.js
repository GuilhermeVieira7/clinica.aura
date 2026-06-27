document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. INICIALIZAÇÃO DOS ÍCONES LUCIDE
  // ==========================================
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // 2. ROLAGEM INERCIAL SUAVE (LENIS SCROLL)
  // ==========================================
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing inercial suave
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // ==========================================
  // 3. CURSOR CUSTOMIZADO COM RASTREAMENTO ELÁSTICO
  // ==========================================
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  
  if (dot && outline) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });
    
    // Loop de renderização suave para o contorno do cursor
    const animateOutline = () => {
      const ease = 0.12; // Velocidade do lag elástico
      outlineX += (mouseX - outlineX) * ease;
      outlineY += (mouseY - outlineY) * ease;
      
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateOutline);
    };
    animateOutline();
    
    // Adicionar estados de hover em elementos interativos
    const refreshCursorHovers = () => {
      const hoverTargets = document.querySelectorAll('a, button, .procedimento-tab, .quiz-option, .faq-header, .slider-handle, .slider-dot');
      hoverTargets.forEach(target => {
        // Evitar duplicações de ouvintes
        target.removeEventListener('mouseenter', addCursorHover);
        target.removeEventListener('mouseleave', removeCursorHover);
        
        target.addEventListener('mouseenter', addCursorHover);
        target.addEventListener('mouseleave', removeCursorHover);
      });
    };
    
    function addCursorHover() {
      document.body.classList.add('cursor-hover');
    }
    
    function removeCursorHover() {
      document.body.classList.remove('cursor-hover');
    }
    
    refreshCursorHovers();
    
    // Tornar exposto globalmente para novos elementos
    window.refreshCursorHovers = refreshCursorHovers;
  }

  // ==========================================
  // 4. HEADER: SCROLL E TRANSPARÊNCIA
  // ==========================================
  const header = document.getElementById('main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger inicial

  // ==========================================
  // 5. MENU MOBILE
  // ==========================================
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-list');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // ==========================================
  // 6. PARALLAX DISCRETO (HERO)
  // ==========================================
  const heroImage = document.querySelector('.hero-img');
  if (heroImage) {
    window.addEventListener('scroll', () => {
      const scrollValue = window.pageYOffset;
      heroImage.style.transform = `translateY(${scrollValue * 0.15}px) scale(1.08)`;
    });
  }

  // ==========================================
  // 7. INTERSECTION OBSERVER: REVEAL ON SCROLL
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 8. FILTRO DE PROCEDIMENTOS (STAGGERED DELAY DE LUXO)
  // ==========================================
  const tabs = document.querySelectorAll('.procedimento-tab');
  const cards = document.querySelectorAll('.procedimento-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      // 1. Saída suave simultânea de todos os cards
      cards.forEach(card => {
        card.classList.add('fade-out');
        card.classList.remove('fade-in-stagger', 'active');
      });

      // 2. Reorganizar após animação de saída concluir (400ms)
      setTimeout(() => {
        let staggerIndex = 0;
        cards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (category === 'todos' || cardCategory === category) {
            card.style.display = 'block';
            card.classList.remove('fade-out');
            card.classList.add('fade-in-stagger');
            
            // Atribui atraso progressivo (100ms por card)
            const delay = staggerIndex * 100;
            card.style.transitionDelay = `${delay}ms`;
            staggerIndex++;

            // Disparar animação de entrada no frame seguinte
            requestAnimationFrame(() => {
              card.classList.add('active');
            });
          } else {
            card.style.display = 'none';
            card.style.transitionDelay = '0ms';
          }
        });
      }, 400);
    });
  });

  // ==========================================
  // 9. ANTES E DEPOIS INTERATIVO (SLIDER)
  // ==========================================
  const slider = document.getElementById('before-after-slider');
  const handle = document.getElementById('slider-drag-handle');

  if (slider && handle) {
    let isDragging = false;

    const getXPosition = (e) => {
      const rect = slider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let x = clientX - rect.left;
      
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      return (x / rect.width) * 100;
    };

    const updateSliderPosition = (percentage) => {
      slider.style.setProperty('--slider-position', `${percentage}%`);
    };

    handle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const percentage = getXPosition(e);
      updateSliderPosition(percentage);
    });

    handle.addEventListener('touchstart', () => isDragging = true);
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const percentage = getXPosition(e);
      updateSliderPosition(percentage);
    });

    slider.addEventListener('click', (e) => {
      if (e.target === handle || handle.contains(e.target)) return;
      const percentage = getXPosition(e);
      updateSliderPosition(percentage);
    });
  }

  // ==========================================
  // 10. CONTADORES NUMÉRICOS ANIMADOS
  // ==========================================
  const statsElements = document.querySelectorAll('.stat-number');
  
  const animateStats = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const suffix = element.querySelector('span') ? element.querySelector('span').outerHTML : '';
    let count = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / target), 15);
    
    const counter = setInterval(() => {
      count += Math.ceil(target / (duration / stepTime));
      if (count >= target) {
        element.innerHTML = target + suffix;
        clearInterval(counter);
      } else {
        element.innerHTML = count + suffix;
      }
    }, stepTime);
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  statsElements.forEach(stat => statsObserver.observe(stat));

  // ==========================================
  // 11. CARROSSEL DE DEPOIMENTOS
  // ==========================================
  const slides = document.querySelectorAll('.depoimento-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  let currentSlide = 0;

  if (slides.length > 0) {
    const changeSlide = (index) => {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');

      if (index >= slides.length) {
        currentSlide = 0;
      } else if (index < 0) {
        currentSlide = slides.length - 1;
      } else {
        currentSlide = index;
      }

      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    };

    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(currentSlide + 1));

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => changeSlide(idx));
    });

    let autoPlayInterval = setInterval(() => changeSlide(currentSlide + 1), 8000);

    const resetAutoPlay = () => {
      clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(() => changeSlide(currentSlide + 1), 8000);
    };

    [prevBtn, nextBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', resetAutoPlay);
    });
    dots.forEach(dot => dot.addEventListener('click', resetAutoPlay));
  }

  // ==========================================
  // 12. ACCORDION FAQ
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');

    if (header && body) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-open');

        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('faq-open');
            otherItem.querySelector('.faq-body').style.maxHeight = null;
            otherItem.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('faq-open');
          body.style.maxHeight = null;
          header.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('faq-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          header.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // ==========================================
  // 13. ANCORAGEM SUAVE INTEGRADA COM LENIS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        const headerHeight = header.offsetHeight;
        
        if (lenis) {
          lenis.scrollTo(targetElement, {
            offset: -headerHeight,
            duration: 1.2
          });
        } else {
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ==========================================
  // 14. LOGICAL CONTROL: MODAL QUIZ DIAGNÓSTICO
  // ==========================================
  const quizModal = document.getElementById('quiz-modal-container');
  const quizTriggers = document.querySelectorAll('.quiz-trigger');
  const closeQuizBtn = document.getElementById('close-quiz-btn');
  const prevQuizBtn = document.getElementById('quiz-prev-btn');
  const nextSubmitQuizBtn = document.getElementById('quiz-next-submit-btn');
  const quizSteps = document.querySelectorAll('.quiz-step');
  const progressFill = document.getElementById('quiz-progress-indicator');
  const stepText = document.getElementById('quiz-step-text');
  const leadForm = document.getElementById('quiz-lead-form');
  
  let currentStep = 1;
  let quizData = {
    area: '',
    objetivo: '',
    nome: '',
    email: '',
    whatsapp: ''
  };

  const goToStep = (step) => {
    quizSteps.forEach(s => s.classList.remove('active'));
    currentStep = step;

    const activeStep = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    if (activeStep) {
      activeStep.classList.add('active');
    }

    // Atualiza barra de progresso
    const progressPct = (currentStep / 3) * 100;
    progressFill.style.width = `${progressPct}%`;
    stepText.innerText = `Passo ${currentStep} de 3`;

    // Visibilidade dos botões
    if (currentStep > 1) {
      prevQuizBtn.classList.add('visible');
    } else {
      prevQuizBtn.classList.remove('visible');
    }

    if (currentStep === 3) {
      nextSubmitQuizBtn.innerText = 'Enviar Diagnóstico';
    } else {
      nextSubmitQuizBtn.innerText = 'Avançar';
    }

    // O botão avançar/enviar só aparece no passo 3 (passos 1 e 2 avançam ao clicar nas opções)
    if (currentStep === 3) {
      nextSubmitQuizBtn.style.display = 'block';
    } else {
      nextSubmitQuizBtn.style.display = 'none';
    }
  };

  const resetQuiz = () => {
    goToStep(1);
    leadForm.reset();
    quizData = { area: '', objetivo: '', nome: '', email: '', whatsapp: '' };
  };

  // Abrir Modal
  quizTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      quizModal.classList.add('open');
      resetQuiz();
      if (lenis) lenis.stop(); // Trava a rolagem da página por trás
    });
  });

  // Fechar Modal
  const closeModal = () => {
    quizModal.classList.remove('open');
    if (lenis) lenis.start(); // Destrava rolagem
  };

  closeQuizBtn.addEventListener('click', closeModal);
  quizModal.addEventListener('click', (e) => {
    if (e.target === quizModal) closeModal();
  });

  // Eventos de Seleção de Opções (Passo 1 e 2)
  const step1Options = quizSteps[0].querySelectorAll('.quiz-option');
  step1Options.forEach(opt => {
    opt.addEventListener('click', () => {
      quizData.area = opt.getAttribute('data-value');
      goToStep(2);
    });
  });

  const step2Options = quizSteps[1].querySelectorAll('.quiz-option');
  step2Options.forEach(opt => {
    opt.addEventListener('click', () => {
      quizData.objetivo = opt.getAttribute('data-value');
      goToStep(3);
    });
  });

  // Botão Voltar
  prevQuizBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  // Botão Enviar (Passo 3)
  nextSubmitQuizBtn.addEventListener('click', () => {
    if (currentStep === 3) {
      if (leadForm.checkValidity()) {
        quizData.nome = document.getElementById('quiz-name').value;
        quizData.email = document.getElementById('quiz-email').value;
        quizData.whatsapp = document.getElementById('quiz-whatsapp').value;
        
        submitQuiz();
      } else {
        leadForm.reportValidity();
      }
    }
  });

  const submitQuiz = () => {
    const textMsg = `Olá Clínica AURA! Acabei de preencher o diagnóstico virtual pelo site:
    
- *Área de incômodo:* ${quizData.area}
- *Objetivo principal:* ${quizData.objetivo}
- *Nome do Paciente:* ${quizData.nome}
- *E-mail:* ${quizData.email}
- *WhatsApp:* ${quizData.whatsapp}

Gostaria de agendar minha consulta concierge em Parauapebas.`;

    const encodedMsg = encodeURIComponent(textMsg);
    const apiWhatsapp = `https://wa.me/5594998765432?text=${encodedMsg}`;

    window.open(apiWhatsapp, '_blank');
    closeModal();
  };

  // Re-inicializa ouvintes do cursor caso novas classes entrem em vigor
  if (window.refreshCursorHovers) {
    window.refreshCursorHovers();
  }

});
