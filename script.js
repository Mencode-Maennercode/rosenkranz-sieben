document.addEventListener('DOMContentLoaded', function() {
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const header = document.querySelector('.header');
    const headerLogo = document.querySelector('.header-logo');
    const navLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');
    const modalOverlay = document.querySelector('.modal-overlay');
    const cookieBanner = document.querySelector('.cookie-banner');
    
    // Check cookie consent
    if (!localStorage.getItem('cookieConsent')) {
        cookieBanner.style.display = 'block';
    }
    
    // Cookie consent functions
    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.style.display = 'none';
    };
    
    // Mobile navigation toggle
    navToggle.addEventListener('click', function() {
        const isActive = navMobile.classList.contains('active');
        
        navMobile.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.style.overflow = isActive ? '' : 'hidden';
    });
    
    // Enhanced navigation with smooth scroll and mobile touch feedback
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 90;
                    
                    // Smooth scroll with mobile optimization
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu
                    if (navMobile.classList.contains('active')) {
                        navMobile.classList.remove('active');
                        navToggle.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    
                    // Update active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
        
        // Add touch feedback for mobile
        if ('ontouchstart' in window) {
            link.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            link.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        }
    });
    
    // Enhanced scroll detection with mobile performance optimization
    let scrollTimer;
    window.addEventListener('scroll', function() {
        // Throttle scroll events for better mobile performance
        if (scrollTimer) {
            return;
        }
        
        scrollTimer = setTimeout(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Fade in header logo when leaving hero section
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                if (window.scrollY > heroBottom - 100) {
                    headerLogo.classList.add('visible');
                } else {
                    headerLogo.classList.remove('visible');
                }
            }
            
            let current = '';
            const sections = document.querySelectorAll('section[id]');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
            
            // Scroll-triggered animations
            const animatedSections = document.querySelectorAll('.about, .services, .approach, .contact');
            animatedSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
                
                if (isVisible) {
                    section.classList.add('visible');
                }
            });
            
            scrollTimer = null;
        }, 16); // ~60fps
    });
    
    // Initial check for visible sections on page load
    const checkInitialVisibility = () => {
        const animatedSections = document.querySelectorAll('.about, .services, .approach, .contact');
        animatedSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            
            if (isVisible) {
                section.classList.add('visible');
            }
        });
    };
    
    // Check initial visibility after a short delay
    setTimeout(checkInitialVisibility, 100);
    
    // Enhanced form submission with mobile feedback
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const privacy = document.getElementById('privacy').checked;
            
            if (!name || !email || !message || !privacy) {
                showMobileNotification('Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die Datenschutzerklärung.', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMobileNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
                return;
            }
            
            console.log('Form submitted:', { name, email, phone, message });
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Wird gesendet...';
            submitButton.disabled = true;
            
            // Send data to PHP script via AJAX
            const formData = new FormData(contactForm);
            
            fetch('sende_email.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMobileNotification(data.message, 'success');
                    contactForm.reset();
                } else {
                    showMobileNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMobileNotification('Leider konnte Ihre Nachricht nicht gesendet werden. Bitte versuchen Sie es später erneut.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Mobile notification system
    function showMobileNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '9999',
            maxWidth: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .approach-card, .pricing-card').forEach(el => {
        observer.observe(el);
    });
    
    // Add parallax effect to hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Add floating animation to service icons
    const serviceIcons = document.querySelectorAll('.service-icon');
    serviceIcons.forEach((icon, index) => {
        icon.style.animation = `float 3s ease-in-out infinite ${index * 0.5}s`;
    });
    
    modalOverlay.addEventListener('click', function() {
        closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            navMobile.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

function openModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function openPricingModal() {
    const modal = document.getElementById('pricing-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePricingModal() {
    const modal = document.getElementById('pricing-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.querySelector('.modal-overlay');
    
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    .header.scrolled {
        background: #161c2c;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .text-shimmer {
        background: linear-gradient(90deg, var(--color-text) 0%, var(--color-secondary) 50%, var(--color-text) 100%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
`;
document.head.appendChild(style);
