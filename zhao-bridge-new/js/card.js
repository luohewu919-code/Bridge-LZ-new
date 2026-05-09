// ============================================================
// 原有弹窗功能（已添加图片支持）
// ============================================================
function showModal(title, desc) {
  const modal = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  
  if (modal && modalTitle && modalDesc) {
    modalTitle.innerText = title;
    
    // 图片路径
    let imgHtml = '';
    if (title === '鲁班造桥') {
      imgHtml = '<div style="text-align:center; margin-bottom:12px;"><img src="./images/lubanzaoqiao.png" alt="鲁班造桥" style="max-width:100%; max-height:140px; border-radius:12px;" onerror="this.style.display=\'none\'"></div>';
    } else if (title === '张果老骑驴试桥') {
      imgHtml = '<div style="text-align:center; margin-bottom:12px;"><img src="./images/zhanguolaoshiqiao.png" alt="张果老试桥" style="max-width:100%; max-height:140px; border-radius:12px;" onerror="this.style.display=\'none\'"></div>';
    } else if (title === '柴王爷推车碾轧') {
      imgHtml = '<div style="text-align:center; margin-bottom:12px;"><img src="./images/chaiwangyetuiche.png" alt="柴王爷推车" style="max-width:100%; max-height:140px; border-radius:12px;" onerror="this.style.display=\'none\'"></div>';
    } else if (title === '桥上仙迹传说') {
      imgHtml = '<div style="text-align:center; margin-bottom:12px;"><img src="./images/qiao-shang-xian-ji.png" alt="桥上仙迹" style="max-width:100%; max-height:140px; border-radius:12px;" onerror="this.style.display=\'none\'"></div>';
    }
    
    // 组合：图片 + 文字（换行转 br）
    const textHtml = desc.replace(/\n/g, '<br>');
    modalDesc.innerHTML = imgHtml + textHtml;
    
    modal.classList.add('active');
  }
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) {
    modal.classList.remove('active');
  }
}

document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// ============================================================
// 中间翻转卡牌弹窗功能
// ============================================================
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

document.querySelectorAll('.container .card').forEach(card => {
  card.addEventListener('click', function(e) {
    e.stopPropagation();
    const icon = this.innerText.trim();
    showFloatingCard(icon);
  });
});

// ============================================================
// 时间轴卡片手风琴效果
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