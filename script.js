// Данные о битах с категориями
const beats = [
    {
        id: 1,
        title: 'Френдли таг нью еар',
        artist: 'Френдли таг',
        file: 'music/beat1.mp3',
        duration: '3:45',
    },
    {
        id: 2,
        title: 'Каспиский вотер',
        artist: 'Херонвотер',
        file: 'music/beat2.mp3',
        duration: '3:12',
    },
    {
        id: 3,
        title: 'Предсказываю',
        artist: 'Ясми',
        file: 'music/beat3.mp3',
        duration: '3:58',
    }
];

let currentAudio = null;
let currentlyPlaying = null;
let currentFilter = 'all';

// Инициализация сайта
document.addEventListener('DOMContentLoaded', function() {
    loadBeats();
    setupAutoplay();
    setupFormHandling();
    setupNavigation();
    setupFilterButtons();
    updateContactLinks();
    setupScrollAnimations();
});

/* ============ Загрузка битов ============ */
function loadBeats() {
    const beatsGrid = document.getElementById('beatsGrid');
    beatsGrid.innerHTML = '';

    const filteredBeats = currentFilter === 'all'
        ? beats
        : beats.filter(beat => beat.category === currentFilter);

    if (filteredBeats.length === 0) {
        beatsGrid.innerHTML = '<p style="color: var(--text-gray); grid-column: 1/-1; text-align: center;">Биты в этой категории не найдены</p>';
        return;
    }

    filteredBeats.forEach((beat, index) => {
        const beatCard = document.createElement('div');
        beatCard.className = 'beat-card';
        beatCard.style.animation = `fadeInUp 0.6s ease ${0.1 * index}s both`;
        beatCard.innerHTML = `
            <h3>${beat.title}</h3>
            <p>Автор: ${beat.artist}</p>
            <p style="color: var(--text-gray-light); font-size: 0.85rem; margin-bottom: 1rem;">⏱ ${beat.duration}</p>
            <audio id="beat-${beat.id}" src="${beat.file}" preload="metadata"></audio>
            <div class="beat-controls">
                <button class="beat-btn play-btn" data-id="${beat.id}">▶ Слушать</button>
            </div>
        `;

        beatsGrid.appendChild(beatCard);
    });

    // Добавляем обработчики для кнопок
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            playBeat.call(this, this.dataset.id);
        });
    });

    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showPurchaseModal(this.dataset.id);
        });
    });
}

/* ============ Фильтрация битов ============ */
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Обновляем активный класс
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Обновляем фильтр
            currentFilter = this.dataset.filter;
            loadBeats();
        });
    });
}

/* ============ Воспроизведение битов ============ */
function playBeat(beatId) {
    // Преобразуем в число для консистентности
    beatId = Number(beatId);

    const beat = beats.find(b => b.id === beatId);
    const audio = document.getElementById(`beat-${beatId}`);
    const btn = document.querySelector(`.play-btn[data-id="${beatId}"]`);

    if (!audio || !btn) {
        console.warn(`Аудио или кнопка не найдены для бита ${beatId}`);
        return;
    }

    // Если уже что-то играет, остановим другой трек
    if (currentAudio && currentlyPlaying !== beatId) {
        currentAudio.pause();
        currentAudio.currentTime = 0;

        const prevBtn = document.querySelector(`.play-btn[data-id="${currentlyPlaying}"]`);
        if (prevBtn) {
            prevBtn.textContent = '▶ Слушать';
            prevBtn.style.background = '';
        }
    }

    // Переключение воспроизведения
    if (audio.paused) {
        audio.play()
            .then(() => {
                btn.textContent = '⏸ Пауза';
                btn.style.background = 'linear-gradient(135deg, #e8c547, #d4af37)';
                currentAudio = audio;
                currentlyPlaying = beatId;
            })
            .catch(error => {
                console.error('Ошибка при воспроизведении:', error);
                alert('Не удалось воспроизвести трек. Проверьте, что файл music/' + beat.file + ' находится в проекте.');
            });
    } else {
        audio.pause();
        btn.textContent = '▶ Слушать';
        btn.style.background = '';
        currentAudio = null;
        currentlyPlaying = null;
    }
}

/* ============ Автовоспроизведение ============ */
function setupAutoplay() {
    const listenBtn = document.getElementById('listenBtn');
    const autoplayAudio = document.getElementById('autoplayAudio');

    if (beats.length > 0) {
        const firstBeat = beats[0];
        autoplayAudio.src = firstBeat.file;

        listenBtn.addEventListener('click', function() {
            if (autoplayAudio.paused) {
                autoplayAudio.play();
                listenBtn.innerHTML = '<span class="btn-icon">⏸</span>Пауза';
            } else {
                autoplayAudio.pause();
                listenBtn.innerHTML = '<span class="btn-icon">▶</span>Слушать';
            }
        });

        autoplayAudio.addEventListener('ended', function() {
            listenBtn.innerHTML = '<span class="btn-icon">▶</span>Слушать';
        });
    }
}

/* ============ Форма контактов ============ */
function setupFormHandling() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const textareaInput = this.querySelector('textarea');

            const data = {
                name: nameInput.value,
                email: emailInput.value,
                message: textareaInput.value
            };

            showNotification('Спасибо за сообщение! Я свяжусь с вами в ближайшее время.');
            this.reset();
        });
    }
}

/* ============ Модальное окно покупки ============ */
function showPurchaseModal(beatId) {
    const beat = beats.find(b => b.id == beatId);
    const message = `🎵 "${beat.title}"\n\nСпасибо за интерес! Свяжитесь со мной через Telegram или отправьте форму с деталями заказа.`;
    showNotification(message);
}

/* ============ Уведомления ============ */
function showNotification(message) {
    alert(message);
}

/* ============ Навигация ============ */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============ Обновление контактных ссылок ============ */
function updateContactLinks() {
    // Замените на реальные ссылки
    const telegramLink = document.querySelector('.social-link.telegram');
    const instagramLink = document.querySelector('.social-link.instagram');
    const youtubeLink = document.querySelector('.social-link.youtube');

    if (telegramLink) {
        telegramLink.href = 'https://t.me/matvey_beatmaker';
        telegramLink.target = '_blank';
    }

    if (instagramLink) {
        instagramLink.href = 'https://instagram.com';
        instagramLink.target = '_blank';
    }

    if (youtubeLink) {
        youtubeLink.href = 'https://youtube.com';
        youtubeLink.target = '_blank';
    }

    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        emailLink.href = 'mailto:matvey@example.com';
    }
}

/* ============ Обработка кнопки заказа прайса ============ */
document.addEventListener('DOMContentLoaded', function() {
    const priceButtons = document.querySelectorAll('.price-card.active .btn');
    priceButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('💼 Саксо-бит (10 000 ₽)\n\nДля оформления заказа свяжитесь со мной через:\n• Telegram: @matvey_beatmaker\n• Email: matvey@example.com\n\nИли заполните форму контактов ниже');
        });
    });
});

/* ============ Scroll анимации ============ */
function setupScrollAnimations() {
    // Проверяем поддержку Intersection Observer
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll(
            '.stat-card, .process-card, .gallery-item, .review-card, .timeline-item'
        ).forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    }
}

/* ============ Плавная прокрутка для кнопок ============ */
document.addEventListener('DOMContentLoaded', function() {
    // Кнопка "Музыка" в hero
    const musicBtn = document.querySelector('a[href="#beats"]');
    if (musicBtn) {
        musicBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const beatsSection = document.getElementById('beats');
            const offsetTop = beatsSection.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    }
});

/* ============ Parallax эффект ============ */
window.addEventListener('scroll', function() {
    const heroBg = document.querySelector('.hero-bg-image');
    if (heroBg) {
        const scrollPosition = window.scrollY;
        heroBg.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});

/* ============ Активная навигация при прокрутке ============ */
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.style.color = 'var(--text-light)');
            const activeLink = document.querySelector(`.nav-links a[href="#${section.id}"]`);
            if (activeLink) {
                activeLink.style.color = 'var(--accent)';
            }
        }
    });
});

// Экспорт для использования в других скриптах если потребуется
window.beatmakerSite = {
    playBeat,
    loadBeats,
    showNotification
};
