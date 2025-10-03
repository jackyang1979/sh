// 主題切換與行為互動
(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const themeToggle = document.querySelector('.theme-toggle');
  const backToTop = document.querySelector('.back-to-top');

  // 行動版選單切換
  navToggle?.addEventListener('click', () => {
    navList?.classList.toggle('open');
  });

  // 主題切換（深色 / 淺色）
  const THEME_KEY = 'shenhanga-theme';
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  };
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // 返回頂部
  backToTop?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 表單提交提示
  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', () => {
    alert('已收到您的訊息（示範用），感謝！');
  });

  // --- 輪播設定（本機）與渲染工具 ---
  const DEFAULT_CAROUSEL = {
    autoplay: true,
    interval: 4000,
    images: [
      { src: 'logo.png', alt: '公司識別 Logo' },
      { src: 'https://picsum.photos/seed/sh-1/1200/800', alt: '示例照片 1' },
      { src: 'https://picsum.photos/seed/sh-2/1200/800', alt: '示例照片 2' }
    ]
  };
  function loadCarouselConfig() {
    try {
      const raw = localStorage.getItem('carouselConfig');
      if (!raw) return DEFAULT_CAROUSEL;
      const cfg = JSON.parse(raw);
      if (!cfg || !Array.isArray(cfg.images)) return DEFAULT_CAROUSEL;
      return { ...DEFAULT_CAROUSEL, ...cfg };
    } catch (e) { return DEFAULT_CAROUSEL; }
  }
  function saveCarouselConfig(cfg) {
    localStorage.setItem('carouselConfig', JSON.stringify(cfg));
  }
  function renderCarousel(carouselEl, cfg) {
    const track = carouselEl.querySelector('.carousel-track');
    if (!track) return;
    track.innerHTML = '';
    cfg.images.forEach(img => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt || '';
      slide.appendChild(image);
      track.appendChild(slide);
    });
    carouselEl.setAttribute('data-autoplay', String(!!cfg.autoplay));
    carouselEl.setAttribute('data-interval', String(cfg.interval || 4000));
  }

  // 照片輪播：自動播放、上一張/下一張、指示點
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    // 先依據本機設定重建輪播內容
    const cfg = loadCarouselConfig();
    renderCarousel(carousel, cfg);
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const autoPlay = carousel.getAttribute('data-autoplay') === 'true';
    const intervalMs = Number(carousel.getAttribute('data-interval') || cfg.interval || 4000);

    let index = 0;
    let timer = null;

    // 產生指示點
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `第 ${i + 1} 張`);
      dot.addEventListener('click', () => {
        index = i;
        update();
        restartAuto();
      });
      dotsWrap?.appendChild(dot);
    });
    const dots = Array.from(dotsWrap?.querySelectorAll('button') || []);

    function update() {
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function next() {
      index = (index + 1) % slides.length;
      update();
    }
    function prev() {
      index = (index - 1 + slides.length) % slides.length;
      update();
    }

    prevBtn?.addEventListener('click', () => { prev(); restartAuto(); });
    nextBtn?.addEventListener('click', () => { next(); restartAuto(); });

    function startAuto() {
      if (!autoPlay || timer) return;
      timer = setInterval(next, intervalMs);
    }
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restartAuto() { stopAuto(); startAuto(); }

    // 滑鼠懸停暫停，移出恢復
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // 初始化
    update();
    startAuto();
  }

  // --- 後台（Admin）邏輯：本機管理輪播 ---
  const adminPanel = document.querySelector('.admin-panel');
  if (adminPanel) {
    // ===== 登入保護 =====
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'admin123';
    const AUTH_KEY = 'adminAuthenticated';
    const loginEl = document.getElementById('adminLogin');
    const contentEl = document.getElementById('adminContent');
    const loginBtn = document.getElementById('adminLoginBtn');
    const userInput = document.getElementById('adminUser');
    const passInput = document.getElementById('adminPass');

    function showLogin() {
      loginEl?.removeAttribute('hidden');
      contentEl?.setAttribute('hidden', '');
    }
    function showContent() {
      contentEl?.removeAttribute('hidden');
      loginEl?.setAttribute('hidden', '');
    }
    const authed = localStorage.getItem(AUTH_KEY) === 'true';
    if (authed) {
      showContent();
    } else {
      showLogin();
    }
    loginBtn?.addEventListener('click', () => {
      const u = (userInput?.value || '').trim();
      const p = passInput?.value || '';
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        localStorage.setItem(AUTH_KEY, 'true');
        showContent();
      } else {
        alert('帳號或密碼錯誤');
      }
    });
    passInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loginBtn?.click();
    });

    let cfg = loadCarouselConfig();
    const autoplayInput = adminPanel.querySelector('#autoplay');
    const intervalInput = adminPanel.querySelector('#interval');
    const imageList = adminPanel.querySelector('#imageList');
    const fileInput = adminPanel.querySelector('#fileInput');
    const titleInput = adminPanel.querySelector('#titleInput');
    const addImageBtn = adminPanel.querySelector('#addImageBtn');
    const saveConfigBtn = adminPanel.querySelector('#saveConfigBtn');
    const clearConfigBtn = adminPanel.querySelector('#clearConfigBtn');
    const importInput = adminPanel.querySelector('#importConfigInput');
    const importBtn = adminPanel.querySelector('#importConfigBtn');
    const exportBtn = adminPanel.querySelector('#exportConfigBtn');

    autoplayInput.checked = !!cfg.autoplay;
    intervalInput.value = cfg.interval || 4000;

    function renderList() {
      imageList.innerHTML = '';
      cfg.images.forEach((img, idx) => {
        const li = document.createElement('li');
        li.className = 'admin-image-item';
        li.innerHTML = `
          <img src="${img.src}" alt="${img.alt || ''}">
          <input type="text" value="${img.alt || ''}" data-index="${idx}" class="alt-input" placeholder="圖片說明">
          <div>
            <button class="move-up" data-index="${idx}">上移</button>
            <button class="move-down" data-index="${idx}">下移</button>
            <button class="remove" data-index="${idx}">刪除</button>
          </div>
        `;
        imageList.appendChild(li);
      });
    }
    renderList();

    addImageBtn.addEventListener('click', async () => {
      const file = fileInput.files?.[0];
      if (!file) { alert('請選擇圖片檔案'); return; }
      const title = titleInput.value.trim();
      const dataUrl = await fileToDataURL(file);
      cfg.images.push({ src: dataUrl, alt: title });
      renderList();
      fileInput.value = '';
      titleInput.value = '';
    });

    imageList.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.classList.contains('remove')) {
        const i = Number(t.dataset.index);
        cfg.images.splice(i, 1);
        renderList();
      } else if (t.classList.contains('move-up')) {
        const i = Number(t.dataset.index);
        if (i > 0) {
          const [img] = cfg.images.splice(i, 1);
          cfg.images.splice(i - 1, 0, img);
          renderList();
        }
      } else if (t.classList.contains('move-down')) {
        const i = Number(t.dataset.index);
        if (i < cfg.images.length - 1) {
          const [img] = cfg.images.splice(i, 1);
          cfg.images.splice(i + 1, 0, img);
          renderList();
        }
      }
    });

    imageList.addEventListener('input', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.classList.contains('alt-input')) {
        const i = Number(t.dataset.index);
        cfg.images[i].alt = t.value;
      }
    });

    saveConfigBtn.addEventListener('click', () => {
      cfg.autoplay = autoplayInput.checked;
      cfg.interval = Number(intervalInput.value || 4000);
      saveCarouselConfig(cfg);
      alert('已保存到本機瀏覽器。返回首頁查看效果。');
    });

    clearConfigBtn.addEventListener('click', () => {
      localStorage.removeItem('carouselConfig');
      cfg = loadCarouselConfig();
      autoplayInput.checked = !!cfg.autoplay;
      intervalInput.value = cfg.interval || 4000;
      renderList();
    });

    exportBtn.addEventListener('click', () => {
      const json = JSON.stringify(cfg, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'carousel-config.json';
      a.click();
    });

    importBtn.addEventListener('click', async () => {
      const file = importInput.files?.[0];
      if (!file) { alert('請選擇設定 JSON 檔'); return; }
      try {
        const text = await file.text();
        const obj = JSON.parse(text);
        cfg = { ...loadCarouselConfig(), ...obj };
        autoplayInput.checked = !!cfg.autoplay;
        intervalInput.value = cfg.interval || 4000;
        renderList();
      } catch (err) {
        alert('JSON 解析失敗，請確認格式');
      }
    });

    // ===== 文章管理 =====
    const POSTS_KEY = 'posts';
    function loadPosts() {
      try {
        const raw = localStorage.getItem(POSTS_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    }
    function savePosts(posts) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
    const postTitle = document.getElementById('postTitle');
    const postDate = document.getElementById('postDate');
    const postTags = document.getElementById('postTags');
    const postExcerpt = document.getElementById('postExcerpt');
    const postCover = document.getElementById('postCover');
    const postLink = document.getElementById('postLink');
    const addPostBtn = document.getElementById('addPostBtn');
    const savePostsBtn = document.getElementById('savePostsBtn');
    const postList = document.getElementById('postList');
    const importPostsInput = document.getElementById('importPostsInput');
    const importPostsBtn = document.getElementById('importPostsBtn');
    const exportPostsBtn = document.getElementById('exportPostsBtn');

    let posts = loadPosts();

    function renderPostList() {
      if (!postList) return;
      postList.innerHTML = '';
      posts.forEach((p, idx) => {
        const li = document.createElement('li');
        li.className = 'post-item';
        li.innerHTML = `
          <img src="${p.cover || 'logo.png'}" alt="cover">
          <div>
            <div class="title">${p.title || '(未命名)'} <small style="opacity:.7">${p.date || ''}</small></div>
            <div style="font-size:13px;opacity:.8;">${(p.tags||[]).join(', ')}</div>
          </div>
          <div class="actions">
            <button class="move-up" data-index="${idx}">上移</button>
            <button class="move-down" data-index="${idx}">下移</button>
            <button class="edit" data-index="${idx}">編輯</button>
            <button class="remove" data-index="${idx}">刪除</button>
          </div>
        `;
        postList.appendChild(li);
      });
    }
    renderPostList();

    addPostBtn?.addEventListener('click', () => {
      const t = (postTitle?.value || '').trim();
      if (!t) { alert('請輸入標題'); return; }
      const d = postDate?.value || '';
      const tags = (postTags?.value || '').split(',').map(s => s.trim()).filter(Boolean);
      const ex = (postExcerpt?.value || '').trim();
      const c = (postCover?.value || '').trim();
      const l = (postLink?.value || '').trim();
      posts.push({ title: t, date: d, tags, excerpt: ex, cover: c, link: l });
      renderPostList();
      postTitle.value = ''; postDate.value = ''; postTags.value = ''; postExcerpt.value = ''; postCover.value = ''; postLink.value = '';
    });

    postList?.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const i = Number(t.dataset.index);
      if (t.classList.contains('remove')) {
        posts.splice(i, 1);
        renderPostList();
      } else if (t.classList.contains('move-up')) {
        if (i > 0) { const [p] = posts.splice(i, 1); posts.splice(i - 1, 0, p); renderPostList(); }
      } else if (t.classList.contains('move-down')) {
        if (i < posts.length - 1) { const [p] = posts.splice(i, 1); posts.splice(i + 1, 0, p); renderPostList(); }
      } else if (t.classList.contains('edit')) {
        const p = posts[i];
        const title = prompt('標題', p.title || '') ?? p.title;
        const date = prompt('日期（YYYY-MM-DD）', p.date || '') ?? p.date;
        const tags = prompt('標籤（逗號分隔）', (p.tags||[]).join(', ')) ?? (p.tags||[]).join(', ');
        const excerpt = prompt('摘要', p.excerpt || '') ?? p.excerpt;
        const cover = prompt('封面圖片 URL', p.cover || '') ?? p.cover;
        const link = prompt('全文連結 URL', p.link || '') ?? p.link;
        posts[i] = { title, date, tags: tags.split(',').map(s=>s.trim()).filter(Boolean), excerpt, cover, link };
        renderPostList();
      }
    });

    savePostsBtn?.addEventListener('click', () => {
      savePosts(posts);
      alert('文章列表已保存（LocalStorage）。返回首頁看動態渲染效果。');
    });

    exportPostsBtn?.addEventListener('click', () => {
      const json = JSON.stringify(posts, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'posts.json';
      a.click();
    });

    importPostsBtn?.addEventListener('click', async () => {
      const file = importPostsInput?.files?.[0];
      if (!file) { alert('請選擇文章 JSON 檔'); return; }
      try {
        const text = await file.text();
        const arr = JSON.parse(text);
        posts = Array.isArray(arr) ? arr : [];
        renderPostList();
      } catch (err) { alert('JSON 解析失敗'); }
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ===== 首頁動態渲染文章 =====
  (function renderHomePosts() {
    const grid = document.getElementById('postGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let posts = [];
    try {
      const raw = localStorage.getItem('posts');
      posts = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(posts)) posts = [];
    } catch (e) { posts = []; }

    if (!posts.length) {
      // 若無資料，維持空白（或可顯示提示）
      return;
    }
    posts.forEach(p => {
      const article = document.createElement('article');
      article.className = 'post-card';
      const coverLink = document.createElement('a');
      coverLink.className = 'cover';
      coverLink.href = p.link || '#';
      if (p.cover) {
        const img = document.createElement('img');
        img.src = p.cover; img.alt = p.title || '';
        coverLink.appendChild(img);
      } else {
        const fallback = document.createElement('div');
        fallback.className = 'cover-fallback';
        fallback.textContent = '昇航電腦';
        coverLink.appendChild(fallback);
      }
      const meta = document.createElement('div');
      meta.className = 'post-meta';
      const dateSpan = document.createElement('span'); dateSpan.className = 'date'; dateSpan.textContent = p.date || '';
      const dotSpan = document.createElement('span'); dotSpan.className = 'dot'; dotSpan.textContent = '•';
      const tagsSpan = document.createElement('span'); tagsSpan.className = 'tags'; tagsSpan.textContent = (p.tags||[]).join(', ');
      meta.appendChild(dateSpan); meta.appendChild(dotSpan); meta.appendChild(tagsSpan);
      const title = document.createElement('h3'); title.className = 'post-title';
      const titleLink = document.createElement('a'); titleLink.href = p.link || '#'; titleLink.textContent = p.title || '';
      title.appendChild(titleLink);
      const excerpt = document.createElement('p'); excerpt.className = 'post-excerpt'; excerpt.textContent = p.excerpt || '';
      const more = document.createElement('a'); more.className = 'read-more'; more.href = p.link || '#'; more.textContent = '閱讀全文 →';

      article.appendChild(coverLink);
      article.appendChild(meta);
      article.appendChild(title);
      article.appendChild(excerpt);
      article.appendChild(more);
      grid.appendChild(article);
    });
  })();
})();