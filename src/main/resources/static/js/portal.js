/* 中赣通官网前台脚本：拉取聚合数据并渲染各区块 */
(function () {
  'use strict';

  var ICONS = {
    scale: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    team: '<circle cx="9" cy="7" r="3.2"/><path d="M15.5 21v-1.6a3.5 3.5 0 0 0-3.5-3.5H6A3.5 3.5 0 0 0 2.5 19.4V21"/><path d="M16 4a3.2 3.2 0 0 1 0 6.2"/><path d="M21.5 21v-1.6a3.5 3.5 0 0 0-2.6-3.38"/>',
    rd: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-2.73 1.13V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.73-1.12l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    standard: '<path d="M12 22s7-3.5 7-9V5l-7-3-7 3v8c0 5.5 7 9 7 9z"/><path d="M9 11.5l2 2 4-4"/>'
  };

  function icon(key) {
    var inner = ICONS[key] || ICONS.scale;
    return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function img(url, fallback) {
    return esc(url || fallback || '/images/case1.svg');
  }

  function formatDate(str) {
    if (!str) return '';
    var m = String(str).substring(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return str;
    return m[1] + '年' + parseInt(m[2], 10) + '月' + parseInt(m[3], 10) + '日';
  }

  function paragraphs(text) {
    if (!text) return '';
    return String(text).split('\n').filter(function (l) { return l.trim() !== ''; })
      .map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('');
  }

  function $(id) { return document.getElementById(id); }

  /* ---------- 渲染 ---------- */
  function renderHero(banners) {
    var slides = $('heroSlides'), dots = $('heroDots');
    if (!banners || !banners.length) {
      banners = [{ title: '系统开发团队', subtitle: '对客户要求进行持续响应，保证系统满足用户业户动态发展的需要', imageUrl: '/images/hero1.svg' }];
    }
    slides.innerHTML = banners.map(function (b, i) {
      return '<div class="hero__slide' + (i === 0 ? ' active' : '') + '" style="background-image:url(\'' + img(b.imageUrl, '/images/hero1.svg') + '\')">' +
        '<div class="hero__text"><h2>' + esc(b.title) + '</h2><p>' + esc(b.subtitle) + '</p></div></div>';
    }).join('');
    dots.innerHTML = banners.map(function (_, i) {
      return '<span class="' + (i === 0 ? 'active' : '') + '" data-i="' + i + '"></span>';
    }).join('');

    var idx = 0, total = banners.length;
    var slideEls = slides.querySelectorAll('.hero__slide');
    var dotEls = dots.querySelectorAll('span');
    function go(n) {
      idx = (n + total) % total;
      slideEls.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
      dotEls.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
    }
    dotEls.forEach(function (el) { el.addEventListener('click', function () { go(+this.dataset.i); reset(); }); });
    var timer;
    function reset() { clearInterval(timer); if (total > 1) timer = setInterval(function () { go(idx + 1); }, 5000); }
    reset();
  }

  function renderAdvantages(list) {
    var box = $('advantageList');
    box.innerHTML = (list || []).map(function (a) {
      return '<div class="adv-card' + (a.featured ? ' featured' : '') + '">' +
        '<div class="adv-icon">' + icon(a.icon) + '</div>' +
        '<h4>' + esc(a.title) + '</h4><p>' + esc(a.description) + '</p></div>';
    }).join('');
  }

  function renderCases(list) {
    var box = $('caseList');
    box.innerHTML = (list || []).map(function (c) {
      return '<div class="case-card">' +
        '<div class="case-card__img"><img src="' + img(c.imageUrl) + '" alt="' + esc(c.title) + '">' +
        '<span class="case-card__more">MORE</span></div>' +
        '<div class="case-card__body"><div class="case-card__title"><h4>' + esc(c.title) + '</h4>' +
        '<span>' + formatDate(c.publishDate) + '</span></div><p>' + esc(c.summary) + '</p></div></div>';
    }).join('');
    setupCaseCarousel();
  }

  function setupCaseCarousel() {
    var track = $('caseList');
    var cards = track.children;
    var pos = 0;
    function step() {
      if (!cards.length) return 0;
      var style = getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '26') || 26;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function maxPos() {
      var wrapW = track.parentElement.getBoundingClientRect().width;
      var totalW = step() * cards.length;
      return Math.max(0, totalW - wrapW);
    }
    function apply() { track.style.transform = 'translateX(' + (-pos) + 'px)'; }
    $('caseNext').addEventListener('click', function () { pos = Math.min(pos + step(), maxPos()); apply(); });
    $('casePrev').addEventListener('click', function () { pos = Math.max(pos - step(), 0); apply(); });
  }

  function renderServices(list) {
    var box = $('serviceList');
    box.innerHTML = (list || []).map(function (s) {
      return '<div class="expert-card"><div class="expert-card__text"><h4>' + esc(s.title) + '</h4>' +
        '<p>' + esc(s.description) + '</p></div><img src="' + img(s.imageUrl, '/images/service1.svg') + '" alt="' + esc(s.title) + '"></div>';
    }).join('');
  }

  function renderNews(list) {
    var box = $('newsList');
    if (!list || !list.length) { box.innerHTML = '<p style="color:#aab2bd">暂无新闻</p>'; return; }
    box.innerHTML = list.map(function (n) {
      return '<a class="news-card" href="/news-detail.html?id=' + n.id + '">' +
        '<div class="news-card__img"><img src="' + img(n.coverImage, '/images/news1.svg') + '" alt="' + esc(n.title) + '"></div>' +
        '<div class="news-card__body"><h4>' + esc(n.title) + '</h4>' +
        '<div class="news-card__meta">' + formatDate(n.publishDate) + ' · 浏览 ' + (n.views || 0) + '</div>' +
        '<p>' + esc(n.summary) + '</p></div></a>';
    }).join('');
  }

  function fillConfig(cfg) {
    cfg = cfg || {};
    function set(id, val) { var el = $(id); if (el && val != null) el.textContent = val; }
    set('logoText', cfg.site_name);
    set('advTitle', cfg.advantage_section_title);
    set('advSubtitle', cfg.advantage_section_subtitle);
    set('infoTitle', cfg.info_title);
    set('caseTitle', cfg.case_section_title);
    set('expertCaption', cfg.expert_caption);
    set('expertTitle', cfg.expert_title);
    set('newsTitle', cfg.news_section_title);
    set('footerCompany', cfg.company_full_name);
    set('footerPhone', cfg.footer_phone);
    set('footerFax', cfg.footer_fax);
    set('footerWechat', cfg.footer_wechat);
    set('footerEmail', cfg.footer_email);
    set('footerAddress', cfg.footer_address);
    set('footerIcp', cfg.icp);
    set('footerCopyright', cfg.company_full_name);
    if (cfg.info_image) $('infoImage').src = cfg.info_image;
    if (cfg.info_content) $('infoContent').innerHTML = paragraphs(cfg.info_content);
    if (cfg.expert_content) $('expertContent').innerHTML = paragraphs(cfg.expert_content);
    if (cfg.info_button_text) $('infoBtn').textContent = cfg.info_button_text;
    if (cfg.expert_button_text) $('expertBtn').textContent = cfg.expert_button_text;
    if (cfg.site_name) document.title = cfg.site_name + ' - 系统开发团队 | 您身边的 IT 专家';
  }

  /* ---------- 头部交互 ---------- */
  function setupHeader() {
    var header = $('header');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll); onScroll();

    $('navToggle').addEventListener('click', function () { $('nav').classList.toggle('open'); });

    var links = document.querySelectorAll('#nav a[href^="#"]');
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top: top, behavior: 'smooth' });
          $('nav').classList.remove('open');
        }
      });
    });

    var sections = ['hero', 'cases', 'expert', 'news', 'info', 'footer'];
    window.addEventListener('scroll', function () {
      var y = window.scrollY + 120, current = 'hero';
      sections.forEach(function (id) { var el = $(id); if (el && el.offsetTop <= y) current = id; });
      links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    setupHeader();
    fetch('/api/portal/home')
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.code !== 200) { console.error(res.msg); return; }
        var d = res.data || {};
        fillConfig(d.config);
        renderHero(d.banners);
        renderAdvantages(d.advantages);
        renderCases(d.cases);
        renderServices(d.services);
        renderNews(d.news);
      })
      .catch(function (e) { console.error('加载首页数据失败', e); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
