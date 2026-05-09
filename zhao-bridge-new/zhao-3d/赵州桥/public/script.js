// 碑文数据
const bridgeInscription = {
  title: '赵州桥碑文',
  content: `赵郡洨河石桥，隋匠李春之迹也，制造奇特，人不知其所为。

凡四十余年，大水没溺不可胜计，然桥皆无坏。询之父老，皆云：用力之初，计木之多少，权衡之轻重，然后结构使然也。

桥成之后，虽经洪水暴集，终不坏也。盖因其拱肩敞空，泄洪有力也。

铭曰：
石桥蜿蜒，洨水之滨。
千年不朽，万古犹新。
匠心独运，智慧无垠。`,
  author: '—— 唐·张嘉贞《安济桥铭》节选'
};

const liChunInscription = {
  title: '李春赞',
  content: `李春者，隋之大匠也。

隋大业间，奉诏造赵郡石桥。春以过人智巧，穷极物理，创为敞肩拱桥。

桥成，往来者莫不称便。千有余年，车马履践，风雨不移。

春之功大矣！虽千载之下，犹可想见其人焉。

赞曰：
洨河之桥，李春所造。
巧夺天工，利民永保。
桥以人传，人以桥照。
巍巍匠心，千古永曜。`,
  author: '—— 后世赞颂'
};

// 热点详情数据
const hotspotDetails = {
  1: { 
    title: '宋代石塔', 
    era: '宋代（960-1279）', 
    type: '石刻建筑', 
    func: '镇守桥梁、标志定位', 
    desc: '宋代增建的石塔，高约3米，采用多层密檐式结构，雕刻精美，体现了宋代石刻艺术的高超水平。' 
  },
  2: { 
    title: '石狮像', 
    era: '宋代（960-1279）', 
    type: '石刻造像', 
    func: '镇守桥梁，辟邪纳吉', 
    desc: '石狮造型雄伟，线条流畅，具有宋代石刻艺术的典型特征，体现了当时高超的雕刻工艺。' 
  },
  3: { 
    title: '龙首饰', 
    era: '隋代（605-618）', 
    type: '石雕装饰', 
    func: '装饰美化，象征吉祥', 
    desc: '桥栏杆两端雕刻的龙形装饰，龙头高昂，龙身蜿蜒，造型生动威武，展现了隋代石雕艺术的风采。' 
  },
  4: { 
    title: '石碑刻', 
    era: '唐代（618-907）', 
    type: '碑刻铭文', 
    func: '记载历史，永志纪念', 
    desc: '唐代张嘉贞所撰《安济桥铭》，记载了赵州桥的建造历史和工艺特点，是研究赵州桥的重要史料。' 
  }
};

// 滚动到下一页
function scrollToNextPage() {
  window.scrollTo({ 
    top: window.innerHeight, 
    behavior: 'smooth' 
  });
}

// 滚动到指定页面
function scrollToPage(pageIndex) {
  window.scrollTo({ 
    top: pageIndex * window.innerHeight, 
    behavior: 'smooth' 
  });
}

// 导航到指定页面
function navigateTo(pageIndex) {
  // 更新导航按钮状态
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn, index) => {
    if (index === pageIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 滚动到目标页面
  scrollToPage(pageIndex);
}

// 显示碑文弹窗
function showInscription(type) {
  const modal = document.getElementById('inscriptionModal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const authorEl = document.getElementById('modalAuthor');
  
  if (type === 'bridge') {
    titleEl.textContent = bridgeInscription.title;
    bodyEl.textContent = bridgeInscription.content;
    authorEl.textContent = bridgeInscription.author;
  } else {
    titleEl.textContent = liChunInscription.title;
    bodyEl.textContent = liChunInscription.content;
    authorEl.textContent = liChunInscription.author;
  }
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 关闭碑文弹窗
function closeInscription() {
  const modal = document.getElementById('inscriptionModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// 显示热点详情
function showHotspotDetail(id) {
  const panel = document.getElementById('detailPanel');
  const detail = hotspotDetails[id];
  
  if (detail) {
    document.getElementById('detailTitle').textContent = detail.title;
    document.getElementById('detailEra').textContent = detail.era;
    document.getElementById('detailType').textContent = detail.type;
    document.getElementById('detailFunc').textContent = detail.func;
    document.getElementById('detailDesc').textContent = detail.desc;
    
    panel.classList.add('show');
  }
}

// 关闭详情面板
function closeDetailPanel() {
  const panel = document.getElementById('detailPanel');
  panel.classList.remove('show');
}

// 更新页面指示器
function updatePageIndicator() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const page = Math.round(scrollTop / windowHeight);
  
  const dots = document.querySelectorAll('.indicator-dot');
  dots.forEach((dot, index) => {
    if (index === page) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
  
  // 更新底部导航栏状态
  const navBtns = document.querySelectorAll('.page-2 .nav-btn');
  navBtns.forEach((btn, index) => {
    if (index === page) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 监听滚动事件更新指示器
  window.addEventListener('scroll', updatePageIndicator);
  
  // 初始更新
  updatePageIndicator();
  
  // ESC 键关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeInscription();
      closeDetailPanel();
    }
  });
});
