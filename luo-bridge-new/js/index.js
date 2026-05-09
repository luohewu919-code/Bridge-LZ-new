const avatarContainer = document.getElementById('avatarContainer');
const avatarDropdown = document.getElementById('avatarDropdown');
const avatarOptions = document.querySelectorAll('.avatar-option');
const avatarImg = document.getElementById('avatarImg');
const STORAGE_KEY = 'luoyang_bridge_avatar';

// ========== AI 对话框悬停逻辑 ==========
const petBtn = document.getElementById('aiPetBtn');
const aiWindow = document.getElementById('aiChatWindow');
let hideTimeout;

function showAiWindow() {
    if (hideTimeout) clearTimeout(hideTimeout);
    if (aiWindow) aiWindow.style.display = 'block';
}

function hideAiWindow() {
    hideTimeout = setTimeout(() => {
        if (aiWindow && !aiWindow.matches(':hover')) {
            aiWindow.style.display = 'none';
        }
    }, 200);
}

if (petBtn && aiWindow) {
    petBtn.addEventListener('mouseenter', showAiWindow);
    petBtn.addEventListener('mouseleave', hideAiWindow);
    aiWindow.addEventListener('mouseenter', () => {
        if (hideTimeout) clearTimeout(hideTimeout);
    });
    aiWindow.addEventListener('mouseleave', hideAiWindow);
}

function showDropdown(show) {
    if (show) avatarDropdown.classList.add('show');
    else avatarDropdown.classList.remove('show');
}

function setEmojiAvatar(emoji) {
    avatarContainer.innerHTML = `<div class="fallback-icon" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 1.2em;">${emoji}</div>`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: 'emoji', value: emoji }));
}

function setImageAvatar(src) {
    avatarContainer.innerHTML = '';
    const img = document.createElement('img');
    img.id = 'avatarImg';
    img.src = src;
    img.alt = 'logo';
    img.onerror = () => setEmojiAvatar('🌉');
    avatarContainer.appendChild(img);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: 'image', value: src }));
}

function loadAvatar() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.type === 'image' && data.value) setImageAvatar(data.value);
        else if (data.type === 'emoji' && data.value) setEmojiAvatar(data.value);
    } catch(e) {}
}

avatarContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    showDropdown(!avatarDropdown.classList.contains('show'));
});

avatarOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const emoji = opt.getAttribute('data-emoji');
        if (emoji) setEmojiAvatar(emoji);
        showDropdown(false);
    });
});

document.addEventListener('click', (e) => {
    if (!avatarContainer.contains(e.target) && !avatarDropdown.contains(e.target)) showDropdown(false);
});

loadAvatar();

// ========== 桥梁 iframe 滚动监听 ==========
const bridgeIframe = document.getElementById('bridgeIframe');
const bridgeWrapper = document.getElementById('bridgeIframeWrapper');

let hasDrawn = false;
let scrollTimer = null;

function checkBridgeVisibility() {
    if (!bridgeWrapper || !bridgeIframe || hasDrawn) return;
    const rect = bridgeWrapper.getBoundingClientRect();
    const isBottomNearViewport = rect.bottom < window.innerHeight + 100 && rect.bottom > 0;

    if (isBottomNearViewport) {
        console.log('桥梁区域滚到底部附近，开始绘制桥梁');
        bridgeIframe.contentWindow.postMessage('replayBridge', '*');
        hasDrawn = true;
    }
}

window.addEventListener('scroll', function() {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(checkBridgeVisibility, 100);
});
setTimeout(checkBridgeVisibility, 500);

// ========== 视频播放器 ==========
(function() {
    const curtainWrapper = document.getElementById('curtainWrapper');
    const iframeContainer = document.getElementById('iframeContainer');
    const slider = document.getElementById('curtainSlider');
    const valueSpan = document.getElementById('sliderValue');

    const video = document.getElementById('curtainVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBarArea');
    const progressFill = document.getElementById('progressFillBar');
    const currentTimeSpan = document.getElementById('currentTimeDisplay');
    const durationSpan = document.getElementById('durationDisplay');
    const volumeSliderElem = document.getElementById('volumeSlider');
    const speedSelect = document.getElementById('speedSelect');
    const resetBtn = document.getElementById('resetVideoBtn');
    const fullscreenBtn = document.getElementById('fullscreenVideoBtn');

    let isDraggingProgress = false;
    let lastAutoScrolled = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateProgressUI() {
        if (!isDraggingProgress && video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            progressFill.style.width = percent + '%';
            currentTimeSpan.innerText = formatTime(video.currentTime);
        }
    }

    function togglePlayPause() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '⏸';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '▶';
        }
    }

    function getMaxWidth() {
        return iframeContainer.clientWidth * 0.95;
    }

    function updateCurtain(percent) {
        percent = Math.min(100, Math.max(0, percent));
        const maxW = getMaxWidth();
        const minW = 30;
        const width = minW + (percent / 100) * (maxW - minW);
        curtainWrapper.style.width = width + 'px';
        valueSpan.innerText = percent + '%';
        if (slider.value != percent) slider.value = percent;
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    video.addEventListener('click', togglePlayPause);
    video.addEventListener('play', () => playPauseBtn.innerHTML = '⏸');
    video.addEventListener('pause', () => playPauseBtn.innerHTML = '▶');
    video.addEventListener('timeupdate', updateProgressUI);
    video.addEventListener('loadedmetadata', () => {
        durationSpan.innerText = formatTime(video.duration);
    });

    progressBar.addEventListener('mousedown', (e) => {
        isDraggingProgress = true;
        const rect = progressBar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.min(rect.width, Math.max(0, x));
        const percent = (x / rect.width) * 100;
        progressFill.style.width = percent + '%';
        video.currentTime = (percent / 100) * video.duration;
        document.addEventListener('mousemove', onProgressMove);
        document.addEventListener('mouseup', onProgressUp);
        e.preventDefault();
    });

    function onProgressMove(e) {
        const rect = progressBar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.min(rect.width, Math.max(0, x));
        const percent = (x / rect.width) * 100;
        progressFill.style.width = percent + '%';
        if (isDraggingProgress) {
            video.currentTime = (percent / 100) * video.duration;
        }
    }

    function onProgressUp() {
        isDraggingProgress = false;
        document.removeEventListener('mousemove', onProgressMove);
        document.removeEventListener('mouseup', onProgressUp);
    }

    volumeSliderElem.addEventListener('input', (e) => {
        video.volume = parseFloat(e.target.value);
        if (video.muted && video.volume > 0) video.muted = false;
    });
    video.volume = 0.8;

    speedSelect.addEventListener('change', (e) => {
        video.playbackRate = parseFloat(e.target.value);
    });

    resetBtn.addEventListener('click', () => {
        video.currentTime = 0;
        video.playbackRate = 1;
        speedSelect.value = '1';
        video.volume = 0.8;
        volumeSliderElem.value = '0.8';
        if (video.muted) video.muted = false;
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '⏸';
        }
    });

    function toggleFullscreen() {
        const container = document.querySelector('.video-player-container');
        if (!document.fullscreenElement) {
            container.requestFullscreen();
            fullscreenBtn.innerHTML = '✖';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '⛶';
        }
    }
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement ? '✖' : '⛶';
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement !== speedSelect) {
            e.preventDefault();
            togglePlayPause();
        }
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
        }
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
        }
    });

    slider.addEventListener('input', function() {
        const percent = parseFloat(slider.value);
        updateCurtain(percent);

        if (percent >= 100) {
            if (video.paused) {
                video.play().then(() => {
                    playPauseBtn.innerHTML = '⏸';
                }).catch(e => console.log('自动播放被阻止'));
            }
            if (!lastAutoScrolled) {
                const bridgeStage = document.getElementById('bridgeStage');
                if (bridgeStage) {
                    bridgeStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    lastAutoScrolled = true;
                    setTimeout(() => { lastAutoScrolled = false; }, 800);
                }
            }
        } else {
            if (!video.paused) {
                video.pause();
                playPauseBtn.innerHTML = '▶';
            }
            lastAutoScrolled = false;
        }
    });

    window.addEventListener('resize', function() {
        updateCurtain(parseFloat(slider.value));
    });

    slider.value = 0;
    updateCurtain(0);
    video.pause();
    playPauseBtn.innerHTML = '▶';

    const triggerBtn = document.getElementById('triggerBridgeBtn');
    const bridgeStage = document.getElementById('bridgeStage');
    const bridgeIframe = document.getElementById('bridgeIframe');
    if (triggerBtn && bridgeStage) {
        triggerBtn.addEventListener('click', function() {
            bridgeStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function() {
                if (bridgeIframe && bridgeIframe.contentWindow) {
                    bridgeIframe.contentWindow.postMessage('replayBridge', '*');
                }
            }, 500);
        });
    }
})();

// ========== 卡片横向滚动 ==========
const cardsWrapper = document.getElementById('cardsWrapper');
const cardsTrack = document.getElementById('cardsTrack');
const cardsNav = document.getElementById('cardsNav');
const cardsCounter = document.getElementById('cardsCounter');

const cards = document.querySelectorAll('.card');
const totalCards = cards.length;

let currentCardIndex = 0;
let isCardAnimating = false;
let hasAutoCentered = false;

// 绑定点击翻转事件
cards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('flipped');
    });
});

// 提示按钮
const tipBtn = document.getElementById('tipBtn');
if (tipBtn) {
    tipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const navDots = document.getElementById('cardsNav');
        if (navDots) {
            window.scrollTo({ top: 1160, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 650, behavior: 'smooth' });
        }
        setTimeout(() => {
            const initialScroll = getScrollLeftForCard(0);
            if (cardsTrack) cardsTrack.scrollLeft = initialScroll;
            updateCardUI();
            hasAutoCentered = true;
        }, 800);
    });
}

// 生成导航点
for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('div');
    dot.classList.add('cards-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        if (isCardAnimating) return;
        goToCard(i);
    });
    cardsNav.appendChild(dot);
}

function updateCardUI() {
    const dots = document.querySelectorAll('.cards-dot');
    dots.forEach((dot, i) => {
        if (i === currentCardIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    if (cardsCounter) {
        cardsCounter.innerHTML = `<span>${currentCardIndex + 1}</span> / ${totalCards}`;
    }
}

function getScrollLeftForCard(index) {
    const card = cards[index];
    if (!card) return 0;
    const trackRect = cardsTrack.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const currentScroll = cardsTrack.scrollLeft;
    const cardLeftRelative = cardRect.left - trackRect.left;
    const targetOffset = cardLeftRelative - (trackRect.width / 2) + (cardRect.width / 2);
    return currentScroll + targetOffset;
}

function goToCard(index) {
    if (index < 0) index = 0;
    if (index >= totalCards) index = totalCards - 1;
    if (index === currentCardIndex) return;
    if (isCardAnimating) return;
    
    isCardAnimating = true;
    currentCardIndex = index;
    const targetScroll = getScrollLeftForCard(currentCardIndex);
    cardsTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
    updateCardUI();
    setTimeout(() => { isCardAnimating = false; }, 500);
}

function nextCard() {
    if (currentCardIndex < totalCards - 1) {
        goToCard(currentCardIndex + 1);
        return true;
    }
    return false;
}

// 记录卡片区域边界
let sectionTop = 0, sectionBottom = 0;
function updateSectionRect() {
    if (!cardsWrapper) return;
    const rect = cardsWrapper.getBoundingClientRect();
    sectionTop = rect.top;
    sectionBottom = rect.bottom;
}
function isInCardSection() {
    updateSectionRect();
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    const sectionTopAbs = sectionTop + window.scrollY;
    const sectionBottomAbs = sectionBottom + window.scrollY;
    return viewportCenter >= sectionTopAbs && viewportCenter <= sectionBottomAbs;
}

// 滚轮处理
let lastWheelTime = 0;
const WHEEL_COOLDOWN = 500;

function onCardWheel(e) {
    updateSectionRect();
    const inSection = isInCardSection();
    if (!inSection) return;
    
    const now = Date.now();
    if (now - lastWheelTime < WHEEL_COOLDOWN) {
        e.preventDefault();
        return;
    }
    
    const deltaY = e.deltaY;
    if (deltaY > 0) {
        const hasNext = nextCard();
        if (hasNext) {
            e.preventDefault();
            lastWheelTime = now;
        }
    }
}

// 手动滚动停止后自动吸附
let scrollTimeout = null;
function onTrackScroll() {
    if (isCardAnimating) return;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => snapToNearestCard(), 150);
}

function snapToNearestCard() {
    if (isCardAnimating) return;
    const trackRect = cardsTrack.getBoundingClientRect();
    let minDistance = Infinity;
    let nearestIndex = 0;
    cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const viewportCenter = trackRect.left + trackRect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = idx;
        }
    });
    if (nearestIndex !== currentCardIndex) {
        currentCardIndex = nearestIndex;
        updateCardUI();
    }
    const targetScroll = getScrollLeftForCard(nearestIndex);
    cardsTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

function checkAndCenterFirstCard() {
    if (hasAutoCentered) return;
    if (isInCardSection()) {
        const initialScroll = getScrollLeftForCard(0);
        if (cardsTrack) cardsTrack.scrollLeft = initialScroll;
        updateCardUI();
        hasAutoCentered = true;
    }
}

if (cardsTrack) cardsTrack.addEventListener('scroll', onTrackScroll);
window.addEventListener('wheel', onCardWheel, { passive: false });
window.addEventListener('scroll', () => {
    updateSectionRect();
    checkAndCenterFirstCard();
});
window.addEventListener('resize', () => {
    setTimeout(() => {
        snapToNearestCard();
        updateSectionRect();
    }, 100);
});

setTimeout(() => {
    const initialScroll = getScrollLeftForCard(0);
    if (cardsTrack) cardsTrack.scrollLeft = initialScroll;
    updateCardUI();
    updateSectionRect();
}, 100);

// ========== 雾气覆盖逻辑 + 时间轴 ==========
(function() {
    const cardsWrapper = document.getElementById('cardsWrapper');
    const mistContainer = document.getElementById('mistOverlayContainer');
    const mistOverlay = document.getElementById('mistOverlay');
    const mistInfo = document.getElementById('mistInfo');
    const maskImage = document.getElementById('maskImage');
    const timelineWrapper = document.getElementById('timelineWrapper');
    
    if (!cardsWrapper || !mistOverlay) return;
    
    let cardsBottomReached = false;
    
    function getCardsBottom() {
        return cardsWrapper.offsetTop + cardsWrapper.offsetHeight;
    }
    
    function checkAndUpdateMist() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const cardsBottom = getCardsBottom();
        
        const hasSeenCardsBottom = scrollY + windowHeight > cardsBottom - 200;
        
        if (hasSeenCardsBottom && !cardsBottomReached) {
            cardsBottomReached = true;
            mistContainer.style.visibility = 'visible';
        }
        
        if (cardsBottomReached) {
            const overflow = Math.max(0, scrollY + windowHeight - cardsBottom);
            const maxOverflow = 400;
            let progress = Math.min(1, overflow / maxOverflow);
            
            const heightPercent = progress * 100;
            mistOverlay.style.height = heightPercent + '%';
            mistInfo.textContent = `🌫️ 雾气弥漫: ${Math.floor(heightPercent)}%`;
            
            if (maskImage) {
                let moveY = heightPercent * 1.5;
                moveY = Math.min(moveY, 80);
                maskImage.style.transform = `translateY(-${moveY}px)`;
                maskImage.style.opacity = Math.min(0.9, progress + 0.2);
            }
            
            // 雾气上涨时显示时间轴
            if (timelineWrapper && progress > 0.05) {
                timelineWrapper.classList.add('visible');
                
                const timelineItems = document.querySelectorAll('.timeline-item');
                const itemProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.95));
                timelineItems.forEach((item, idx) => {
                    const threshold = (idx + 1) / timelineItems.length;
                    if (itemProgress >= threshold - 0.08) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
            
            if (progress >= 0.99) {
                mistInfo.innerHTML = `🌫️ 雾气已笼罩古桥 🌫️`;
            }
        } else {
            if (maskImage) {
                maskImage.style.transform = `translateY(0px)`;
                maskImage.style.opacity = '0';
            }
        }
    }
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(checkAndUpdateMist);
    });
    window.addEventListener('resize', checkAndUpdateMist);
    checkAndUpdateMist();
})();

// ========== 3D 打开/关闭逻辑 ==========
const openBtn = document.getElementById('openModelBtn');
const closeBtn = document.getElementById('closeModelBtn');
const modelPage = document.getElementById('modelPage');
const modelIframe = document.getElementById('modelIframe');
const modelLoading = document.getElementById('modelLoading');

let modelLoaded = false;

function openModel() {
    if (!modelPage) return;
    modelPage.style.display = 'block';
    
    if (!modelLoaded && modelIframe) {
        if (modelLoading) modelLoading.style.display = 'flex';
        modelIframe.style.display = 'none';
        modelIframe.src = './luo-3d/Untitled-1.html';
        
        modelIframe.onload = function() {
            if (modelLoading) modelLoading.style.display = 'none';
            modelIframe.style.display = 'block';
            modelLoaded = true;
        };
        
        setTimeout(() => {
            if (modelLoading && modelLoading.style.display !== 'none') {
                modelLoading.style.display = 'none';
                modelIframe.style.display = 'block';
                modelLoaded = true;
            }
        }, 8000);
    } else {
        if (modelLoading) modelLoading.style.display = 'none';
        if (modelIframe) modelIframe.style.display = 'block';
    }
}

function closeModel() {
    if (modelPage) modelPage.style.display = 'none';
    if (modelIframe) {
        modelIframe.src = 'about:blank';
        modelIframe.style.display = 'none';
        modelLoaded = false;
    }
    if (modelLoading) modelLoading.style.display = 'flex';
}

if (openBtn) openBtn.addEventListener('click', openModel);
if (closeBtn) closeBtn.addEventListener('click', closeModel);

// ========== 宠物副本的 AI 对话框悬停逻辑 ==========
(function() {
    const petClone = document.getElementById('petClone');
    const aiWindow = document.getElementById('aiChatWindow');
    let hideTimeout;

    if (!petClone || !aiWindow) return;

    function showAiWindow() {
        if (hideTimeout) clearTimeout(hideTimeout);
        aiWindow.style.display = 'block';
    }

    function hideAiWindow() {
        hideTimeout = setTimeout(() => {
            if (aiWindow && !aiWindow.matches(':hover')) {
                aiWindow.style.display = 'none';
            }
        }, 200);
    }

    petClone.addEventListener('mouseenter', showAiWindow);
    petClone.addEventListener('mouseleave', hideAiWindow);
    aiWindow.addEventListener('mouseenter', () => {
        if (hideTimeout) clearTimeout(hideTimeout);
    });
    aiWindow.addEventListener('mouseleave', hideAiWindow);
})();
// ========== 四张卡片滚动动画（有时间差地向上移动）- 修正版 ==========
        (function() {
            const coreSection = document.querySelector('.core');
            const cards = document.querySelectorAll('.floating-card');
            
            if (!coreSection || cards.length === 0) {
                console.log('卡片动画：未找到 .core 或卡片元素，共找到', cards.length, '张卡片');
                return;
            }
            
            console.log('🎴 卡片动画已初始化，共', cards.length, '张卡片');
            
            let animationTriggered = false;
            
            function triggerAnimation() {
                if (animationTriggered) return;
                animationTriggered = true;
                console.log('🎴 卡片动画已触发！');
                
                cards.forEach((card, index) => {
                    const delay = index * 180; // 0ms, 180ms, 360ms, 540ms 依次出现
                    setTimeout(() => {
                        card.classList.add('animate-in');
                        console.log(`✅ 卡片${index+1} (${card.querySelector('h4')?.innerText || ''}) 动画已添加`);
                    }, delay);
                });
            }
            
            function checkAndAnimate() {
                if (animationTriggered) return;
                
                const rect = coreSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const scrollY = window.scrollY;
                
                // 条件1：core 区域顶部进入视口
                const isTopVisible = rect.top < windowHeight - 80;
                // 条件2：页面滚动超过 core 区域位置
                const isScrolledPast = scrollY + windowHeight > coreSection.offsetTop + 100;
                
                if (isTopVisible || isScrolledPast) {
                    triggerAnimation();
                }
            }
            
            // 监听滚动
            window.addEventListener('scroll', () => {
                requestAnimationFrame(checkAndAnimate);
            });
            
            // 页面加载后多次检查（确保触发）
            window.addEventListener('load', () => {
                setTimeout(checkAndAnimate, 300);
                setTimeout(checkAndAnimate, 1000);
            });
            
            // 立即检查一次
            checkAndAnimate();
            
            // 额外：如果用户已经滚动过了，延迟再检查一次
            setTimeout(checkAndAnimate, 1500);
        })();
                // ========== 底部无限滑动卡片（鼠标悬停停止，离开继续） ==========
        (function() {
            const track = document.getElementById('sliderTrack');
            const wrapper = document.querySelector('.slider-wrapper');
            if (!track || !wrapper) return;

            // 克隆一组卡片实现无缝循环
            const originalCards = Array.from(document.querySelectorAll('.slider-card'));
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                track.appendChild(clone);
            });

            // 初始化所有卡片的进度条和点击事件
            function initCard(card) {
                const percent = parseInt(card.getAttribute('data-percent'));
                const circumference = 213.6;
                const offset = circumference - (percent / 100) * circumference;
                const fillCircle = card.querySelector('.progress-fill');
                if (fillCircle) {
                    fillCircle.style.strokeDashoffset = offset;
                }

                const name = card.getAttribute('data-name');
                const value = card.getAttribute('data-value');
                const detail = card.getAttribute('data-detail');

                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = card.classList.contains('show-detail');
                    // 关闭其他所有卡片的详情
                    document.querySelectorAll('.slider-card').forEach(c => c.classList.remove('show-detail'));
                    if (!isOpen) {
                        card.classList.add('show-detail');
                        const detailDiv = card.querySelector('.slider-detail');
                        if (detailDiv) {
                            detailDiv.innerHTML = `<span style="color:#d4b87a;">📌 ${name}: ${value}</span><br>${detail}`;
                        }
                    }
                });
            }

            document.querySelectorAll('.slider-card').forEach(initCard);

            // 获取所有卡片（包括克隆）
            const allCards = document.querySelectorAll('.slider-card');
            const cardWidth = 200 + 25; // 宽度 + gap
            let position = 0;
            let animationId = null;
            let isHovering = false;
            let speed = 0.8; // 移动速度（像素/帧）

            // 鼠标悬停停止
            wrapper.addEventListener('mouseenter', () => {
                isHovering = true;
            });
            wrapper.addEventListener('mouseleave', () => {
                isHovering = false;
            });

            function animateSlider() {
                if (!isHovering) {
                    position -= speed;
                    // 无缝循环：当移动超过一组卡片的宽度时重置
                    if (Math.abs(position) >= cardWidth * originalCards.length) {
                        position = 0;
                    }
                    track.style.transform = `translateX(${position}px)`;
                }
                animationId = requestAnimationFrame(animateSlider);
            }

            animateSlider();

            // 窗口大小改变时重新计算卡片宽度
            window.addEventListener('resize', () => {
                const newCardWidth = document.querySelector('.slider-card')?.offsetWidth || 200;
                speed = newCardWidth / 250; // 动态调整速度
            });
        })();