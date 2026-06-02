/* 后台仪表盘图表库：纯 SVG + 原生 JS，零外部依赖（不使用 ECharts/CDN）
 * 提供 Charts.bar / Charts.line / Charts.pie，自适应宽度、坐标轴网格、图例、hover 数值提示与入场动画。
 */
window.Charts = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PALETTE = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59f6', '#36cfc9', '#ff9f7f'];
  var uid = 0; // 渐变 id 自增计数

  function make(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function prep(container) {
    container.innerHTML = '';
    container.style.position = 'relative';
  }
  function emptyTip(container) {
    var d = document.createElement('div');
    d.className = 'chart-empty';
    d.textContent = '暂无数据';
    container.appendChild(d);
  }
  // 计算 Y 轴 nice 上限（1 / 2 / 2.5 / 5 / 10 × 10^n，最小 5）
  function axisTop(max) {
    max = Math.max(max, 1);
    var exp = Math.floor(Math.log(max) / Math.LN10);
    var f = max / Math.pow(10, exp);
    var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    var top = nf * Math.pow(10, exp);
    return top < 5 ? 5 : top;
  }
  function fmt(n) {
    n = Math.round(n);
    return n >= 1000 ? ('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '' + n;
  }
  function tipFor(container) {
    var tip = container.querySelector('.chart-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; container.appendChild(tip); }
    return tip;
  }
  function bindTip(container, target, html) {
    var tip = tipFor(container);
    target.addEventListener('mouseenter', function () { tip.innerHTML = html; tip.style.opacity = '1'; });
    target.addEventListener('mousemove', function (e) {
      var r = container.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var lx = x + 14; if (lx + tip.offsetWidth > r.width) lx = x - 14 - tip.offsetWidth;
      var ly = y + 14; if (ly + tip.offsetHeight > r.height) ly = y - 14 - tip.offsetHeight;
      tip.style.left = (lx < 0 ? 0 : lx) + 'px';
      tip.style.top = (ly < 0 ? 0 : ly) + 'px';
    });
    target.addEventListener('mouseleave', function () { tip.style.opacity = '0'; });
  }
  function animateIn(svg) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { svg.classList.add('chart-in'); });
    });
  }

  // ---------------- 柱状图 ----------------
  function bar(container, opts) {
    prep(container);
    var items = (opts && opts.items) || [];
    if (!items.length || items.every(function (d) { return !d.value; })) { emptyTip(container); return; }

    var W = 620, H = 300, padL = 44, padR = 18, padT = 18, padB = 42;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var maxVal = Math.max.apply(null, items.map(function (d) { return d.value || 0; }));
    var top = axisTop(maxVal), ticks = 5;

    var svg = make('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart-svg', preserveAspectRatio: 'xMidYMid meet' });
    for (var t = 0; t <= ticks; t++) {
      var gy = padT + plotH - (plotH * t / ticks);
      svg.appendChild(make('line', { x1: padL, y1: gy, x2: padL + plotW, y2: gy, class: 'grid-line' }));
      var lbl = make('text', { x: padL - 8, y: gy + 4, class: 'axis-text', 'text-anchor': 'end' });
      lbl.textContent = fmt(top * t / ticks); svg.appendChild(lbl);
    }
    var band = plotW / items.length, barW = Math.min(46, band * 0.5);
    items.forEach(function (d, i) {
      var v = d.value || 0, h = v / top * plotH;
      var x = padL + band * i + (band - barW) / 2, y = padT + plotH - h;
      var color = d.color || PALETTE[i % PALETTE.length];
      var rect = make('rect', { x: x, y: y, width: barW, height: h, rx: 4, fill: color, class: 'bar' });
      rect.style.transitionDelay = (i * 0.08) + 's';
      bindTip(container, rect, '<b>' + esc(d.label) + '</b><br>数量：' + fmt(v));
      svg.appendChild(rect);
      var vt = make('text', { x: x + barW / 2, y: y - 7, class: 'bar-value', 'text-anchor': 'middle' });
      vt.textContent = fmt(v); vt.style.transitionDelay = (i * 0.08 + 0.25) + 's'; svg.appendChild(vt);
      var xt = make('text', { x: padL + band * i + band / 2, y: H - padB + 20, class: 'axis-text', 'text-anchor': 'middle' });
      xt.textContent = d.label; svg.appendChild(xt);
    });
    container.appendChild(svg);
    animateIn(svg);
  }

  // ---------------- 折线图（平滑曲线 + 渐变面积） ----------------
  // Catmull-Rom 转三次贝塞尔：穿过每个数据点的圆滑曲线，t 越大越圆滑（0 即直线）
  function smoothPath(pts) {
    if (pts.length < 2) return pts.length ? 'M ' + pts[0][0] + ' ' + pts[0][1] : '';
    var t = 0.16, d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) * t, c1y = p1[1] + (p2[1] - p0[1]) * t;
      var c2x = p2[0] - (p3[0] - p1[0]) * t, c2y = p2[1] - (p3[1] - p1[1]) * t;
      d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2[0] + ' ' + p2[1];
    }
    return d;
  }

  function line(container, opts) {
    prep(container);
    var cats = (opts && opts.categories) || [];
    var series = (opts && opts.series) || [];
    var smooth = !(opts && opts.smooth === false);
    var hasData = cats.length && series.some(function (s) { return (s.values || []).some(function (v) { return v; }); });
    if (!hasData) { emptyTip(container); return; }

    var W = 620, H = 300, padL = 44, padR = 18, padT = 24, padB = 42;
    var plotW = W - padL - padR, plotH = H - padT - padB, baseY = padT + plotH;
    var maxVal = 0;
    series.forEach(function (s) { (s.values || []).forEach(function (v) { if (v > maxVal) maxVal = v; }); });
    var top = axisTop(maxVal), ticks = 5;
    var n = cats.length, stepX = n > 1 ? plotW / (n - 1) : 0;
    function px(i) { return padL + (n > 1 ? stepX * i : plotW / 2); }
    function py(v) { return padT + plotH - (v / top * plotH); }

    var svg = make('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart-svg', preserveAspectRatio: 'xMidYMid meet' });
    var defs = make('defs'); svg.appendChild(defs);
    for (var t = 0; t <= ticks; t++) {
      var gy = padT + plotH - (plotH * t / ticks);
      svg.appendChild(make('line', { x1: padL, y1: gy, x2: padL + plotW, y2: gy, class: 'grid-line' }));
      var lbl = make('text', { x: padL - 8, y: gy + 4, class: 'axis-text', 'text-anchor': 'end' });
      lbl.textContent = fmt(top * t / ticks); svg.appendChild(lbl);
    }
    cats.forEach(function (c, i) {
      var xt = make('text', { x: px(i), y: H - padB + 20, class: 'axis-text', 'text-anchor': 'middle' });
      xt.textContent = c; svg.appendChild(xt);
    });

    // 分层绘制：先面积、再折线、最后圆点，避免半透明面积盖住相邻折线
    var areaNodes = [], lineNodes = [], dotNodes = [];
    series.forEach(function (s, si) {
      var color = s.color || PALETTE[si % PALETTE.length];
      var pts = (s.values || []).map(function (v, i) { return [px(i), py(v)]; });
      var lineD = smooth ? smoothPath(pts) : 'M ' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L ');

      var gid = 'cl-grad-' + (++uid);
      var grad = make('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
      grad.appendChild(make('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.3 }));
      grad.appendChild(make('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.02 }));
      defs.appendChild(grad);

      var areaD = lineD + ' L ' + pts[pts.length - 1][0] + ' ' + baseY + ' L ' + pts[0][0] + ' ' + baseY + ' Z';
      areaNodes.push(make('path', { d: areaD, fill: 'url(#' + gid + ')', stroke: 'none', class: 'line-area' }));
      lineNodes.push(make('path', { d: lineD, fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'line-path' }));

      (s.values || []).forEach(function (v, i) {
        var c = make('circle', { cx: px(i), cy: py(v), r: 4, fill: '#fff', stroke: color, 'stroke-width': 2.5, class: 'dot' });
        c.style.transitionDelay = (0.5 + i * 0.06) + 's';
        bindTip(container, c, '<b>' + esc(cats[i]) + '</b><br>' + esc(s.name) + '：' + fmt(v));
        dotNodes.push(c);
      });
    });
    areaNodes.forEach(function (a) { svg.appendChild(a); });
    lineNodes.forEach(function (l) { svg.appendChild(l); });
    dotNodes.forEach(function (d) { svg.appendChild(d); });

    container.appendChild(svg);
    lineNodes.forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 0;
      if (len) { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; }
    });
    animateIn(svg);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { lineNodes.forEach(function (p) { p.style.strokeDashoffset = '0'; }); });
    });
  }

  // ---------------- 饼图（环形） ----------------
  function pie(container, opts) {
    prep(container);
    var items = (opts && opts.items) || [];
    var total = items.reduce(function (s, d) { return s + (d.value || 0); }, 0);
    if (!total) { emptyTip(container); return; }

    var wrap = document.createElement('div');
    wrap.className = 'pie-wrap';
    container.appendChild(wrap);

    var S = 260, cx = S / 2, cy = S / 2, r = 104;
    var svg = make('svg', { viewBox: '0 0 ' + S + ' ' + S, class: 'chart-svg pie-svg', preserveAspectRatio: 'xMidYMid meet' });
    var ang = -Math.PI / 2;
    items.forEach(function (d, i) {
      var val = d.value || 0, frac = val / total;
      var color = d.color || PALETTE[i % PALETTE.length];
      var node;
      if (frac >= 0.9999) {
        node = make('circle', { cx: cx, cy: cy, r: r, fill: color, class: 'slice' });
      } else {
        var a2 = ang + frac * Math.PI * 2;
        var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
        var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        var large = (a2 - ang) > Math.PI ? 1 : 0;
        node = make('path', { d: 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z', fill: color, class: 'slice' });
        ang = a2;
      }
      node.style.transitionDelay = (i * 0.09) + 's';
      bindTip(container, node, '<b>' + esc(d.label) + '</b><br>' + fmt(val) + '（' + (frac * 100).toFixed(1) + '%）');
      svg.appendChild(node);
    });
    svg.appendChild(make('circle', { cx: cx, cy: cy, r: r * 0.56, fill: '#fff', class: 'pie-hole' }));
    var ct = make('text', { x: cx, y: cy - 3, class: 'pie-center-num', 'text-anchor': 'middle' });
    ct.textContent = fmt(total); svg.appendChild(ct);
    var cl = make('text', { x: cx, y: cy + 16, class: 'pie-center-lbl', 'text-anchor': 'middle' });
    cl.textContent = '总计'; svg.appendChild(cl);
    wrap.appendChild(svg);

    var legend = document.createElement('div');
    legend.className = 'chart-legend';
    items.forEach(function (d, i) {
      var val = d.value || 0, color = d.color || PALETTE[i % PALETTE.length];
      var row = document.createElement('div');
      row.className = 'legend-item';
      row.innerHTML = '<span class="legend-dot" style="background:' + color + '"></span>' +
        '<span class="legend-name" title="' + esc(d.label) + '">' + esc(d.label) + '</span>' +
        '<span class="legend-val">' + (val / total * 100).toFixed(1) + '%</span>';
      legend.appendChild(row);
    });
    wrap.appendChild(legend);
    animateIn(svg);
  }

  return { bar: bar, line: line, pie: pie, palette: PALETTE };
})();
