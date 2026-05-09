// ========== 开场动画：1秒后开始矩形→圆形→缩小至0（变换原点底部中心，无白色闪烁） ==========
(function() {
    const intro = document.getElementById('introOverlay');
    if (intro) {
        setTimeout(() => {
            intro.classList.add('animate-out');
            setTimeout(() => {
                intro.classList.add('hidden-intro');
            }, 1000); // 与transition时长同步
        }, 1000); // 停留1秒后开始动画
    }
})();

// ========== start.js 完整逻辑（带极简过渡、无白盒、跳转 zhao-bridge-new/index.html） ==========
(function() {
    const login = document.querySelector('.login');
    const nicknameInput = document.querySelector('#nicknameInput');
    const startBtn = document.getElementById('startBtn');
    const loginForm = document.getElementById('loginForm');

    let span;
    let inTime, outTime;
    let isIn = true;
    let isOut;

    function showMessage(text, isError = false) {
        const oldMsg = document.querySelector('.toast-message');
        if (oldMsg) oldMsg.remove();

        const msg = document.createElement('div');
        msg.className = 'toast-message';
        msg.textContent = text;
        
        msg.style.cssText = `
            position: fixed;
            top: 30px;
            right: -400px;
            background: ${isError ? '#c0392b' : '#0cf'};
            color: ${isError ? 'white' : '#000'};
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-family: system-ui, 'Segoe UI', sans-serif;
            z-index: 9999;
            box-shadow: 0 6px 18px rgba(0,0,0,0.25);
            transition: right 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            backdrop-filter: blur(4px);
            letter-spacing: 1px;
            font-weight: 500;
            border-left: 4px solid rgba(255,255,255,0.6);
        `;
        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.right = '30px';
        }, 10);

        setTimeout(() => {
            msg.style.right = '-400px';
            setTimeout(() => {
                if (msg && msg.parentNode) msg.remove();
            }, 350);
        }, 2800);
    }

    function saveNickname(nickname) {
        localStorage.setItem('userNickname', nickname);
        showMessage(`✔️ 昵称「${nickname}」已保存`);
    }

    // ✅ 修改跳转路径为正确的目标
    function performRedirect() {
        const nickname = nicknameInput.value.trim();
        if (!nickname) return false;
        saveNickname(nickname);
        
        setTimeout(() => {
            // ✅ 修改为正确的路径 - 跳转到 zhao-bridge-new/index.html
            window.location.href = './zhao-bridge-new/index.html';
        }, 260);
        return true;
    }

    // 点击事件
    startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performRedirect();
    });

    // 按回车键跳转
    if (loginForm) {
        loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performRedirect();
            }
        });
    }
    if (nicknameInput) {
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performRedirect();
            }
        });
    }

    // 波纹动画（完整保留）
    login.addEventListener('mouseenter', function (e) {
        isOut = false;
        if (isIn) {
            inTime = new Date().getTime();
            span = document.createElement('span');
            login.appendChild(span);
            span.style.animation = 'in .5s ease-out forwards';
            let top = e.clientY - e.target.offsetTop;
            let left = e.clientX - e.target.offsetLeft;
            span.style.top = top + 'px';
            span.style.left = left + 'px';
            isIn = false;
            isOut = true;
        }
    });

    login.addEventListener('mouseleave', function (e) {
        if (isOut) {
            outTime = new Date().getTime();
            let passTime = outTime - inTime;
            if (passTime < 500) {
                setTimeout(() => mouseleave(e), 500 - passTime);
            } else {
                mouseleave(e);
            }
        }
        function mouseleave(e) {
            if (!span) return;
            span.style.animation = 'out .5s ease-out forwards';
            let top = e.clientY - e.target.offsetTop;
            let left = e.clientX - e.target.offsetLeft;
            span.style.top = top + 'px';
            span.style.left = left + 'px';
            setTimeout(() => {
                if (span && login.contains(span)) {
                    login.removeChild(span);
                }
                isIn = true;
            }, 500);
        }
    });
})();

// ========== 动画交互逻辑（完整保留） ==========
(function(){
    const leftTable = document.getElementById('leftTable');
    const rightTable = document.getElementById('rightTable');
    const leftMsg = document.getElementById('leftMsg');
    const rightMsgContainer = document.getElementById('rightMsgContainer');
    const container = document.getElementById('animContainer');
    let leftHideTimer = null;
    let isLeftMsgVisible = false;
    
    function hideLeftMessageWithAnimation() {
        if (!leftMsg) return;
        if (!isLeftMsgVisible && leftMsg.style.display !== 'block') return;
        if (leftHideTimer) clearTimeout(leftHideTimer);
        leftMsg.classList.remove('show');
        leftMsg.style.display = 'none';
        isLeftMsgVisible = false;
    }
    
    function showLeftMessage() {
        if (!leftMsg || !leftTable) return;
        if (isLeftMsgVisible) {
            leftMsg.style.display = 'none';
            leftMsg.classList.remove('show');
            isLeftMsgVisible = false;
            if (leftHideTimer) clearTimeout(leftHideTimer);
        }
        const frontRect = leftTable.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const msgWidth = leftMsg.offsetWidth || 130;
        let leftPos = frontRect.left - containerRect.left + (frontRect.width - msgWidth) / 2;
        let topPos = frontRect.top - containerRect.top - 28;
        leftPos = Math.min(Math.max(leftPos, 8), container.offsetWidth - msgWidth - 8);
        if (topPos < 6) topPos = 6;
        leftMsg.style.left = leftPos + 'px';
        leftMsg.style.top = topPos + 'px';
        leftMsg.classList.remove('show');
        void leftMsg.offsetWidth;
        leftMsg.style.display = 'block';
        leftMsg.classList.add('show');
        isLeftMsgVisible = true;
        if (leftHideTimer) clearTimeout(leftHideTimer);
        leftHideTimer = setTimeout(() => {
            if (isLeftMsgVisible) hideLeftMessageWithAnimation();
        }, 2800);
    }
    
    let rightMsgActive = false;
    
    function positionRightMessage() {
        if (!rightTable || !rightMsgContainer) return;
        const rect = rightTable.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        let leftPos = rect.right - containerRect.left - 8;
        let topPos = rect.top - containerRect.top - 12;
        leftPos = Math.min(Math.max(leftPos, 5), container.offsetWidth - 28);
        topPos = Math.min(Math.max(topPos, 5), container.offsetHeight - 40);
        rightMsgContainer.style.left = leftPos + 'px';
        rightMsgContainer.style.top = topPos + 'px';
    }
    
    function showRightMessageBox() {
        if (!rightMsgContainer) return;
        if (rightMsgActive) {
            rightMsgContainer.classList.remove('revealed');
            const svgIcon = rightMsgContainer.querySelector('.svg-icon-bridge');
            if (svgIcon) svgIcon.style.opacity = '0';
            rightMsgContainer.style.display = 'none';
            rightMsgActive = false;
        }
        positionRightMessage();
        rightMsgContainer.classList.remove('revealed');
        const svgIconElem = rightMsgContainer.querySelector('.svg-icon-bridge');
        if (svgIconElem) svgIconElem.style.opacity = '0';
        rightMsgContainer.style.display = 'flex';
        rightMsgActive = true;
    }
    
    function onRightMessageClick(e) {
        e.stopPropagation();
        if (!rightMsgContainer) return;
        if (!rightMsgActive) return;
        if (rightMsgContainer.classList.contains('revealed')) return;
        rightMsgContainer.classList.add('revealed');
        const svgIcon = rightMsgContainer.querySelector('.svg-icon-bridge');
        if (svgIcon) svgIcon.style.opacity = '1';
    }
    
    function hideRightMessageBox() {
        if (!rightMsgContainer) return;
        if (!rightMsgActive) return;
        rightMsgContainer.classList.remove('revealed');
        const svgIcon = rightMsgContainer.querySelector('.svg-icon-bridge');
        if (svgIcon) svgIcon.style.opacity = '0';
        rightMsgContainer.style.display = 'none';
        rightMsgActive = false;
    }
    
    function onLeftTableClick(e) {
        e.stopPropagation();
        leftTable.classList.add('click-scale-anim');
        setTimeout(() => leftTable.classList.remove('click-scale-anim'), 2000);
        if (rightMsgActive) hideRightMessageBox();
        showLeftMessage();
    }
    
    function onRightTableClick(e) {
        e.stopPropagation();
        rightTable.classList.add('right-click-scale');
        setTimeout(() => rightTable.classList.remove('right-click-scale'), 2100);
        if (isLeftMsgVisible) hideLeftMessageWithAnimation();
        showRightMessageBox();
    }
    
    function onDocumentClick(e) {
        const isLeftTableClick = leftTable && leftTable.contains(e.target);
        const isRightTableClick = rightTable && rightTable.contains(e.target);
        const isRightMsgClick = rightMsgContainer && rightMsgContainer.contains(e.target);
        if (isRightMsgClick && rightMsgActive && rightMsgContainer) {
            onRightMessageClick(e);
            return;
        }
        if (!isLeftTableClick && !isRightTableClick) {
            if (isLeftMsgVisible) hideLeftMessageWithAnimation();
            if (rightMsgActive) hideRightMessageBox();
        }
    }
    
    const magnifier = document.getElementById('techGlass');
    let angle = 0;
    function updateMagnifierCircle() {
        if (!rightTable) return;
        const rect = rightTable.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width/2;
        const centerY = rect.top - containerRect.top + rect.height/2;
        const radius = 42;
        angle = (angle + 0.022) % (Math.PI * 2);
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius * 0.6;
        let x = centerX + offsetX + 6;
        let y = centerY + offsetY - 6;
        x = Math.min(Math.max(x, 8), container.offsetWidth - 44);
        y = Math.min(Math.max(y, 12), container.offsetHeight - 48);
        magnifier.style.left = x + 'px';
        magnifier.style.top = y + 'px';
        requestAnimationFrame(updateMagnifierCircle);
    }
    
    window.addEventListener('resize', () => {
        if (rightMsgActive) positionRightMessage();
    });
    
    if (leftTable) leftTable.addEventListener('click', onLeftTableClick);
    if (rightTable) rightTable.addEventListener('click', onRightTableClick);
    document.addEventListener('click', onDocumentClick);
    updateMagnifierCircle();
    
    if (rightMsgContainer) {
        rightMsgContainer.style.display = 'none';
        rightMsgContainer.style.position = 'absolute';
        rightMsgContainer.style.cursor = 'pointer';
        rightMsgContainer.style.width = '20px';
        rightMsgContainer.style.height = '20px';
        rightMsgContainer.style.alignItems = 'center';
        rightMsgContainer.style.justifyContent = 'center';
        rightMsgContainer.style.borderRadius = '50%';
    }
})();

// ========== 鼠标进入登录框的交互 + 左按钮禁用逻辑 ==========
(function() {
    const loginWrapper = document.getElementById('loginWrapper');
    const animationWrapper = document.getElementById('animationWrapper');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    function updateLeftButtonState() {
        if (!btnLeft) return;
        if (loginWrapper.classList.contains('center-mode')) {
            btnLeft.classList.add('disabled');
        } else {
            btnLeft.classList.remove('disabled');
        }
    }
    
    loginWrapper.addEventListener('mouseenter', function() {
        loginWrapper.classList.add('center-mode');
        animationWrapper.classList.add('active-move');
        loginWrapper.classList.remove('move-left');
        animationWrapper.classList.remove('move-left');
        updateLeftButtonState();
    });
    
    const observer = new MutationObserver(function() {
        updateLeftButtonState();
    });
    observer.observe(loginWrapper, { attributes: true, attributeFilter: ['class'] });
    
    document.addEventListener('click', function(e) {
        const isClickOnLogin = loginWrapper.contains(e.target);
        const isClickOnAnimation = animationWrapper.contains(e.target);
        const isClickOnBtnLeft = btnLeft && btnLeft.contains(e.target);
        const isClickOnBtnRight = btnRight && btnRight.contains(e.target);
        
        if (isClickOnBtnLeft || isClickOnBtnRight) return;
        
        if (!isClickOnLogin && !isClickOnAnimation) {
            loginWrapper.classList.remove('center-mode');
            loginWrapper.classList.remove('move-left');
            animationWrapper.classList.remove('active-move');
            animationWrapper.classList.remove('move-left');
            updateLeftButtonState();
        }
    });
    
    updateLeftButtonState();
})();

// ========== 左右按钮控制逻辑 ==========
(function() {
    const loginWrapper = document.getElementById('loginWrapper');
    const animationWrapper = document.getElementById('animationWrapper');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    btnLeft.addEventListener('mouseenter', function(e) {
        e.stopPropagation();
        if (btnLeft.classList.contains('disabled')) return;
        loginWrapper.classList.remove('center-mode');
        animationWrapper.classList.remove('active-move');
        loginWrapper.classList.add('move-left');
        animationWrapper.add('move-left');
    });
    
    btnRight.addEventListener('mouseenter', function(e) {
        e.stopPropagation();
        loginWrapper.classList.remove('center-mode');
        loginWrapper.classList.remove('move-left');
        animationWrapper.classList.remove('active-move');
        animationWrapper.classList.remove('move-left');
    });
})();

// ========== 小圆沿着隐藏路径涌动 + 脉动缩放（无限循环） ==========
(function() {
    const hiddenPath = document.getElementById('hiddenSmoothCurve');
    if (!hiddenPath) return;
    
    let movingDot = null;
    let animFrame = null;
    let dotActive = false;
    
    let pathLen = 0;
    try {
        pathLen = hiddenPath.getTotalLength();
    } catch(e) { return; }
    
    let activeToast = null;
    let hideToastTimer = null;
    let hasShownMessage = false;
    
    function showSimpleMessage(endX, endY) {
        if (hasShownMessage) return;
        if (activeToast) {
            if (hideToastTimer) clearTimeout(hideToastTimer);
            const oldToast = activeToast;
            oldToast.classList.add('bubble-out');
            setTimeout(() => {
                if (oldToast && oldToast.parentNode) oldToast.remove();
                if (activeToast === oldToast) activeToast = null;
                createSimpleToast(endX, endY);
            }, 300);
        } else {
            createSimpleToast(endX, endY);
        }
        hasShownMessage = true;
    }
    
    function createSimpleToast(x, y) {
        const toast = document.createElement('div');
        toast.className = 'bubble-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                <span style="flex:1;">✨ 灵境回响 · 探索数字彼岸 ✨</span>
                <span class="hint-arrow">👉</span>
            </div>
            <div class="deco-rect"></div>
            <div class="deco-circle"></div>
        `;
        toast.style.left = (x + 15) + 'px';
        toast.style.top = (y - 60) + 'px';
        document.body.appendChild(toast);
        activeToast = toast;
        
        toast.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeToast === toast) {
                toast.classList.add('bubble-out');
                setTimeout(() => {
                    if (toast && toast.parentNode) toast.remove();
                    if (activeToast === toast) activeToast = null;
                }, 300);
            }
        });
        
        hideToastTimer = setTimeout(() => {
            if (activeToast === toast) {
                toast.classList.add('bubble-out');
                setTimeout(() => toast.remove(), 350);
                if (activeToast === toast) activeToast = null;
            }
            hideToastTimer = null;
        }, 4500);
    }
    
    function getPointAtPercent(percent) {
        if (!hiddenPath) return { x: 100, y: window.innerHeight - 100 };
        const dist = percent * pathLen;
        const point = hiddenPath.getPointAtLength(dist);
        const baseLeft = 30;
        const baseBottom = window.innerHeight - 80;
        const virtualW = 520, virtualH = 320;
        const screenX = baseLeft + (point.x / virtualW) * 360;
        const screenY = baseBottom - (point.y / virtualH) * 200;
        return { x: screenX, y: screenY };
    }
    
    function removeDot() {
        if (movingDot && movingDot.parentNode) movingDot.remove();
        movingDot = null;
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = null;
        dotActive = false;
    }
    
    function startDotJourney() {
        removeDot();
        movingDot = document.createElement('div');
        movingDot.className = 'pulsing-dot';
        document.body.appendChild(movingDot);
        dotActive = true;
        const startPos = getPointAtPercent(0);
        movingDot.style.left = (startPos.x - 8) + 'px';
        movingDot.style.top = (startPos.y - 8) + 'px';
        
        const startTime = performance.now();
        const duration = 2700;
        
        function step(now) {
            if (!dotActive || !movingDot) return;
            const elapsed = now - startTime;
            let t = Math.min(1, elapsed / duration);
            const pos = getPointAtPercent(t);
            movingDot.style.left = (pos.x - 8) + 'px';
            movingDot.style.top = (pos.y - 8) + 'px';
            
            if (t >= 1.0) {
                const endPos = getPointAtPercent(1);
                if (!hasShownMessage) {
                    showSimpleMessage(endPos.x, endPos.y);
                }
                removeDot();
                setTimeout(() => {
                    startDotJourney();
                }, 3500);
                return;
            }
            animFrame = requestAnimationFrame(step);
        }
        animFrame = requestAnimationFrame(step);
    }
    
    setTimeout(() => {
        if (pathLen > 0) startDotJourney();
    }, 500);
    
    document.body.addEventListener('click', (e) => {
        if (e.target === movingDot && movingDot) {
            const rect = movingDot.getBoundingClientRect();
            if (!hasShownMessage) {
                showSimpleMessage(rect.left + 12, rect.top);
            }
        }
    });
})();

// ========== 原有菜单及登录框交互 ==========
(function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const loginWrapper = document.getElementById('loginWrapper');
    const animationWrapper = document.getElementById('animationWrapper');
    let activeBubble = null;
    let hideTimeout = null;

    function moveLoginToCenter() {
        if (loginWrapper) loginWrapper.classList.add('center-mode');
        if (animationWrapper) animationWrapper.classList.add('active-move');
    }

    function showBubble(message) {
        if (activeBubble) {
            if (hideTimeout) clearTimeout(hideTimeout);
            const oldBubble = activeBubble;
            oldBubble.classList.add('bubble-out');
            oldBubble.style.pointerEvents = 'none';
            setTimeout(() => {
                if (oldBubble && oldBubble.parentNode) oldBubble.remove();
                if (activeBubble === oldBubble) activeBubble = null;
                createAndShowNewBubble(message);
            }, 320);
        } else {
            createAndShowNewBubble(message);
        }
    }

    function createAndShowNewBubble(message) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-toast';
        bubble.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                <span style="flex:1;">✨ ${message}</span>
                <span class="hint-arrow">👉</span>
            </div>
            <div class="deco-rect"></div>
            <div class="deco-circle"></div>
        `;
        document.body.appendChild(bubble);
        bubble.addEventListener('click', (e) => {
            e.stopPropagation();
            const startBtn = document.querySelector('#startBtn');
            if (startBtn) {
                startBtn.style.transform = 'scale(1.05)';
                startBtn.style.boxShadow = '0 0 20px cyan';
                setTimeout(() => {
                    startBtn.style.transform = '';
                    startBtn.style.boxShadow = '';
                }, 400);
            }
        });
        activeBubble = bubble;
        hideTimeout = setTimeout(() => {
            if (activeBubble === bubble) {
                bubble.classList.add('bubble-out');
                setTimeout(() => {
                    if (bubble && bubble.parentNode) bubble.remove();
                    if (activeBubble === bubble) activeBubble = null;
                }, 350);
            }
            hideTimeout = null;
        }, 5800);
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            moveLoginToCenter();
            let menuText = this.innerText.trim();
            let message = '';
            switch(menuText) {
                case '遗产名录': message = '📖 探访千年遗产名录，故事静待开启。'; break;
                case '桥梁档案': message = '🌉 桥梁档案中蕴藏榫卯智慧，等你翻阅。'; break;
                case '历史文献': message = '📜 历史文献沉淀岁月，轻触出发即抵彼岸。'; break;
                case '数字展馆': message = '🏛️ 数字展馆即将呈现，点击出发漫游古今。'; break;
                case '关于项目': message = '✨ 项目汇聚文化遗产之光，与您共筑传承。'; break;
                default: message = `✨ 即将前往「${menuText}」，点击出发与我们同行。`;
            }
            showBubble(message);
        });
    });

    // 鼠标进入登录框 + 外部点击归位
    (function() {
        const loginWrapper = document.getElementById('loginWrapper');
        const animationWrapper = document.getElementById('animationWrapper');
        if (loginWrapper) {
            loginWrapper.addEventListener('mouseenter', function() {
                loginWrapper.classList.add('center-mode');
                if (animationWrapper) animationWrapper.classList.add('active-move');
            });
        }
        document.addEventListener('click', function(e) {
            const loginWrap = document.getElementById('loginWrapper');
            const animWrap = document.getElementById('animationWrapper');
            const isClickOnLogin = loginWrap && loginWrap.contains(e.target);
            const isClickOnAnimation = animWrap && animWrap.contains(e.target);
            const isClickOnBtnLeft = document.getElementById('btnLeft') && document.getElementById('btnLeft').contains(e.target);
            const isClickOnBtnRight = document.getElementById('btnRight') && document.getElementById('btnRight').contains(e.target);
            const isClickOnMenu = e.target.closest('.menu-item');
            const isOnDot = e.target.classList && e.target.classList.contains('pulsing-dot');
            if (isClickOnMenu || isOnDot) return;
            if (isClickOnBtnLeft || isClickOnBtnRight) return;
            if (!isClickOnLogin && !isClickOnAnimation) {
                if (loginWrap) loginWrap.classList.remove('center-mode');
                if (animWrap) animWrap.classList.remove('active-move');
            }
        });
    })();
})();