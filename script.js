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
})();