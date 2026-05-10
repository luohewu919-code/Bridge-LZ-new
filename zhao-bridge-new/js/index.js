// ============================================================
// 1. 视差滚动效果（包含 Explore 按钮 + 红色盒子倾斜放大）
// ============================================================
let stars = document.getElementById('stars');
let moon = document.getElementById('moon');
let mountains_behind = document.getElementById('mountains_behind');
let text = document.getElementById('text');
let btn = document.getElementById('btn');
let mountains_front = document.getElementById('mountains_front');
let redBox = document.querySelector('.sec .back');

window.addEventListener('scroll', function() {
  let value = window.scrollY;
  
  if (stars) stars.style.left = value * 0.25 + 'px';
  if (moon) moon.style.top = value * 1.05 + 'px';
  if (mountains_behind) mountains_behind.style.top = value * 0.5 + 'px';
  if (mountains_front) mountains_front.style.top = value * 0 + 'px';
  
  if (text) {
    text.style.marginRight = value * 4 + 'px';
    text.style.marginTop = value * 1.5 + 'px';
  }
  
  if (btn) {
    btn.style.marginTop = value * 1.5 + 'px';
  }
  
  if (redBox) {
    if (value < 300) {
      let progress = value / 300;
      let rotateX = progress * 15;
      let rotateY = progress * 8;
      let scale = 1 + (progress * 0.3);
      redBox.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    } else {
      redBox.style.transform = `perspective(800px) rotateX(15deg) rotateY(8deg) scale(1.3)`;
    }
  }
});

// ============================================================
// 2. Explore 按钮点击滚动
// ============================================================
document.getElementById('btn').onclick = function(e) {
  e.preventDefault();
  document.getElementById('sec').scrollIntoView({ behavior: 'smooth' });
};

// ============================================================
// 3. 怀旧镜头效果
// ============================================================
(function() {
  const bridgeImage = document.getElementById('mountains_front');
  if (!bridgeImage) return;

  const parent = bridgeImage.parentNode;
  parent.style.position = 'relative';
  bridgeImage.style.pointerEvents = 'auto';
  bridgeImage.style.display = 'block';
  bridgeImage.style.width = '100%';
  bridgeImage.style.height = '100%';
  bridgeImage.style.objectFit = 'cover';

  let sepiaClone = null;
  
  function initSepiaClone() {
    if (sepiaClone) sepiaClone.remove();
    
    sepiaClone = bridgeImage.cloneNode(true);
    sepiaClone.style.position = 'absolute';
    sepiaClone.style.top = '0';
    sepiaClone.style.left = '0';
    sepiaClone.style.width = '100%';
    sepiaClone.style.height = '100%';
    sepiaClone.style.objectFit = bridgeImage.style.objectFit || 'cover';
    sepiaClone.style.pointerEvents = 'none';
    sepiaClone.style.filter = 'sepia(0.9) contrast(1.1) brightness(0.95)';
    sepiaClone.style.clipPath = 'circle(0px at 0px 0px)';
    sepiaClone.style.zIndex = '10';
    sepiaClone.style.willChange = 'clip-path';
    
    parent.appendChild(sepiaClone);
  }
  
  if (bridgeImage.complete) {
    initSepiaClone();
  } else {
    bridgeImage.addEventListener('load', initSepiaClone);
  }

  parent.addEventListener('mousemove', function(e) {
    if (!sepiaClone) return;
    const rect = bridgeImage.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    sepiaClone.style.clipPath = `circle(20px at ${x}px ${y}px)`;
  });
  
  parent.addEventListener('mouseleave', function() {
    if (sepiaClone) sepiaClone.style.clipPath = 'circle(0px at 0px 0px)';
  });
  
  window.addEventListener('resize', function() {
    if (bridgeImage.complete && sepiaClone) {
      sepiaClone.style.width = '100%';
      sepiaClone.style.height = '100%';
    }
  });
})();

// ============================================================
// 4. 宠物飞行 + 粒子系统 + AI对话框（支持窗口大小改变时自动适配位置）
// ============================================================
(function() {
  const pet = document.getElementById('petWrapper');
  const rect = document.getElementById('introRect');
  const aiWindow = document.getElementById('aiChatWindow');
  const petClickArea = document.getElementById('petClickArea');
  const bulletStats = document.querySelector('.bullet-stats');
  
  // 初始隐藏点赞面板
  if (bulletStats) {
    bulletStats.style.opacity = '0';
    bulletStats.style.visibility = 'hidden';
    bulletStats.style.transition = 'opacity 0.3s ease';
  }
  
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId = null;
  let isFlying = false;
  
  // 存储当前宠物位置参数
  let currentPetW = 40;
  let currentPetH = 40;
  let currentEndX = 0;
  let currentEndY = 10;
  let currentRightMargin = 30;
  
  // 更新宠物下方元素位置的函数
  function updateElementsBelowPet() {
    if (!pet) return;
    const petRect = pet.getBoundingClientRect();
    const petBottom = petRect.bottom;
    const petRight = petRect.right;
    
    // 更新 AI 对话框位置：紧贴宠物下方，右对齐
    if (aiWindow) {
      aiWindow.style.position = 'fixed';
      aiWindow.style.top = (petBottom + 5) + 'px';
      aiWindow.style.right = (window.innerWidth - petRight) + 'px';
      aiWindow.style.left = 'auto';
      aiWindow.style.bottom = 'auto';
    }
    
    // 更新点赞统计面板位置：紧贴 AI 对话框下方，右对齐
    if (bulletStats) {
      let topOffset = petBottom + 5;
      if (aiWindow && aiWindow.style.display === 'block') {
        const aiRect = aiWindow.getBoundingClientRect();
        topOffset = aiRect.bottom + 5;
      }
      bulletStats.style.position = 'fixed';
      bulletStats.style.top = topOffset + 'px';
      bulletStats.style.right = (window.innerWidth - petRight) + 'px';
      bulletStats.style.left = 'auto';
      bulletStats.style.bottom = 'auto';
    }
  }
  
  // 显示点赞面板（飞行结束后调用）
  function showBulletStats() {
    if (bulletStats) {
      bulletStats.style.opacity = '1';
      bulletStats.style.visibility = 'visible';
    }
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!isFlying && pet && pet.style.visibility === 'visible') {
      updateElementsBelowPet();
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = (Math.random() - 0.5) * 3 - 1;
      this.size = Math.random() * 4 + 2;
      this.alpha = 0.8;
      this.color = `hsl(${Math.random() * 20 + 20}, 80%, 60%)`;
      this.decay = 0.02 + Math.random() * 0.03;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      this.size *= 0.98;
      return this.alpha > 0 && this.size > 0.2;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  function addParticles(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8));
    }
  }
  
  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.update());
    particles.forEach(p => p.draw());
    if (isFlying || particles.length > 0) {
      animationFrameId = requestAnimationFrame(animateParticles);
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  
  function updatePetEndPosition() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    currentEndX = w - currentPetW - currentRightMargin;
    if (currentEndY < 0) currentEndY = 0;
    return { endX: currentEndX, endY: currentEndY };
  }
  
  window.addEventListener('resize', function() {
    if (!isFlying && pet && pet.style.visibility === 'visible') {
      updatePetEndPosition();
      pet.style.left = currentEndX + 'px';
      pet.style.top = currentEndY + 'px';
      updateElementsBelowPet();
    }
  });
  
  const w = window.innerWidth;
  const h = window.innerHeight;
  const petW = currentPetW;
  const petH = currentPetH;
  
  const startX = (w - petW) / 2;
  const startY = (h - petH) / 2;
  const endX = w - petW - currentRightMargin;
  const endY = currentEndY;
  
  const cp1x = startX + (endX - startX) * 0.25;
  const cp1y = Math.max(endY + 30, startY - 100);
  const cp2x = endX - 60;
  const cp2y = Math.max(endY + 20, cp1y - 20);
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'fixed';
  svg.style.pointerEvents = 'none';
  svg.style.visibility = 'hidden';
  document.body.appendChild(svg);
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const pathData = `M ${startX + petW/2} ${startY + petH/2} C ${cp1x + petW/2} ${cp1y + petH/2}, ${cp2x + petW/2} ${cp2y + petH/2}, ${endX + petW/2} ${endY + petH/2}`;
  path.setAttribute('d', pathData);
  svg.appendChild(path);
  
  const pathLength = path.getTotalLength();
  let lastParticlePos = { x: startX + petW/2, y: startY + petH/2 };
  
  function appearAndFly() {
    pet.style.visibility = 'visible';
    pet.style.left = startX + 'px';
    pet.style.top = startY + 'px';
    isFlying = true;
    
    let startTime = null;
    const duration = 1200;
    
    function animateFly(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      let t = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - t, 3);
      
      const point = path.getPointAtLength(pathLength * easeOut);
      const petX = point.x - petW/2;
      const petY = point.y - petH/2;
      
      pet.style.left = petX + 'px';
      pet.style.top = petY + 'px';
      
      if (t < 1) {
        const distX = Math.abs(point.x - lastParticlePos.x);
        const distY = Math.abs(point.y - lastParticlePos.y);
        const speed = Math.sqrt(distX * distX + distY * distY);
        const particleCount = Math.min(5, Math.max(2, Math.floor(speed / 5)));
        addParticles(point.x, point.y, particleCount);
        lastParticlePos = { x: point.x, y: point.y };
      }
      
      if (t < 1) {
        requestAnimationFrame(animateFly);
      } else {
        pet.style.left = endX + 'px';
        pet.style.top = endY + 'px';
        svg.remove();
        isFlying = false;
        addParticles(endX + petW/2, endY + petH/2, 8);
        // 飞行结束，显示点赞面板并更新位置
        showBulletStats();
        updateElementsBelowPet();
      }
    }
    
    animateParticles();
    requestAnimationFrame(animateFly);
  }
  
  rect.addEventListener('animationend', function() {
    rect.style.display = 'none';
    appearAndFly();
  });
  
  let hideTimeout;
  
  if (petClickArea) {
    petClickArea.addEventListener('mouseenter', function(e) {
      if (hideTimeout) clearTimeout(hideTimeout);
      aiWindow.style.display = 'block';
      updateElementsBelowPet();
    });
    
    petClickArea.addEventListener('mouseleave', function(e) {
      hideTimeout = setTimeout(function() {
        if (aiWindow && !aiWindow.matches(':hover')) {
          aiWindow.style.display = 'none';
          updateElementsBelowPet();
        }
      }, 300);
    });
  }
  
  if (aiWindow) {
    aiWindow.addEventListener('mouseenter', function() {
      if (hideTimeout) clearTimeout(hideTimeout);
    });
    
    aiWindow.addEventListener('mouseleave', function() {
      hideTimeout = setTimeout(function() {
        aiWindow.style.display = 'none';
        updateElementsBelowPet();
      }, 300);
    });
  }
  
  document.addEventListener('click', function(e) {
    if (aiWindow && aiWindow.style.display === 'block' && 
        !aiWindow.contains(e.target) && pet && !pet.contains(e.target)) {
      aiWindow.style.display = 'none';
      updateElementsBelowPet();
    }
  });
  
  if (aiWindow) {
    aiWindow.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  window.addEventListener('scroll', function() {
    if (!isFlying && pet && pet.style.visibility === 'visible') {
      updateElementsBelowPet();
    }
  });
})();

// ============================================================
// 5. 弹幕系统
// ============================================================
let bulletList = [];
let nextId = 1;
let stats = { like: 0, dislike: 0 };
let currentMenuId = null;
let currentMenuText = '';

const defaultBullets = [
  { id: 1, text: "洛阳桥 — 筏形基础，海港石桥鼻祖", fontSize: 13, offsetY: -3 },
  { id: 2, text: "赵州桥 — 千年敞肩拱，桥梁奇迹", fontSize: 16, offsetY: 5 },
  { id: 3, text: "数字文化遗产 · 桥梁史诗", fontSize: 12, offsetY: -2 },
  { id: 4, text: "种蛎固基 — 古代生物黑科技", fontSize: 15, offsetY: 4 },
  { id: 5, text: "浮运架梁 — 潮汐巧思", fontSize: 11, offsetY: -4 },
  { id: 6, text: "探索千年桥梁之美", fontSize: 12, offsetY: -1 }
];

const publishPanel = document.getElementById('publishPanel');
const bulletInput = document.getElementById('bulletInput');
let panelTimeout = null;

function openPanel() {
  if (panelTimeout) clearTimeout(panelTimeout);
  publishPanel.classList.add('open');
}

function scheduleClosePanel() {
  if (panelTimeout) clearTimeout(panelTimeout);
  panelTimeout = setTimeout(() => {
    if (document.activeElement !== bulletInput) {
      publishPanel.classList.remove('open');
    }
  }, 1400);
}

publishPanel.addEventListener('mouseenter', () => { openPanel(); });
publishPanel.addEventListener('mouseleave', () => { scheduleClosePanel(); });
if (bulletInput) {
  bulletInput.addEventListener('focus', () => { openPanel(); });
  bulletInput.addEventListener('blur', () => { scheduleClosePanel(); });
}

function loadBulletData() {
  const saved = localStorage.getItem('bullet_list');
  if (saved) {
    bulletList = JSON.parse(saved);
    nextId = bulletList.length ? Math.max(...bulletList.map(b => b.id)) + 1 : 1;
  } else {
    bulletList = [...defaultBullets];
    nextId = defaultBullets.length + 1;
  }
  const savedStats = localStorage.getItem('bullet_stats');
  if (savedStats) stats = JSON.parse(savedStats);
  updateStatsUI();
}

function saveBullets() { localStorage.setItem('bullet_list', JSON.stringify(bulletList)); }
function saveStats() { localStorage.setItem('bullet_stats', JSON.stringify(stats)); }
function updateStatsUI() {
  const likeSpan = document.getElementById('likeCount');
  const dislikeSpan = document.getElementById('dislikeCount');
  if (likeSpan) likeSpan.innerText = stats.like;
  if (dislikeSpan) dislikeSpan.innerText = stats.dislike;
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function renderBulletTrack() {
  const track = document.getElementById('bulletTrack');
  if (!track) return;
  track.innerHTML = '';
  const allBullets = [...bulletList, ...bulletList];
  allBullets.forEach(b => {
    const span = document.createElement('span');
    span.className = 'bullet-item';
    span.setAttribute('data-id', b.id);
    span.setAttribute('data-text', b.text);
    
    let fontSize = b.fontSize || (12 + Math.random() * 10);
    fontSize = Math.min(20, Math.max(11, fontSize));
    span.style.fontSize = fontSize + 'px';
    
    let offsetY = b.offsetY || (Math.random() * 12 - 6);
    span.style.marginTop = offsetY + 'px';
    
    span.innerHTML = `<span class="bullet-text">${escapeHtml(b.text)}</span><span class="bullet-menu-btn" data-id="${b.id}" data-text="${escapeHtml(b.text)}">⋮</span>`;
    
    const btn = span.querySelector('.bullet-menu-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showBulletMenu(e, b.id, b.text, span);
      });
    }
    track.appendChild(span);
  });
}

const menuDiv = document.getElementById('bulletMenu');
function showBulletMenu(event, id, text, element) {
  if (!menuDiv) return;
  menuDiv.style.display = 'none';
  currentMenuId = id;
  currentMenuText = text;
  let x = event.clientX + 10;
  let y = event.clientY - 20;
  if (x + 120 > window.innerWidth) x = event.clientX - 130;
  if (y < 0) y = event.clientY + 20;
  menuDiv.style.left = x + 'px';
  menuDiv.style.top = y + 'px';
  menuDiv.style.display = 'flex';
  event.stopPropagation();
}

function hideBulletMenu() { if (menuDiv) menuDiv.style.display = 'none'; currentMenuId = null; currentMenuText = null; }

function showBulletToast(msg) {
  let toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#ffecb3;padding:5px 15px;border-radius:30px;z-index:10001;font-size:12px;border-left:3px solid #ffaa44';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function handleBulletLike() { if (currentMenuId !== null) { stats.like++; updateStatsUI(); saveStats(); showBulletToast('👍 感谢认可！'); hideBulletMenu(); } }
function handleBulletDislike() { if (currentMenuId !== null) { stats.dislike++; updateStatsUI(); saveStats(); showBulletToast('👎 收到反馈'); hideBulletMenu(); } }
function handleBulletCopy() { if (currentMenuText) { navigator.clipboard.writeText(currentMenuText).then(() => showBulletToast('📋 已复制')).catch(() => showBulletToast('复制失败')); hideBulletMenu(); } }
function publishNewBullet() {
  if (!bulletInput) return;
  let text = bulletInput.value.trim();
  if (!text) { showBulletToast('请输入弹幕内容'); return; }
  if (text.length > 40) text = text.slice(0, 40);
  bulletList.push({ id: nextId++, text: text, fontSize: 11 + Math.random() * 9, offsetY: Math.random() * 14 - 7 });
  saveBullets();
  renderBulletTrack();
  bulletInput.value = '';
  showBulletToast('✨ 弹幕已发送');
}

document.getElementById('publishBulletBtn')?.addEventListener('click', publishNewBullet);
document.getElementById('bulletInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') publishNewBullet(); });
document.getElementById('menuLike')?.addEventListener('click', handleBulletLike);
document.getElementById('menuDislike')?.addEventListener('click', handleBulletDislike);
document.getElementById('menuCopy')?.addEventListener('click', handleBulletCopy);
document.addEventListener('click', (e) => { if (menuDiv && !menuDiv.contains(e.target) && !e.target.classList?.contains('bullet-menu-btn')) hideBulletMenu(); });

loadBulletData();
renderBulletTrack();

// ============================================================
// 6. 时间轴区域滚动控制弹幕消失/出现
// ============================================================
(function() {
  const timelineSection = document.querySelector('.timeline-section');
  const bulletContainer = document.querySelector('.bullet-screen-container');
  const publishPanelForBullet = document.getElementById('publishPanel');
  
  if (!timelineSection || !bulletContainer) {
    console.warn('时间轴区域或弹幕容器未找到');
    return;
  }
  
  let isBulletVisible = true;
  
  function getTimelineTop() {
    return timelineSection.offsetTop;
  }
  
  function getTimelineHeight() {
    return timelineSection.offsetHeight;
  }
  
  function checkBulletFade() {
    const scrollTop = window.scrollY;
    const timelineTop = getTimelineTop();
    const timelineHeight = getTimelineHeight();
    const triggerPoint = timelineTop + (timelineHeight * 0.2);
    
    if (scrollTop >= triggerPoint && isBulletVisible) {
      isBulletVisible = false;
      bulletContainer.style.transition = 'opacity 0.6s ease';
      bulletContainer.style.opacity = '0';
      bulletContainer.style.pointerEvents = 'none';
    }
  }
  
  function showBullet() {
    if (!isBulletVisible) {
      isBulletVisible = true;
      bulletContainer.style.transition = 'opacity 0.4s ease';
      bulletContainer.style.opacity = '1';
      bulletContainer.style.pointerEvents = 'auto';
    }
  }
  
  window.addEventListener('scroll', checkBulletFade);
  
  if (publishPanelForBullet) {
    publishPanelForBullet.addEventListener('click', function(e) {
      if (!isBulletVisible) {
        showBullet();
      }
    });
  }
  
  bulletContainer.style.opacity = '1';
  bulletContainer.style.transition = 'opacity 0.4s ease';
})();

// ============================================================
// 7. 发光圆环动画
// ============================================================
(function() {
  const canvas = document.getElementById('glowCircleCanvas');
  if (!canvas) return;
  
  canvas.width = 1500;
  canvas.height = 1500;
  
  const ctx = canvas.getContext('2d');
  
  const centerX = 750;
  const centerY = 750;
  const radius = 740;
  
  let angle = 0;
  const speed = 0.006;
  let animationId = null;
  
  const lightBarLength = Math.PI / 4.5;
  
  const colors = ['#ff3366', '#ff6633', '#ffcc33', '#33ff66', '#33ccff', '#6633ff', '#ff33cc'];
  
  function getPointOnCircle(rad) {
      return {
          x: centerX + radius * Math.cos(rad),
          y: centerY + radius * Math.sin(rad)
      };
  }
  
  function drawStaticRing() {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,150,255,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
  }
  
  function drawLightBar(startAng, length) {
      const endAng = startAng + length;
      const startPos = getPointOnCircle(startAng);
      const endPos = getPointOnCircle(endAng);
      
      const progress = (startAng % (Math.PI * 2)) / (Math.PI * 2);
      const colorIdx = Math.floor(progress * colors.length);
      const mainColor = colors[colorIdx % colors.length];
      const nextColor = colors[(colorIdx + 1) % colors.length];
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAng - 0.02, endAng + 0.02);
      const gradientOuter = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
      gradientOuter.addColorStop(0, mainColor + '33');
      gradientOuter.addColorStop(0.5, nextColor + '44');
      gradientOuter.addColorStop(1, mainColor + '33');
      ctx.strokeStyle = gradientOuter;
      ctx.lineWidth = 14;
      ctx.shadowBlur = 18;
      ctx.shadowColor = mainColor;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAng - 0.01, endAng + 0.01);
      const gradientMid = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
      gradientMid.addColorStop(0, mainColor + '66');
      gradientMid.addColorStop(0.5, nextColor + '77');
      gradientMid.addColorStop(1, mainColor + '66');
      ctx.strokeStyle = gradientMid;
      ctx.lineWidth = 8;
      ctx.shadowBlur = 12;
      ctx.shadowColor = mainColor;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAng, endAng);
      const gradientCore = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
      gradientCore.addColorStop(0, mainColor);
      gradientCore.addColorStop(0.5, nextColor);
      gradientCore.addColorStop(1, mainColor);
      ctx.strokeStyle = gradientCore;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = mainColor;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAng, endAng);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 6;
      ctx.shadowColor = mainColor;
      ctx.stroke();
  }
  
  function drawEndGlow(ang) {
      const pos = getPointOnCircle(ang);
      const progress = (ang % (Math.PI * 2)) / (Math.PI * 2);
      const colorIdx = Math.floor(progress * colors.length);
      const glowColor = colors[colorIdx % colors.length];
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = glowColor + '55';
      ctx.shadowBlur = 14;
      ctx.shadowColor = glowColor;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(pos.x - 0.8, pos.y - 0.8, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
  }
  
  function animate() {
      ctx.clearRect(0, 0, 1500, 1500);
      
      drawStaticRing();
      drawLightBar(angle, lightBarLength);
      drawEndGlow(angle);
      drawEndGlow(angle + lightBarLength);
      
      angle += speed;
      if (angle > Math.PI * 2) angle -= Math.PI * 2;
      
      animationId = requestAnimationFrame(animate);
  }
  
  animate();
  
  document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
          if (animationId) cancelAnimationFrame(animationId);
          animationId = null;
      } else {
          if (!animationId) animationId = requestAnimationFrame(animate);
      }
  });
})();

// ============================================================
// 8. 民间传说卡片入场/离场动画（基于区域进入视口）
// ============================================================
(function() {
  const folkloreCards = document.querySelectorAll('.folklore-card');
  const folkloreWrapper = document.querySelector('.folklore-wrapper');
  
  if (folkloreCards.length === 0 || !folkloreWrapper) return;
  
  window.isDetailActive = false;
  
  function checkAndToggle() {
    if (window.isDetailActive) {
      folkloreCards.forEach(card => card.classList.add('visible'));
      return;
    }
    
    const wrapperRect = folkloreWrapper.getBoundingClientRect();
    const triggerPoint = window.innerHeight * 0.7;
    const isNearViewport = wrapperRect.top < triggerPoint && wrapperRect.bottom > 0;
    
    if (isNearViewport) {
      folkloreCards.forEach(card => card.classList.add('visible'));
    } else {
      folkloreCards.forEach(card => card.classList.remove('visible'));
    }
  }
  
  window.addEventListener('scroll', checkAndToggle);
  setTimeout(checkAndToggle, 100);
  window.refreshFolkloreVisibility = checkAndToggle;
})();

// ============================================================
// 9. 传说卡片详情卡 - 完全隐藏/显示方案（解决永久空隙问题）
// ============================================================
(function() {
  const folkloreWrapper = document.querySelector('.folklore-wrapper');
  const folkloreGrid = document.querySelector('.folklore-grid');
  const cards = Array.from(document.querySelectorAll('.folklore-card'));
  const poetryIntro = document.querySelector('.folklore-intro');
  
  if (!folkloreWrapper || !folkloreGrid || cards.length === 0) return;

  // 创建详情行容器
  let detailRow = document.querySelector('.detail-grid-row');
  if (!detailRow) {
    detailRow = document.createElement('div');
    detailRow.className = 'detail-grid-row';
    folkloreWrapper.insertBefore(detailRow, poetryIntro);
  }
  
  // 关键修复：默认隐藏详情行（display: none），这样它不占据任何空间
  detailRow.style.display = 'none';
  detailRow.style.gridTemplateColumns = 'repeat(4, 1fr)';
  detailRow.style.gap = '25px';
  
  // 创建四个详情单元格，每个单元格内有一个详情卡片容器
  const detailInnerCards = [];
  for (let i = 0; i < 4; i++) {
    const cell = document.createElement('div');
    cell.className = 'detail-cell';
    const innerCard = document.createElement('div');
    innerCard.className = 'detail-inner-card';
    innerCard.style.transformOrigin = 'top center';
    innerCard.style.transform = 'scale(0)';
    innerCard.style.opacity = '0';
    innerCard.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.2), opacity 0.2s';
    innerCard.style.visibility = 'hidden';
    cell.appendChild(innerCard);
    detailRow.appendChild(cell);
    detailInnerCards.push(innerCard);
  }

  let activeIndex = -1;

  // 详情内容（仅 imgHtml 替换为真正的图片链接，其他文字完全保留）
  const detailContents = [
    {
      title: '🔨 鲁班造桥 · 神工一夜成',
      desc: '鲁班，春秋时期鲁国人，被尊为“工匠之神”。传说赵州桥是鲁班一夜之间建成，手艺精巧，令观者惊叹。桥下八角各嵌一只“眼睛”，用于观察水势，可预知洪水涨落，护佑桥梁千年不倒。',
      tag: '⚒️ 工匠之神 · 一夜飞虹',
      imgHtml: '<div class="detail-img-area"><img src="./images/lubanzaoqiao.png" alt="鲁班造桥" style="width:100%; height:150px; object-fit:cover; border-radius:16px;"></div>'
    },
    {
      title: '🐎 张果老试桥 · 日月压肩',
      desc: '八仙之一的张果老倒骑毛驴，驴背上暗驮日月星辰，乾坤之力集于一身。他骑驴过桥试其坚固，桥身微微晃动却安然无恙，青石板上留下五处深深的驴蹄印。如今赵州桥面依然可见蹄印痕迹。',
      tag: '🌙 倒骑毛驴 · 蹄印留痕',
      imgHtml: '<div class="detail-img-area"><img src="./images/zhanguolaoshiqiao.png" alt="张果老试桥" style="width:100%; height:150px; object-fit:cover; border-radius:16px;"></div>'
    },
    {
      title: '🛒 柴王爷推车 · 辙印三沟',
      desc: '后周世宗柴荣（柴王爷）推独轮车运粮过桥，车上满载五谷，暗合天仓星宿之力。车轮碾过桥面，留下三道深深的沟纹，象征福禄寿三星护佑。这三道车辙至今清晰可见。',
      tag: '🌾 五谷丰登 · 车辙为记',
      imgHtml: '<div class="detail-img-area"><img src="./images/chaiwangyetuiche.png" alt="柴王爷推车" style="width:100%; height:150px; object-fit:cover; border-radius:16px;"></div>'
    },
    {
      title: '✨ 桥上仙迹 · 群仙往来',
      desc: '赵州桥被誉为“神仙之地”，桥面留有众多仙人足迹，大小错落，形态各异。相传每逢晨雾或月圆之夜，可见仙人在桥下乘舟踏波，往来其间，仙踪隐现。',
      tag: '👣 仙人留步 · 桥下逍遥',
      imgHtml: '<div class="detail-img-area"><img src="./images/qiao-shang-xian-ji.png" alt="桥上仙迹" style="width:100%; height:150px; object-fit:cover; border-radius:16px;"></div>'
    }
  ];

  function showDetail(index) {
    if (activeIndex === index) {
      hideAllDetails();
      return;
    }
    
    // 隐藏当前详情
    if (activeIndex !== -1) {
      const prev = detailInnerCards[activeIndex];
      prev.style.transform = 'scale(0)';
      prev.style.opacity = '0';
      prev.style.visibility = 'hidden';
    }
    
    // 显示详情行容器
    detailRow.style.display = 'grid';
    
    // 填充并显示新详情
    const target = detailInnerCards[index];
    const data = detailContents[index];
    target.innerHTML = `
      <div class="detail-card-body">
        ${data.imgHtml}
        <div class="detail-title">${data.title}</div>
        <div class="detail-desc">${data.desc}</div>
        <div class="detail-tag">${data.tag}</div>
      </div>
    `;
    target.style.visibility = 'visible';
    target.style.transform = 'scale(0)';
    target.style.opacity = '0';
    void target.offsetWidth;
    target.style.transform = 'scale(1)';
    target.style.opacity = '1';
    activeIndex = index;
    
    window.isDetailActive = true;
    if (window.refreshFolkloreVisibility) window.refreshFolkloreVisibility();
  }

  function hideAllDetails() {
    if (activeIndex !== -1) {
      const cur = detailInnerCards[activeIndex];
      cur.style.transform = 'scale(0)';
      cur.style.opacity = '0';
      cur.style.visibility = 'hidden';
      activeIndex = -1;
    }
    // 关键修复：完全隐藏详情行容器，让它不占据任何空间
    detailRow.style.display = 'none';
    
    window.isDetailActive = false;
    if (window.refreshFolkloreVisibility) window.refreshFolkloreVisibility();
  }

  // 绑定卡片点击
  cards.forEach((card, idx) => {
    card.removeAttribute('onclick');
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      showDetail(idx);
    });
  });

  // 滚动离开区域时隐藏详情
  function checkWrapperVisibility() {
    const rect = folkloreWrapper.getBoundingClientRect();
    const isCompletelyOut = rect.top >= window.innerHeight || rect.bottom <= 0;
    if (isCompletelyOut && activeIndex !== -1) {
      hideAllDetails();
    }
  }

  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(checkWrapperVisibility, 80);
  });
  window.addEventListener('resize', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(checkWrapperVisibility, 80);
  });
  setTimeout(checkWrapperVisibility, 100);

  // 点击非卡片/详情区域关闭
  document.addEventListener('click', (e) => {
    const isCard = e.target.closest('.folklore-card');
    const isDetail = e.target.closest('.detail-grid-row');
    if (!isCard && !isDetail && activeIndex !== -1) {
      hideAllDetails();
    }
  });

  // 样式注入
  const style = document.createElement('style');
  style.textContent = `
    .detail-grid-row {
      margin: 12px 0 0 0;
      transition: none;
    }
    .detail-inner-card {
      background: rgba(30, 35, 55, 0.97);
      backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 18px;
      border: 1px solid rgba(255, 170, 68, 0.6);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    }
    .detail-img-area {
      width: 100%;
      min-height: 150px;
      margin-bottom: 18px;
      border-radius: 16px;
      overflow: hidden;
    }
    .detail-img-area img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }
    .detail-title {
      font-size: 1.3rem;
      font-weight: bold;
      color: #ffcc66;
      margin-bottom: 14px;
      border-left: 5px solid #ffaa44;
      padding-left: 14px;
    }
    .detail-desc {
      color: #f0f0f0;
      line-height: 1.6;
      font-size: 0.95rem;
      margin-bottom: 16px;
    }
    .detail-tag {
      display: inline-block;
      background: rgba(255, 170, 68, 0.2);
      padding: 4px 14px;
      border-radius: 40px;
      font-size: 0.75rem;
      color: #ffdd99;
      border: 0.5px solid rgba(255, 170, 68, 0.5);
    }
    @media (max-width: 768px) {
      .detail-inner-card { padding: 12px; }
      .detail-title { font-size: 1rem; }
      .detail-desc { font-size: 0.85rem; }
      .detail-img-area { min-height: 110px; }
      .detail-img-area img { height: 110px; }
    }
  `;
  document.head.appendChild(style);
})();

// 方案二：进入区域后延迟展开
(function() {
  const expandBox = document.getElementById('expandBox');
  const eyesightRight = document.getElementById('eyesightRight');
  
  if (!expandBox || !eyesightRight) return;
  
  let imageLoaded = false;
  let expandTimer = null;
  let hasTriggeredExpand = false;
  
  const img = new Image();
  img.onload = function() {
    imageLoaded = true;
  };
  img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Zhaozhou_Bridge/800px-Zhaozhou_Bridge.jpg';
  
  function checkAndToggle() {
    const rect = eyesightRight.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isInViewport = rect.top < windowHeight - 100 && rect.bottom > 100;
    
    if (isInViewport && !hasTriggeredExpand) {
      expandTimer = setTimeout(() => {
        expandBox.classList.add('expanded');
        if (imageLoaded) {
          expandBox.style.backgroundImage = `url('${img.src}')`;
        } else {
          expandBox.style.backgroundImage = "url('https://picsum.photos/id/104/500/400')";
        }
        hasTriggeredExpand = true;
      }, 100);
    } else if (!isInViewport && hasTriggeredExpand) {
      if (expandTimer) {
        clearTimeout(expandTimer);
        expandTimer = null;
      }
      expandBox.classList.remove('expanded');
      expandBox.style.backgroundImage = '';
      hasTriggeredExpand = false;
    } else if (!isInViewport && expandTimer) {
      clearTimeout(expandTimer);
      expandTimer = null;
    }
  }
  
  window.addEventListener('scroll', checkAndToggle);
  window.addEventListener('resize', checkAndToggle);
  checkAndToggle();
})();

(function() {
  const bottomChart = document.getElementById('bottomChart');
  if (!bottomChart) return;
  let hasSlid = false;
  function checkScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150;
    if (isNearBottom && !hasSlid) {
      bottomChart.classList.add('slide-in');
      hasSlid = true;
    }
  }
  window.addEventListener('scroll', checkScroll);
  setTimeout(checkScroll, 100);
})();

(function() {
  const scrollNav = document.getElementById('scrollNav');
  const scrollTab = document.getElementById('scrollTab');
  
  if (!scrollNav || !scrollTab) return;
  
  // 点击卷轴头切换菜单显示/隐藏
  scrollTab.addEventListener('click', function(e) {
    e.stopPropagation();
    scrollNav.classList.toggle('open');
  });
  
  // 点击页面其他地方关闭菜单
  document.addEventListener('click', function(e) {
    if (!scrollNav.contains(e.target)) {
      scrollNav.classList.remove('open');
    }
  });
  
  // 点击菜单项后关闭菜单
  const menuItems = document.querySelectorAll('.scroll-item');
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      scrollNav.classList.remove('open');
    });
  });
})();

// ============================================================
// 增强版弹窗函数 - 支持所有卡片类型 + 完整图文内容
// ============================================================

// 通用弹窗函数（支持所有类型）
function showModal(type, title, desc) {
    const modal = document.getElementById('modal');
    if (!modal) {
        console.error('弹窗元素未找到');
        return;
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = desc;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    
    // 根据 type 显示不同的图片或 SVG
    let imgHtml = '';
    
    // 敞肩拱结构示意 - 显示SVG剖面图
    if (type === 'arch') {
        imgHtml = `<svg class="modal-image" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; background:#2a2a3a; border-radius:16px; margin-bottom:16px;">
            <rect width="350" height="200" fill="#2a2a3a" rx="8"/>
            <path d="M20 170 Q175 30 330 170" fill="none" stroke="#c9a96e" stroke-width="28" stroke-linecap="round"/>
            <path d="M55 150 Q90 90 125 150" fill="none" stroke="#d4b87a" stroke-width="14" stroke-linecap="round"/>
            <path d="M95 135 Q130 75 165 135" fill="none" stroke="#d4b87a" stroke-width="14" stroke-linecap="round"/>
            <path d="M185 135 Q220 75 255 135" fill="none" stroke="#d4b87a" stroke-width="14" stroke-linecap="round"/>
            <path d="M225 150 Q260 90 295 150" fill="none" stroke="#d4b87a" stroke-width="14" stroke-linecap="round"/>
            <text x="175" y="25" text-anchor="middle" font-size="10" fill="#ffdd99" font-weight="bold">大拱 跨径37.02米</text>
            <text x="75" y="70" text-anchor="middle" font-size="10" fill="#d4b87a">小拱</text>
            <text x="275" y="70" text-anchor="middle" font-size="10" fill="#d4b87a">小拱</text>
            <text x="175" y="195" text-anchor="middle" font-size="11" fill="#a8987a" font-family="Noto Serif SC">赵州桥敞肩拱剖面结构示意</text>
        </svg>`;
    }
    // 主拱结构
    else if (type === 'main-arch') {
        imgHtml = `<img class="modal-image" src="./images/main-arch.jpg" alt="主拱结构" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/15/500/300'">`;
    }
    // 敞肩小拱
    else if (type === 'small-arch') {
        imgHtml = `<img class="modal-image" src="./images/small-arch.jpg" alt="敞肩小拱" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/96/500/300'">`;
    }
    // 铁件榫卯
    else if (type === 'iron') {
        imgHtml = `<img class="modal-image" src="./images/iron-join.jpg" alt="铁件榫卯" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/35/500/300'">`;
    }
    // 桥全长
    else if (type === 'p1') {
        imgHtml = `<img class="modal-image" src="./images/bridge-length.jpg" alt="桥全长" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/123/500/300'">`;
    }
    // 净跨径
    else if (type === 'p2') {
        imgHtml = `<img class="modal-image" src="./images/span-length.jpg" alt="净跨径" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/125/500/300'">`;
    }
    // 拱高
    else if (type === 'p3') {
        imgHtml = `<img class="modal-image" src="./images/arch-height.jpg" alt="拱高" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/126/500/300'">`;
    }
    // 拱券数量
    else if (type === 'p4') {
        imgHtml = `<img class="modal-image" src="./images/arch-number.jpg" alt="拱券数量" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/127/500/300'">`;
    }
    // 历史跨度
    else if (type === 'p5') {
        imgHtml = `<img class="modal-image" src="./images/history-span.jpg" alt="历史跨度" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/128/500/300'">`;
    }
    // 基础处理
    else if (type === 'proc1') {
        imgHtml = `<img class="modal-image" src="./images/foundation.jpg" alt="基础处理" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/100/500/300'">`;
    }
    // 拱架搭设
    else if (type === 'proc2') {
        imgHtml = `<img class="modal-image" src="./images/scaffolding.jpg" alt="拱架搭设" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/101/500/300'">`;
    }
    // 拱券砌筑
    else if (type === 'proc3') {
        imgHtml = `<img class="modal-image" src="./images/arch-masonry.jpg" alt="拱券砌筑" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/102/500/300'">`;
    }
    // 铁件加固
    else if (type === 'proc4') {
        imgHtml = `<img class="modal-image" src="./images/iron-reinforce.jpg" alt="铁件加固" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/103/500/300'">`;
    }
    // 桥面铺装
    else if (type === 'proc5') {
        imgHtml = `<img class="modal-image" src="./images/deck-paving.jpg" alt="桥面铺装" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/104/500/300'">`;
    }
    // 工程力学典范
    else if (type === 'v1') {
        imgHtml = `<img class="modal-image" src="./images/engineering-mechanics.jpg" alt="工程力学典范" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/20/500/300'">`;
    }
    // 建筑艺术精品
    else if (type === 'v2') {
        imgHtml = `<img class="modal-image" src="./images/architectural-art.jpg" alt="建筑艺术精品" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/21/500/300'">`;
    }
    // 文化遗产瑰宝
    else if (type === 'v3') {
        imgHtml = `<img class="modal-image" src="./images/cultural-heritage.jpg" alt="文化遗产瑰宝" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/22/500/300'">`;
    }
    // 民间传说类型
    else if (title === '鲁班造桥') {
        imgHtml = `<img class="modal-image" src="./images/lubanzaoqiao.png" alt="鲁班造桥" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/1/500/300'">`;
    }
    else if (title === '张果老骑驴试桥') {
        imgHtml = `<img class="modal-image" src="./images/zhanguolaoshiqiao.png" alt="张果老试桥" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/2/500/300'">`;
    }
    else if (title === '柴王爷推车碾轧') {
        imgHtml = `<img class="modal-image" src="./images/chaiwangyetuiche.png" alt="柴王爷推车" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/3/500/300'">`;
    }
    else if (title === '桥上仙迹传说') {
        imgHtml = `<img class="modal-image" src="./images/qiao-shang-xian-ji.png" alt="桥上仙迹" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/4/500/300'">`;
    }
    // 文化艺术卡片
    else if (title === '蛟龙穿岩') {
        imgHtml = `<img class="modal-image" src="./images/drigon.png" alt="蛟龙穿岩" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/5/500/300'">`;
    }
    else if (title === '桥头石狮') {
        imgHtml = `<img class="modal-image" src="./images/bridge-Lion.png" alt="桥头石狮" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/6/500/300'">`;
    }
    else if (title === '望柱雕饰') {
        imgHtml = `<img class="modal-image" src="./images/wang-zhu.png" alt="望柱雕饰" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/7/500/300'">`;
    }
    else if (title === '龙兽浮雕') {
        imgHtml = `<img class="modal-image" src="./images/long-shou-fu-diao.png" alt="龙兽浮雕" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/8/500/300'">`;
    }
    else if (title === '桥上仙迹') {
        imgHtml = `<img class="modal-image" src="./images/qiao-shang-xian-ji.png" alt="桥上仙迹" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/9/500/300'">`;
    }
    // 默认图片 - 赵州桥风景图
    else {
        imgHtml = `<img class="modal-image" src="./images/zhaozhou-bridge.jpg" alt="赵州桥" style="width:100%; border-radius:16px; margin-bottom:16px;" onerror="this.src='https://picsum.photos/id/104/500/300'">`;
    }
    
    modalBody.innerHTML = imgHtml;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 监听弹窗关闭事件
document.getElementById('modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ESC 键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// 滚动动画 - 监听 .animate-on-scroll 元素
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
        observer.observe(el);
    });
});

// 翻转卡牌弹窗功能
const floatingOverlay = document.getElementById('floatingCardOverlay');
const floatingCard = document.getElementById('floatingCard');
const floatingIcon = document.getElementById('floatingIcon');
const floatingTitle = document.getElementById('floatingTitle');
const floatingImg = document.getElementById('floatingImg');
const floatingDesc = document.getElementById('floatingDesc');

const cardData = {
    '🐉': {
        title: '蛟龙穿岩',
        icon: '🐉',
        img: './images/drigon.png',
        desc: '赵州桥两侧栏板雕刻“蛟龙穿岩”，龙身穿过岩层，呈现强烈的透视感与动态美。据研究，这些栏板雕刻属于隋代原物，是研究隋唐石雕艺术的珍贵实物资料。'
    },
    '🦁': {
        title: '桥头石狮',
        icon: '🦁',
        img: './images/bridge-Lion.png',
        desc: '赵州桥两侧的石狮雕刻形态各异，有的蹲踞，有的回首，造型生动，展现了隋唐石雕艺术的雄浑大气。'
    },
    '🏛️': {
        title: '望柱雕饰',
        icon: '🏛️',
        img: './images/wang-zhu.png',
        desc: '望柱是栏板的支撑构件，赵州桥的望柱头雕刻有莲瓣、石榴等多种造型，线条流畅，比例协调。'
    },
    '✨': {
        title: '龙兽浮雕',
        icon: '✨',
        img: './images/long-shou-fu-diao.png',
        desc: '明代修缮时仿照原貌雕刻的龙兽图案，延续了隋唐石雕艺术的风格，同时又有所创新。'
    },
    '⭐': {
        title: '桥上仙迹',
        icon: '⭐',
        img: './images/qiao-shang-xian-ji.png',
        desc: '赵州桥被誉为“神仙之地”，留下了众多仙人足迹。桥上有驴蹄印（张果老）、车辙印（柴王爷）、膝盖印（鲁班）等多种“仙迹”。'
    }
};

function showFloatingCard(icon) {
    const data = cardData[icon];
    if (!data) return;
    
    floatingIcon.innerText = data.icon;
    floatingTitle.innerText = data.title;
    floatingImg.src = data.img;
    floatingDesc.innerText = data.desc;
    
    floatingCard.classList.remove('flipped');
    floatingOverlay.classList.add('active');
    
    setTimeout(() => {
        floatingCard.classList.add('flipped');
    }, 100);
}

function closeFloatingCard() {
    floatingOverlay.classList.remove('active');
    floatingCard.classList.remove('flipped');
}

floatingOverlay?.addEventListener('click', function(e) {
    if (e.target === floatingOverlay) {
        closeFloatingCard();
    }
});

// 绑定扇形卡片点击事件
document.querySelectorAll('.container .card').forEach(card => {
    card.addEventListener('click', function(e) {
        e.stopPropagation();
        const icon = this.innerText.trim();
        showFloatingCard(icon);
    });
});

// ============================================================
// 时间轴卡片手风琴效果（如果需要在 timeline 中使用）
// ============================================================
document.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('click', function(e) {
        e.stopPropagation();
        if (this.classList.contains('active')) {
            this.classList.remove('active');
        } else {
            document.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// ============================================================
// 卡牌飞入动画（滚动到千年纪事区域时触发，可重复）
// ============================================================
(function() {
    const timelineSection = document.querySelector('.timeline-section');
    const culturalSection = document.getElementById('culturalSection');
    
    if (!timelineSection || !culturalSection) return;
    
    function checkAndToggle() {
        const rect = timelineSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            culturalSection.classList.add('visible');
        } else {
            culturalSection.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', checkAndToggle);
    setTimeout(checkAndToggle, 100);
})();
// ============================================================
// 结构剖面图弹窗 - 仅针对 .structure-visual
// ============================================================
(function() {
  // 创建弹窗元素（如果不存在）
  let popupModal = document.getElementById('structurePopup');
  if (!popupModal) {
    popupModal = document.createElement('div');
    popupModal.id = 'structurePopup';
    popupModal.className = 'structure-popup';
    popupModal.innerHTML = `
      <div class="popup-overlay"></div>
      <div class="popup-container">
        <button class="popup-close">×</button>
        <div class="popup-content">
          <img class="popup-image" src="" alt="结构图">
          <h3 class="popup-title"></h3>
          <p class="popup-desc"></p>
        </div>
      </div>
    `;
    document.body.appendChild(popupModal);
  }

  const popupOverlay = popupModal.querySelector('.popup-overlay');
  const popupClose = popupModal.querySelector('.popup-close');
  const popupImage = popupModal.querySelector('.popup-image');
  const popupTitle = popupModal.querySelector('.popup-title');
  const popupDesc = popupModal.querySelector('.popup-desc');

  function closePopup() {
    popupModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openPopup(title, desc, imageUrl) {
    popupTitle.textContent = title;
    popupDesc.textContent = desc;
    popupImage.src = imageUrl;
    popupModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', closePopup);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popupModal.classList.contains('active')) {
      closePopup();
    }
  });

  // 只绑定 .structure-visual 元素
  const structureVisual = document.querySelector('.structure-visual');
  if (structureVisual) {
    structureVisual.addEventListener('click', function() {
      openPopup(
        '赵州桥敞肩拱结构剖面图',
        '赵州桥历经隋、唐、宋、元、明、清至今，功能不断演变。最初为南北交通要道与战略通道，后逐渐成为商贸枢纽与城市文化标志。近现代转为公路辅桥及建筑研究，至当代转型为文旅展示与文化遗产核心载体，承载千年历史价值。',
        './images/zhao-bridge-white.png'
      );
    });
  }
})();
// ============================================================
// 鼠标经过 content-section 区域时改变鼠标样式
// ============================================================
(function() {
  // 获取所有需要改变鼠标样式的元素
  const targetSections = document.querySelectorAll('.content-section.animate-on-scroll.visible');
  
  // 如果初始没有 .visible，使用 MutationObserver 监听类名变化
  function applyCursorStyle(element) {
    element.style.cursor = 'pointer';  // 小手样式，可改成其他
    // 其他可选样式：'help', 'move', 'crosshair', 'grab', 'zoom-in' 等
  }
  
  function removeCursorStyle(element) {
    element.style.cursor = '';
  }
  
  // 处理已有元素
  targetSections.forEach(section => {
    applyCursorStyle(section);
  });
  
  // 监听动态添加 .visible 类的情况
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList && target.classList.contains('visible')) {
          if (target.classList.contains('content-section') && target.classList.contains('animate-on-scroll')) {
            applyCursorStyle(target);
          }
        }
      }
    });
  });
  
  // 观察所有 .content-section.animate-on-scroll 元素
  const allSections = document.querySelectorAll('.content-section.animate-on-scroll');
  allSections.forEach(section => {
    observer.observe(section, { attributes: true });
  });
  
  // 同时也给父容器 .deconstruction-wrapper 内的所有可点击元素添加样式
  const deconstructionWrapper = document.querySelector('.deconstruction-wrapper');
  if (deconstructionWrapper) {
    deconstructionWrapper.style.cursor = 'default';
    
    // 给内部所有可交互元素添加小手样式
    const interactiveElements = deconstructionWrapper.querySelectorAll('.structure-visual, .structure-item, .bar-item, .process-step, .value-card');
    interactiveElements.forEach(el => {
      el.style.cursor = 'pointer';
    });
  }
})();

// ============================================================
// 鼠标拖尾效果（只对特定区域生效）
// ============================================================
(function() {
  // 配置参数
  const config = {
    maxTrailLength: 8,
    lineWidth: 2.5,
    startColor: [212, 184, 122],  // #d4b87a 金色
    endColor: [255, 200, 100],    // 浅金色
    fadeOutSpeed: 1
  };
  
  // 是否在目标区域内
  let isInTargetArea = false;
  
  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'mouseTrailCanvas';
  document.body.appendChild(canvas);
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  let trail = [];
  let lastMousePosition = { x: 0, y: 0 };
  let animationId = null;
  
  // 判断鼠标是否在目标区域内
  function isMouseInTargetArea(x, y) {
    const targetArea = document.querySelector('.deconstruction-wrapper');
    if (!targetArea) return false;
    
    // 获取元素边界
    const rect = targetArea.getBoundingClientRect();
    // 考虑滚动偏移
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const mouseX = x + scrollX;
    const mouseY = y + scrollY;
    
    return mouseX >= rect.left && mouseX <= rect.right && 
           mouseY >= rect.top && mouseY <= rect.bottom;
  }
  
  function lerpColor(a, b, amount) {
    const [ar, ag, ab] = a;
    const [br, bg, bb] = b;
    return [
      ar + amount * (br - ar),
      ag + amount * (bg - ag),
      ab + amount * (bb - ab)
    ].map(Math.round);
  }
  
  function draw() {
    if (!isInTargetArea) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 1; i < trail.length; i++) {
      const gradientRatio = i / trail.length;
      const color = lerpColor(config.startColor, config.endColor, gradientRatio);
      
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.lineWidth = config.lineWidth;
      ctx.stroke();
    }
  }
  
  function updateTrail() {
    if (!isInTargetArea) {
      if (trail.length > 0) {
        trail = [];
      }
      return;
    }
    
    if (lastMousePosition.x !== 0 && lastMousePosition.y !== 0) {
      trail.push({ ...lastMousePosition });
    }
    
    if (trail.length > config.maxTrailLength) {
      trail = trail.slice(config.fadeOutSpeed);
    }
  }
  
  // 鼠标移动
  window.addEventListener('mousemove', (event) => {
    lastMousePosition.x = event.clientX;
    lastMousePosition.y = event.clientY;
    
    // 检查是否在目标区域
    const inArea = isMouseInTargetArea(event.clientX, event.clientY);
    if (inArea !== isInTargetArea) {
      isInTargetArea = inArea;
      if (!isInTargetArea) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        trail = [];
      }
    }
  });
  
  function animate() {
    updateTrail();
    draw();
    animationId = requestAnimationFrame(animate);
  }
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})()// ============================================================
// 鼠标拖尾效果 - 仅对特定区域生效
// ============================================================
(function() {
  // 配置参数
  const config = {
    maxTrailLength: 12,
    lineWidth: 2.5,
    startColor: [212, 184, 122],  // 金色 #d4b87a
    endColor: [255, 200, 100],    // 浅金色
    fadeOutSpeed: 1
  };
  
  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'mouseTrailCanvas';
  document.body.appendChild(canvas);
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  let trail = [];
  let lastMousePosition = { x: 0, y: 0 };
  let animationId = null;
  let isInTargetArea = false;
  
  // 获取目标区域（所有 .content-section.animate-on-scroll.visible 及其延时版本）
  function getTargetAreas() {
    const selectors = [
      '.content-section.animate-on-scroll.visible',
      '.content-section.animate-on-scroll.delay-1.visible',
      '.content-section.animate-on-scroll.delay-2.visible',
      '.content-section.animate-on-scroll.delay-3.visible'
    ];
    return document.querySelectorAll(selectors.join(','));
  }
  
  // 判断鼠标是否在目标区域内
  function isMouseInTargetArea(x, y) {
    const targetAreas = getTargetAreas();
    for (const area of targetAreas) {
      const rect = area.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return true;
      }
    }
    return false;
  }
  
  // 线性插值颜色
  function lerpColor(a, b, amount) {
    const [ar, ag, ab] = a;
    const [br, bg, bb] = b;
    return [
      ar + amount * (br - ar),
      ag + amount * (bg - ag),
      ab + amount * (bb - ab)
    ].map(Math.round);
  }
  
  // 绘制拖尾
  function draw() {
    if (!isInTargetArea) {
      // 不在区域内时清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 1; i < trail.length; i++) {
      const gradientRatio = i / trail.length;
      const color = lerpColor(config.startColor, config.endColor, gradientRatio);
      
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.lineWidth = config.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
  
  // 更新轨迹
  function updateTrail() {
    if (!isInTargetArea) {
      // 不在区域内时清空轨迹
      if (trail.length > 0) {
        trail = [];
      }
      return;
    }
    
    if (lastMousePosition.x !== 0 && lastMousePosition.y !== 0) {
      trail.push({ ...lastMousePosition });
    }
    
    if (trail.length > config.maxTrailLength) {
      trail = trail.slice(config.fadeOutSpeed);
    }
  }
  
  // 监听鼠标移动
  window.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const inArea = isMouseInTargetArea(mouseX, mouseY);
    
    // 状态变化时清空轨迹
    if (inArea !== isInTargetArea) {
      isInTargetArea = inArea;
      trail = [];
      if (!isInTargetArea) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    lastMousePosition.x = mouseX;
    lastMousePosition.y = mouseY;
  });
  
  // 监听 DOM 变化（当元素动态添加 .visible 类时重新检测）
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // 重新计算当前鼠标位置是否在区域内
        if (lastMousePosition.x !== 0 || lastMousePosition.y !== 0) {
          const inArea = isMouseInTargetArea(lastMousePosition.x, lastMousePosition.y);
          if (inArea !== isInTargetArea) {
            isInTargetArea = inArea;
            trail = [];
            if (!isInTargetArea) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
      }
    });
  });
  
  // 观察目标元素
  const targetElements = document.querySelectorAll('.content-section.animate-on-scroll');
  targetElements.forEach(el => {
    observer.observe(el, { attributes: true });
  });
  
  // 动画循环
  function animate() {
    updateTrail();
    draw();
    animationId = requestAnimationFrame(animate);
  }
  animate();
  
  // 窗口大小改变时重置 canvas 尺寸
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();;