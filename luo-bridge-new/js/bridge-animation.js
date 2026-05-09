    (function() {
        const container = document.getElementById('bridgeContainer');
        const svg = document.getElementById('bridgeSvg');
        const bridgeGroup = document.getElementById('bridgeGroup');
        const detailGroup = document.getElementById('detailGroup');
        const waveGroup = document.getElementById('waveGroup');
        const birdGroup = document.getElementById('birdGroup');
        const stampRect = svg.querySelector('rect');
        const stampText = svg.querySelector('text');
        
        let hasDrawn = false;
        
        // 桥面路径数据（按绘制顺序）
        const bridgePaths = [
            { d: "M 100 420 Q 500 280 900 420", class: "anim-stroke", delay: "d1", strokeWidth: 6.5 },
            { d: "M 100 420 Q 500 280 900 420 L 900 440 Q 500 300 100 440 Z", class: "anim-stroke", delay: "d2", strokeWidth: 4.5 },
            { d: "M 210 410 Q 500 230 790 410", class: "anim-stroke", delay: "d3", strokeWidth: 5.5 },
            { d: "M 230 410 Q 500 250 770 410", class: "anim-stroke", delay: "d4", strokeWidth: 2.8 },
            { d: "M 130 415 Q 185 350 230 408", class: "anim-stroke", delay: "d5", strokeWidth: 4 },
            { d: "M 770 408 Q 815 350 870 415", class: "anim-stroke", delay: "d6", strokeWidth: 4 },
            { d: "M 170 390 L 170 355 M 160 355 L 180 355", class: "anim-stroke", delay: "d5", strokeWidth: 4.5 },
            { d: "M 280 370 L 280 335 M 270 335 L 290 335", class: "anim-stroke", delay: "d6", strokeWidth: 4.5 },
            { d: "M 500 315 L 500 280 M 490 280 L 510 280", class: "anim-stroke", delay: "d7", strokeWidth: 4.5 },
            { d: "M 720 370 L 720 335 M 710 335 L 730 335", class: "anim-stroke", delay: "d7", strokeWidth: 4.5 },
            { d: "M 830 390 L 830 355 M 820 355 L 840 355", class: "anim-stroke", delay: "d8", strokeWidth: 4.5 },
            { d: "M 170 370 Q 500 295 830 370", class: "anim-stroke", delay: "d8", strokeWidth: 3.5 }
        ];
        
        // 石板纹路路径
        const detailPaths = [
            { d: "M 240 420 L 240 445", class: "anim-detail", delay: "d6" },
            { d: "M 360 390 L 360 415", class: "anim-detail", delay: "d7" },
            { d: "M 500 345 L 500 370", class: "anim-detail", delay: "d7" },
            { d: "M 640 390 L 640 415", class: "anim-detail", delay: "d8" },
            { d: "M 760 420 L 760 445", class: "anim-detail", delay: "d9" }
        ];
        
        // 水波路径
        const wavePaths = [
            { d: "M 290 470 Q 330 460 370 470", class: "anim-wave", delay: "d8" },
            { d: "M 580 475 Q 620 465 660 475", class: "anim-wave", delay: "d9" },
            { d: "M 420 485 Q 500 475 580 485", class: "anim-wave", delay: "d9" }
        ];
        
        // 飞鸟路径
        const birdPaths = [
            { d: "M 340 170 Q 355 155 370 170", class: "anim-detail", delay: "d9" },
            { d: "M 630 155 Q 645 140 660 155", class: "anim-detail", delay: "d9" }
        ];
        
        function replayAnimation() {
            if (hasDrawn) return;
            console.log('开始绘制桥梁');
            
            // 1. 水背景（椭圆）
            const waterBg = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            waterBg.setAttribute("cx", "500");
            waterBg.setAttribute("cy", "480");
            waterBg.setAttribute("rx", "450");
            waterBg.setAttribute("ry", "40");
            waterBg.setAttribute("fill", "url(#waterColor)");
            waterBg.classList.add("anim-wave", "fade-delay");
            svg.insertBefore(waterBg, svg.firstChild);
            
            // 2. 创建桥面线条
            bridgePaths.forEach(p => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", p.d);
                path.classList.add(p.class);
                if (p.strokeWidth) path.setAttribute("stroke-width", p.strokeWidth);
                path.classList.add(p.delay);
                path.style.strokeDasharray = "1500";
                path.style.strokeDashoffset = "1500";
                bridgeGroup.appendChild(path);
            });
            
            // 3. 创建石板纹路
            detailPaths.forEach(p => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", p.d);
                path.classList.add(p.class);
                path.classList.add(p.delay);
                path.style.strokeDasharray = "500";
                path.style.strokeDashoffset = "500";
                detailGroup.appendChild(path);
            });
            
            // 4. 创建水波
            wavePaths.forEach(p => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", p.d);
                path.classList.add(p.class);
                path.classList.add(p.delay);
                waveGroup.appendChild(path);
            });
            
            // 5. 创建飞鸟
            birdPaths.forEach(p => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", p.d);
                path.classList.add(p.class);
                path.classList.add(p.delay);
                birdGroup.appendChild(path);
            });
            
            // 6. 印章动画
            stampRect.classList.add("anim-fade", "fade-delay");
            stampText.classList.add("anim-fade", "fade-delay");
            
            hasDrawn = true;
        }
        
        // 监听父页面消息
        window.addEventListener('message', function(event) {
            if (event.data === 'replayBridge') {
                console.log('收到父页面消息，开始绘制桥梁');
                replayAnimation();
            }
        });
        
        console.log('桥梁动画已准备，初始空白，等待父页面通知');
        
        // ========== 点击生成曲线和小球逻辑 ==========
        const dynamicGroup = document.getElementById('dynamicLayer');
        let activeItems = [];
        const MAX_ITEMS = 5;
        
        const bridgePhrases = [
            "虹桥卧波", "石拱千年", "碧水映月", "砌玉堆云",
            "望柱凝晖", "石板清音", "烟柳画桥", "檐牙飞翠",
            "踏桥听风", "墩台抱浪", "雕栏犹温", "月落长桥"
        ];
        
        function generateCurve(startX, startY) {
            let sx = Math.min(950, Math.max(50, startX));
            let sy = Math.min(500, Math.max(280, startY));
            const variant = Math.floor(Math.random() * 3);
            let cp1x, cp1y, cp2x, cp2y, ex, ey;
            if (variant === 0) {
                cp1x = sx + 40; cp1y = sy - 60;
                cp2x = sx - 25; cp2y = sy - 110;
                ex = sx - 45; ey = sy - 155;
            } else if (variant === 1) {
                cp1x = sx + 55; cp1y = sy - 45;
                cp2x = sx + 80; cp2y = sy - 95;
                ex = sx + 100; ey = sy - 140;
            } else {
                cp1x = sx - 45; cp1y = sy - 40;
                cp2x = sx - 80; cp2y = sy - 80;
                ex = sx - 70; ey = sy - 160;
            }
            ex = Math.min(930, Math.max(70, ex));
            ey = Math.min(230, Math.max(65, ey));
            const pathD = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`;
            return { pathD, endX: ex, endY: ey, startX: sx, startY: sy };
        }
        
        function removeOldest() {
            if (activeItems.length >= MAX_ITEMS) {
                const oldest = activeItems.shift();
                if (oldest && oldest.parentNode) oldest.parentNode.removeChild(oldest);
            }
        }
        
        function getRandomPhrase() {
            return bridgePhrases[Math.floor(Math.random() * bridgePhrases.length)];
        }
        
        function addGrowingLine(clientX, clientY) {
            const rect = container.getBoundingClientRect();
            let clickX = clientX - rect.left;
            let clickY = clientY - rect.top;
            if (clickX < 30 || clickX > 970 || clickY < 230 || clickY > 520) return;
            
            const { pathD, endX, endY, startX, startY } = generateCurve(clickX, clickY);
            const phrase = getRandomPhrase();
            
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathLine.setAttribute("d", pathD);
            pathLine.setAttribute("fill", "none");
            pathLine.setAttribute("stroke", "#f7e2a8");
            pathLine.setAttribute("stroke-width", "3.5");
            pathLine.setAttribute("stroke-linecap", "round");
            pathLine.setAttribute("filter", "url(#glowLine)");
            
            const dummyPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            dummyPath.setAttribute("d", pathD);
            const totalLen = dummyPath.getTotalLength();
            pathLine.style.strokeDasharray = totalLen;
            pathLine.style.strokeDashoffset = totalLen;
            
            const ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ball.setAttribute("r", "8");
            ball.setAttribute("fill", "#ffdf9c");
            ball.setAttribute("stroke", "#f5b642");
            ball.setAttribute("stroke-width", "2");
            ball.setAttribute("filter", "url(#glowLine)");
            ball.style.cursor = "pointer";
            ball.setAttribute("cx", startX);
            ball.setAttribute("cy", startY);
            
            const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            core.setAttribute("r", "3");
            core.setAttribute("fill", "#fff3cf");
            core.style.pointerEvents = "none";
            core.setAttribute("cx", startX);
            core.setAttribute("cy", startY);
            
            const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textLabel.setAttribute("font-size", "14");
            textLabel.setAttribute("fill", "#f7eac5");
            textLabel.setAttribute("font-family", "'Noto Serif SC', 'Segoe UI', serif");
            textLabel.setAttribute("font-weight", "500");
            textLabel.setAttribute("text-anchor", "middle");
            textLabel.setAttribute("filter", "url(#glowLine)");
            textLabel.style.opacity = "0";
            textLabel.textContent = phrase;
            textLabel.setAttribute("x", endX);
            textLabel.setAttribute("y", endY - 24);
            
            group.appendChild(pathLine);
            group.appendChild(ball);
            group.appendChild(core);
            group.appendChild(textLabel);
            dynamicGroup.appendChild(group);
            activeItems.push(group);
            removeOldest();
            
            const duration = 1000;
            const startTime = performance.now();
            
            function animateGrowth(now) {
                const elapsed = now - startTime;
                let t = Math.min(1, elapsed / duration);
                const easeOut = 1 - Math.pow(1 - t, 3);
                
                const newOffset = totalLen * (1 - easeOut);
                pathLine.style.strokeDashoffset = newOffset;
                
                const point = dummyPath.getPointAtLength(easeOut * totalLen);
                if (point) {
                    ball.setAttribute("cx", point.x);
                    ball.setAttribute("cy", point.y);
                    core.setAttribute("cx", point.x);
                    core.setAttribute("cy", point.y);
                }
                
                if (t >= 0.65) {
                    textLabel.style.opacity = Math.min(1, (t - 0.65) / 0.35);
                }
                
                if (t < 1) {
                    requestAnimationFrame(animateGrowth);
                } else {
                    const finalPoint = dummyPath.getPointAtLength(totalLen);
                    ball.setAttribute("cx", finalPoint.x);
                    ball.setAttribute("cy", finalPoint.y);
                    core.setAttribute("cx", finalPoint.x);
                    core.setAttribute("cy", finalPoint.y);
                    textLabel.style.opacity = "1";
                    pathLine.style.strokeDashoffset = "0";
                    
                    const handleBallClick = (e) => {
                        e.stopPropagation();
                        const rectC = container.getBoundingClientRect();
                        const bx = parseFloat(ball.getAttribute("cx"));
                        const by = parseFloat(ball.getAttribute("cy"));
                        if (!isNaN(bx) && !isNaN(by)) {
                            addGrowingLine(rectC.left + bx, rectC.top + by);
                        }
                    };
                    ball.addEventListener("click", handleBallClick);
                }
            }
            requestAnimationFrame(animateGrowth);
        }
        
        container.addEventListener("click", (e) => {
            if (e.target.closest && e.target.closest('circle')) return;
            addGrowingLine(e.clientX, e.clientY);
        });
    })();