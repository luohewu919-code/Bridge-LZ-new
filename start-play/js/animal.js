(function() {
    // ========== 电子宠物类 ==========
    class DigitalPet {
        constructor() {
            this.x = window.innerWidth / 2;
            this.y = window.innerHeight / 2;
            this.targetX = this.x;
            this.targetY = this.y;
            this.size = 45;
            this.eyeBlink = 0;
            this.tailWag = 0;
            this.idleBounce = 0;
            this.earFlop = 0;
            this.lastMouseX = this.x;
            this.lastMouseY = this.y;
            this.speed = 0.12;
            
            // ==== 新增：偏移量配置（宠物相对于鼠标的位置）====
            this.offsetX = 45;   // 水平偏移（正数：鼠标右边，负数：鼠标左边）
            this.offsetY = -35;  // 垂直偏移（正数：鼠标下方，负数：鼠标上方）
            
            this.createSVG();
            this.startAnimation();
            this.bindEvents();
            
            window.addEventListener('resize', () => {
                this.targetX = Math.min(Math.max(this.targetX, 50), window.innerWidth - 50);
                this.targetY = Math.min(Math.max(this.targetY, 50), window.innerHeight - 50);
            });
        }
        
        createSVG() {
            const svgNS = "http://www.w3.org/2000/svg";
            this.container = document.createElementNS(svgNS, "svg");
            this.container.setAttribute("width", "100");
            this.container.setAttribute("height", "100");
            this.container.setAttribute("viewBox", "0 0 100 100");
            this.container.style.position = "fixed";
            this.container.style.top = "0";
            this.container.style.left = "0";
            this.container.style.pointerEvents = "none";
            this.container.style.zIndex = "9999";
            this.container.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
            document.body.appendChild(this.container);
            
            this.body = document.createElementNS(svgNS, "ellipse");
            this.body.setAttribute("cx", "50");
            this.body.setAttribute("cy", "55");
            this.body.setAttribute("rx", "28");
            this.body.setAttribute("ry", "30");
            this.body.setAttribute("fill", "#F5A623");
            this.body.setAttribute("stroke", "#E09515");
            this.body.setAttribute("stroke-width", "1.5");
            this.container.appendChild(this.body);
            
            this.belly = document.createElementNS(svgNS, "ellipse");
            this.belly.setAttribute("cx", "50");
            this.belly.setAttribute("cy", "60");
            this.belly.setAttribute("rx", "18");
            this.belly.setAttribute("ry", "20");
            this.belly.setAttribute("fill", "#FFD699");
            this.container.appendChild(this.belly);
            
            this.leftEar = document.createElementNS(svgNS, "path");
            this.leftEar.setAttribute("d", "M 30 35 Q 22 10 30 18 Q 38 22 38 32");
            this.leftEar.setAttribute("fill", "#E09515");
            this.leftEar.setAttribute("stroke", "#C07A10");
            this.leftEar.setAttribute("stroke-width", "1");
            this.container.appendChild(this.leftEar);
            
            this.rightEar = document.createElementNS(svgNS, "path");
            this.rightEar.setAttribute("d", "M 70 35 Q 78 10 70 18 Q 62 22 62 32");
            this.rightEar.setAttribute("fill", "#E09515");
            this.rightEar.setAttribute("stroke", "#C07A10");
            this.rightEar.setAttribute("stroke-width", "1");
            this.container.appendChild(this.rightEar);
            
            this.leftEye = document.createElementNS(svgNS, "ellipse");
            this.leftEye.setAttribute("cx", "38");
            this.leftEye.setAttribute("cy", "48");
            this.leftEye.setAttribute("rx", "5");
            this.leftEye.setAttribute("ry", "6");
            this.leftEye.setAttribute("fill", "#2C1810");
            this.container.appendChild(this.leftEye);
            
            this.rightEye = document.createElementNS(svgNS, "ellipse");
            this.rightEye.setAttribute("cx", "62");
            this.rightEye.setAttribute("cy", "48");
            this.rightEye.setAttribute("rx", "5");
            this.rightEye.setAttribute("ry", "6");
            this.rightEye.setAttribute("fill", "#2C1810");
            this.container.appendChild(this.rightEye);
            
            this.leftHighlight = document.createElementNS(svgNS, "circle");
            this.leftHighlight.setAttribute("cx", "36");
            this.leftHighlight.setAttribute("cy", "46");
            this.leftHighlight.setAttribute("r", "2");
            this.leftHighlight.setAttribute("fill", "white");
            this.container.appendChild(this.leftHighlight);
            
            this.rightHighlight = document.createElementNS(svgNS, "circle");
            this.rightHighlight.setAttribute("cx", "60");
            this.rightHighlight.setAttribute("cy", "46");
            this.rightHighlight.setAttribute("r", "2");
            this.rightHighlight.setAttribute("fill", "white");
            this.container.appendChild(this.rightHighlight);
            
            this.nose = document.createElementNS(svgNS, "ellipse");
            this.nose.setAttribute("cx", "50");
            this.nose.setAttribute("cy", "56");
            this.nose.setAttribute("rx", "4");
            this.nose.setAttribute("ry", "3");
            this.nose.setAttribute("fill", "#E07A5F");
            this.container.appendChild(this.nose);
            
            this.mouth = document.createElementNS(svgNS, "path");
            this.mouth.setAttribute("d", "M 46 60 Q 50 65 54 60");
            this.mouth.setAttribute("fill", "none");
            this.mouth.setAttribute("stroke", "#8B4513");
            this.mouth.setAttribute("stroke-width", "1.2");
            this.mouth.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.mouth);
            
            this.leftWhisker1 = document.createElementNS(svgNS, "line");
            this.leftWhisker1.setAttribute("x1", "28");
            this.leftWhisker1.setAttribute("y1", "54");
            this.leftWhisker1.setAttribute("x2", "12");
            this.leftWhisker1.setAttribute("y2", "52");
            this.leftWhisker1.setAttribute("stroke", "#D4A574");
            this.leftWhisker1.setAttribute("stroke-width", "1");
            this.leftWhisker1.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.leftWhisker1);
            
            this.leftWhisker2 = document.createElementNS(svgNS, "line");
            this.leftWhisker2.setAttribute("x1", "28");
            this.leftWhisker2.setAttribute("y1", "58");
            this.leftWhisker2.setAttribute("x2", "10");
            this.leftWhisker2.setAttribute("y2", "58");
            this.leftWhisker2.setAttribute("stroke", "#D4A574");
            this.leftWhisker2.setAttribute("stroke-width", "1");
            this.leftWhisker2.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.leftWhisker2);
            
            this.rightWhisker1 = document.createElementNS(svgNS, "line");
            this.rightWhisker1.setAttribute("x1", "72");
            this.rightWhisker1.setAttribute("y1", "54");
            this.rightWhisker1.setAttribute("x2", "88");
            this.rightWhisker1.setAttribute("y2", "52");
            this.rightWhisker1.setAttribute("stroke", "#D4A574");
            this.rightWhisker1.setAttribute("stroke-width", "1");
            this.rightWhisker1.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.rightWhisker1);
            
            this.rightWhisker2 = document.createElementNS(svgNS, "line");
            this.rightWhisker2.setAttribute("x1", "72");
            this.rightWhisker2.setAttribute("y1", "58");
            this.rightWhisker2.setAttribute("x2", "90");
            this.rightWhisker2.setAttribute("y2", "58");
            this.rightWhisker2.setAttribute("stroke", "#D4A574");
            this.rightWhisker2.setAttribute("stroke-width", "1");
            this.rightWhisker2.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.rightWhisker2);
            
            this.tail = document.createElementNS(svgNS, "path");
            this.tail.setAttribute("d", "M 22 65 Q 8 60 12 45 Q 16 35 22 40");
            this.tail.setAttribute("fill", "#F5A623");
            this.tail.setAttribute("stroke", "#E09515");
            this.tail.setAttribute("stroke-width", "1.5");
            this.tail.setAttribute("stroke-linecap", "round");
            this.container.appendChild(this.tail);
        }
        
        bindEvents() {
            document.addEventListener('mousemove', (e) => {
                // ===== 关键修改：宠物位置 = 鼠标位置 + 偏移量 =====
                let targetX = e.clientX + this.offsetX;
                let targetY = e.clientY + this.offsetY;
                
                // 边界限制（防止宠物跑出屏幕）
                targetX = Math.min(Math.max(targetX, 50), window.innerWidth - 50);
                targetY = Math.min(Math.max(targetY, 50), window.innerHeight - 50);
                
                this.targetX = targetX;
                this.targetY = targetY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            });
        }
        
        startAnimation() {
            const animate = () => {
                this.x += (this.targetX - this.x) * this.speed;
                this.y += (this.targetY - this.y) * this.speed;
                
                this.container.style.transform = `translate(${this.x - 50}px, ${this.y - 50}px)`;
                
                const dx = this.targetX - this.x;
                const tilt = Math.min(Math.max(dx * 0.15, -8), 8);
                this.container.style.transform += ` rotate(${tilt * 0.3}deg)`;
                
                if (this.eyeBlink <= 0 && Math.random() < 0.005) {
                    this.eyeBlink = 6;
                }
                if (this.eyeBlink > 0) {
                    this.leftEye.setAttribute("ry", this.eyeBlink > 3 ? "1" : "6");
                    this.rightEye.setAttribute("ry", this.eyeBlink > 3 ? "1" : "6");
                    this.eyeBlink--;
                } else {
                    this.leftEye.setAttribute("ry", "6");
                    this.rightEye.setAttribute("ry", "6");
                }
                
                this.tailWag = (this.tailWag + 0.15) % (Math.PI * 2);
                const wagAngle = Math.sin(this.tailWag) * 12;
                const tailPath = `M 22 65 Q ${8 + wagAngle * 0.5} 60 12 45 Q 16 35 22 40`;
                this.tail.setAttribute("d", tailPath);
                
                this.idleBounce += 0.03;
                const bounceY = Math.sin(this.idleBounce) * 1.5;
                this.body.setAttribute("cy", 55 + bounceY * 0.3);
                this.belly.setAttribute("cy", 60 + bounceY * 0.2);
                
                this.earFlop += 0.05;
                const earWiggle = Math.sin(this.earFlop) * 2;
                this.leftEar.setAttribute("d", `M 30 35 Q 22 ${10 + earWiggle * 0.5} 30 18 Q 38 22 38 32`);
                this.rightEar.setAttribute("d", `M 70 35 Q 78 ${10 + earWiggle * 0.5} 70 18 Q 62 22 62 32`);
                
                requestAnimationFrame(animate);
            };
            animate();
        }
    }
    
    // ========== 粒子效果 ==========
    class ParticleEffect {
        constructor() {
            this.canvas = document.getElementById('particleCanvas');
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'particleCanvas';
                this.canvas.style.position = 'fixed';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '10';
                document.body.appendChild(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.resize();
            
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('mousemove', (e) => this.addParticle(e.clientX, e.clientY));
            
            this.animate();
        }
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        
        addParticle(x, y) {
            for (let i = 0; i < 2; i++) {
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 8,
                    y: y + (Math.random() - 0.5) * 8,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5 - 1,
                    life: 0.8,
                    size: Math.random() * 4 + 2,
                    color: `hsl(${35 + Math.random() * 20}, 70%, 60%)`
                });
            }
        }
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.life -= 0.02;
                
                if (p.life <= 0 || p.y > this.canvas.height + 50) {
                    this.particles.splice(i, 1);
                    continue;
                }
                
                this.ctx.globalAlpha = p.life * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * (0.5 + p.life * 0.5), 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // 启动电子宠物和粒子效果
    const pet = new DigitalPet();
    const particles = new ParticleEffect();
})();