/* 数境 DataRealm 官网公共脚本：导航、页内选项卡、旧锚点跳转。
 * 2026-11 由单页 index.html 拆分为多页面时抽出；每段逻辑只在页面存在对应元素时生效。 */
(function () {
  'use strict';

  /* 旧版单页的锚点（如 https://datarealm.cn/#contact）在多页面版中迁到了子页面。
   * 只在首页执行，用 location.replace 不留下多余的历史记录。 */
  var legacyAnchors = {
    '#contact': 'contact/',
    '#ontology': 'product/#ontology',
    '#how': 'product/#how',
    '#products': 'product/#products',
    '#capabilities': 'product/#capabilities',
    '#governance': 'product/#governance',
    '#solutions': 'solutions/',
    '#scenarios': 'solutions/#scenarios',
    '#penetrative-supervision': 'solutions/#penetrative-supervision',
    '#solution-analytics': 'solutions/#solution-analytics',
    '#solution-knowledge': 'solutions/#solution-knowledge',
    '#solution-compliance': 'solutions/#solution-compliance',
    '#solution-agent': 'solutions/#solution-agent'
  };
  if (document.body.dataset.page === 'home' && legacyAnchors[location.hash]) {
    location.replace(legacyAnchors[location.hash]);
    return;
  }

  /* 主导航：移动端菜单、下拉面板 */
  var menuButton = document.querySelector('.menu-button');
  var navigation = document.querySelector('#navigation');
  var navTriggers = Array.from(document.querySelectorAll('.nav-trigger'));
  function closeDropdowns() {
    document.querySelectorAll('.nav-item.is-open').forEach(function (item) { item.classList.remove('is-open'); });
    navTriggers.forEach(function (trigger) { trigger.setAttribute('aria-expanded', 'false'); });
  }
  function closeMenu() {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    closeDropdowns();
  }
  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      var open = navigation.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    navigation.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    navTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('.nav-item');
        var willOpen = !item.classList.contains('is-open');
        closeDropdowns();
        if (willOpen) { item.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item') && !e.target.closest('.menu-button')) closeDropdowns();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  var year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* 通用的键盘切换：左右/上下/Home/End */
  function bindTabKeys(tabs, activate, vertical) {
    tabs.forEach(function (tab, index) {
      tab.addEventListener('keydown', function (e) {
        var keys = vertical ? ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'] : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (keys.indexOf(e.key) < 0) return;
        e.preventDefault();
        var forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
        var next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (forward ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus();
        activate(tabs[next]);
      });
    });
  }

  /* 产品页：产品矩阵选项卡。支持 product/#suite-supervision 这类深链接直接打开对应产品。 */
  var suiteTabs = Array.from(document.querySelectorAll('.suite-tab'));
  if (suiteTabs.length) {
    var setSuite = function (key) {
      suiteTabs.forEach(function (tab) {
        var selected = tab.dataset.suite === key;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      document.querySelectorAll('.suite-panel').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.panel === key); });
    };
    suiteTabs.forEach(function (tab) { tab.addEventListener('click', function () { setSuite(tab.dataset.suite); }); });
    bindTabKeys(suiteTabs, function (tab) { setSuite(tab.dataset.suite); }, true);
    var openSuiteFromHash = function () {
      var panel = location.hash && document.getElementById(location.hash.slice(1));
      if (panel && panel.classList.contains('suite-panel')) {
        setSuite(panel.dataset.panel);
        // 面板原本是隐藏的，浏览器无法定位；显示后滚到面板本身（与浏览器的锚点行为一致）。
        // 必须推迟一帧：同一帧内调用会被浏览器自身的锚点跳转取消（Chromium 实测）。
        requestAnimationFrame(function () { panel.scrollIntoView(); });
      }
    };
    openSuiteFromHash();
    window.addEventListener('hashchange', openSuiteFromHash);
  }

  /* 解决方案页：穿透监管演示（招投标 / 设备全生命周期） */
  var graph = document.querySelector('#case-graph');
  if (graph) {
    var bidGraph = graph.innerHTML;
    var deviceGraph = `<g fill="none" stroke="#b9cbbc" stroke-width="1.3"><path d="M310 55 146 149m164-94 164 94M146 149l51 112m277-112-51 112"/><path d="M146 149h328M197 261h226" stroke="#c89c57" stroke-dasharray="5 5"/></g><g font-size="10" fill="#8a9b89" text-anchor="middle"><text x="204" y="90">设备归属</text><text x="419" y="90">巡检计划</text><text x="147" y="223">由其制造</text><text x="478" y="223">记录检查</text><text x="310" y="139" fill="#b18b4b">关联检查</text></g><g><rect x="238" y="27" width="145" height="46" rx="4" fill="#edf3e8" stroke="#9db496"/><rect x="64" y="124" width="164" height="48" rx="4" fill="#fff" stroke="#a6bba0"/><rect x="392" y="124" width="164" height="48" rx="4" fill="#fbf6eb" stroke="#c6a468"/><rect x="137" y="241" width="122" height="42" rx="4" fill="#fff" stroke="#ccd5c6"/><rect x="362" y="241" width="122" height="42" rx="4" fill="#fbf6eb" stroke="#c6a468"/></g><g font-size="12" fill="#47613f" text-anchor="middle"><text x="310" y="55">某区域设备台账</text><text x="146" y="153">设备 · A-017</text><text x="474" y="153" fill="#9c763a">巡检周期超限</text><text x="198" y="267" font-size="11">制造商 · 甲公司</text><text x="423" y="267" font-size="11" fill="#9c763a">资质认证已到期</text></g><g fill="#bf9248"><circle class="graph-point" cx="310" cy="149" r="3"/><circle class="graph-point" cx="310" cy="261" r="3"/></g>`;
    var scenes={bid:{label:'ONTOLOGY EXPLORER / 招投标领域',kicker:'招投标 / 关联风险识别',heading:'两家独立的投标企业，<br>背后是否存在关联？',description:'连接项目、投标人、联系人与投标记录，沿关系发现跨系统的异常线索，为进一步核查提供依据。',evidence:'<span>01</span> 两家企业参与同一采购项目<br><span>02</span> 投标记录出现相同 IP<br><span>03</span> 联系人信息指向同一主体',graph:bidGraph,alt:'两家投标企业通过共同联系人与相同投标 IP 产生关联'},device:{label:'ONTOLOGY EXPLORER / 设备监管领域',kicker:'设备监管 / 全生命周期追踪',heading:'一台运行中的设备，<br>有哪些被忽略的风险？',description:'将设备、制造商资质与巡检记录连成一体，跨越独立台账，识别运行状态背后的关联风险。',evidence:'<span>01</span> 设备台账显示设备仍在使用<br><span>02</span> 最近巡检时间超出规定周期<br><span>03</span> 关联制造商的资质认证已到期',graph:deviceGraph,alt:'设备关联巡检周期超限与制造商资质到期两项风险线索'}};
    var tabs = Array.from(document.querySelectorAll('.case-tab'));
    var setScene = function (key) {
      var scene = scenes[key];
      tabs.forEach(function (tab) {
        var selected = tab.dataset.case === key;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      document.querySelector('#case-panel').setAttribute('aria-labelledby', 'tab-' + key);
      document.querySelector('#canvas-label').textContent = scene.label;
      document.querySelector('#case-kicker').textContent = scene.kicker;
      document.querySelector('#case-heading').innerHTML = scene.heading;
      document.querySelector('#case-description').textContent = scene.description;
      document.querySelector('#case-evidence').innerHTML = scene.evidence;
      graph.innerHTML = scene.graph;
      graph.setAttribute('aria-label', scene.alt);
    };
    tabs.forEach(function (tab) { tab.addEventListener('click', function () { setScene(tab.dataset.case); }); });
    bindTabKeys(tabs, function (tab) { setScene(tab.dataset.case); }, false);
  }
})();
