let currentSlide = 0;

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) targetPage.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(initScrollAnimations, 100);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    if (!menu || !icon) return;
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (slides.length === 0) return;

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (indicators[i]) {
            indicators[i].classList.remove('active', 'bg-white');
            indicators[i].classList.add('bg-white/50');
        }
    });

    slides[currentSlide].classList.add('active');
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add('active', 'bg-white');
        indicators[currentSlide].classList.remove('bg-white/50');
    }
}

window.nextSlide = function() {
    showSlide(currentSlide + 1);
};

window.prevSlide = function() {
    showSlide(currentSlide - 1);
};

function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                let current = 0;
                const increment = target / 100;
                const update = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        setTimeout(update, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                update();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 1.0 });
    counters.forEach(counter => observer.observe(counter));
}

window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function handleScroll() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    if (window.scrollY > 300) {
        backToTop.classList.remove('opacity-0', 'invisible');
        backToTop.classList.add('opacity-100', 'visible');
    } else {
        backToTop.classList.add('opacity-0', 'invisible');
        backToTop.classList.remove('opacity-100', 'visible');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');

    if (slides.length > 0) {
        showSlide(0);

        setInterval(() => {
            window.nextSlide();
        }, 5000);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => showSlide(index));
        });
    }

    initScrollAnimations();
    animateCounters();
    window.addEventListener('scroll', handleScroll);

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
});