/* 后台公共脚本：鉴权、请求封装、弹窗、确认框、Toast、上传 */
window.Admin = (function () {
  'use strict';
  var TOKEN_KEY = 'zgt_token', USER_KEY = 'zgt_user';

  function token() { return localStorage.getItem(TOKEN_KEY); }
  function setAuth(t, u) { localStorage.setItem(TOKEN_KEY, t); localStorage.setItem(USER_KEY, JSON.stringify(u || {})); }
  function user() { try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}'); } catch (e) { return {}; } }
  function logout() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
  function gotoLogin() {
    var url = '/admin/login.html';
    if (window.top !== window.self) window.top.location.href = url;
    else location.href = url;
  }
  function guard() { if (!token()) gotoLogin(); }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(s) { return s ? String(s).substring(0, 10) : ''; }

  function request(url, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    if (token()) opts.headers['Authorization'] = 'Bearer ' + token();
    if (opts.body && !(opts.body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    }
    return fetch(url, opts).then(function (res) {
      if (res.status === 401) { logout(); gotoLogin(); throw new Error('登录已过期'); }
      return res.json();
    }).then(function (json) {
      if (json.code === 401) { logout(); gotoLogin(); throw new Error('登录已过期'); }
      if (json.code !== 200) throw new Error(json.msg || '请求失败');
      return json.data;
    });
  }
  function get(url) { return request(url, { method: 'GET' }); }
  function post(url, body) { return request(url, { method: 'POST', body: body }); }
  function put(url, body) { return request(url, { method: 'PUT', body: body }); }
  function del(url) { return request(url, { method: 'DELETE' }); }
  function upload(file) { var fd = new FormData(); fd.append('file', file); return request('/api/admin/upload', { method: 'POST', body: fd }); }

  function toast(msg, type) {
    var stack = document.querySelector('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' toast--' + type : '');
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2500);
  }

  function confirm(msg, title) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.innerHTML = '<div class="dialog confirm-box"><div class="dialog__header"><h3>' + esc(title || '提示') + '</h3><span class="close">&times;</span></div>' +
        '<div class="dialog__body">' + esc(msg) + '</div>' +
        '<div class="dialog__footer"><button class="btn" data-act="cancel">取 消</button><button class="btn btn--primary" data-act="ok">确 定</button></div></div>';
      document.body.appendChild(overlay);
      function done(v) { overlay.remove(); resolve(v); }
      overlay.querySelector('.close').onclick = function () { done(false); };
      overlay.querySelector('[data-act=cancel]').onclick = function () { done(false); };
      overlay.querySelector('[data-act=ok]').onclick = function () { done(true); };
      overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) done(false); });
    });
  }

  /**
   * 通用弹窗。opts: { title, body(html), width, confirmText, onConfirm(dialog, close), onOpen(dialog) }
   * onConfirm 返回 false 不关闭；返回 Promise 时 resolve(false) 不关闭。
   */
  function modal(opts) {
    opts = opts || {};
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="dialog" style="width:' + (opts.width || '640px') + '">' +
      '<div class="dialog__header"><h3>' + esc(opts.title || '') + '</h3><span class="close">&times;</span></div>' +
      '<div class="dialog__body">' + (opts.body || '') + '</div>' +
      '<div class="dialog__footer"><button class="btn" data-act="cancel">取 消</button>' +
      '<button class="btn btn--primary" data-act="ok">' + esc(opts.confirmText || '确 定') + '</button></div></div>';
    document.body.appendChild(overlay);
    var dialog = overlay.querySelector('.dialog');
    function close() { overlay.remove(); }
    overlay.querySelector('.close').onclick = close;
    overlay.querySelector('[data-act=cancel]').onclick = close;
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('[data-act=ok]').onclick = function () {
      if (!opts.onConfirm) { close(); return; }
      var ret = opts.onConfirm(dialog, close);
      if (ret && typeof ret.then === 'function') { ret.then(function (r) { if (r !== false) close(); }); }
      else if (ret !== false) close();
    };
    if (opts.onOpen) opts.onOpen(dialog);
    return { overlay: overlay, dialog: dialog, close: close };
  }

  /** 在弹窗内绑定图片上传控件：容器需包含 input[type=file][data-upload] 与 .preview>img 及 hidden input[data-url] */
  function bindUploader(root) {
    root.querySelectorAll('input[type=file][data-upload]').forEach(function (input) {
      input.addEventListener('change', function () {
        var file = this.files[0]; if (!file) return;
        var wrap = this.closest('.form-item');
        var hidden = wrap.querySelector('input[data-url]');
        var imgEl = wrap.querySelector('.preview img');
        toast('上传中…');
        upload(file).then(function (data) {
          hidden.value = data.url;
          if (imgEl) { imgEl.src = data.url; imgEl.style.display = 'block'; }
          toast('上传成功', 'success');
        }).catch(function (e) { toast(e.message || '上传失败', 'error'); });
      });
    });
  }

  /** 读取网站名称（site_config.site_name），失败回退默认值，供后台 Logo/标题联动 */
  function siteName() {
    return get('/api/portal/config').then(function (c) {
      return (c && c.site_name) ? c.site_name : '中赣通';
    }).catch(function () { return '中赣通'; });
  }

  return {
    token: token, setAuth: setAuth, user: user, logout: logout, gotoLogin: gotoLogin, guard: guard,
    esc: esc, fmtDate: fmtDate,
    request: request, get: get, post: post, put: put, del: del, upload: upload,
    toast: toast, confirm: confirm, modal: modal, bindUploader: bindUploader,
    siteName: siteName
  };
})();
