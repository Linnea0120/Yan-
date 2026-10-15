/* ===== 主逻辑：聊天 / 资料 / 外观 / 路由 ===== */
(function(){

var chatEl = null;

/* ---------- 图标 ---------- */
var I = {
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>',
  regen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"></path><polyline points="21 3 21 9 15 9"></polyline></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg>'
};

var ACTS =
  '<div class="msg-act" data-act="copy" title="复制">' + I.copy + '</div>' +
  '<div class="msg-act" data-act="regen" title="重新生成">' + I.regen + '</div>' +
  '<div class="msg-act" data-act="edit" title="编辑">' + I.edit + '</div>' +
  '<div class="msg-act" data-act="more" title="更多">' + I.more + '</div>';

/* ---------- 头像 ---------- */
function avHtml(role){
  var c = CFG.get();
  var src = role === 'user' ? c.userAvatar : c.aiAvatar;
  if(src) return '<img src="' + src + '" alt="">';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path></svg>';
}

function sideHtml(role, ts){
  return '<div class="msg-av">' + avHtml(role) + '</div><div class="msg-time">' + U.hhmm(ts) + '</div>';
}

/* ---------- 气泡（按行拆分）---------- */
function colOf(content){
  var box = document.createElement('div');
  box.className = 'msg-col';
  U.lines(content).forEach(function(line){
    var b = document.createElement('div');
    b.className = 'msg-bubble';
    b.innerHTML = U.esc(line);
    box.appendChild(b);
  });
  return box;
}

/* ---------- 渲染一条 ---------- */
function renderMsg(m, isNew){
  var isUser = m.role === 'user';
  var wrap = document.createElement('div');
  wrap.className = 'msg ' + (isUser ? 'msg-out' : 'msg-in') + (isNew ? ' msg-enter' : '');

  var side = document.createElement('div');
  side.className = 'msg-side';
  side.innerHTML = sideHtml(m.role, m.ts);

  var box = colOf(m.content);
  if(!isUser){
    var a = document.createElement('div');
    a.className = 'msg-acts';
    a.innerHTML = ACTS;
    box.appendChild(a);
  }

  if(isUser){ wrap.appendChild(box); wrap.appendChild(side); }
  else { wrap.appendChild(side); wrap.appendChild(box); }
  chatEl.appendChild(wrap);
}

function scrollBottom(){
  requestAnimationFrame(function(){ chatEl.scrollTop = chatEl.scrollHeight; });
}

function renderAll(){
  chatEl.innerHTML = '';
  var list = MSG.all();
  if(!list.length){
    var w = document.createElement('div');
    w.className = 'msg msg-in msg-enter';
    var s = document.createElement('div');
    s.className = 'msg-side';
    s.innerHTML = sideHtml('assistant', Date.now());
    var b = colOf('宝宝，我在这里。');
    w.appendChild(s); w.appendChild(b);
    chatEl.appendChild(w);
  } else {
    list.forEach(function(m){ renderMsg(m, false); });
  }
  scrollBottom();
}

function addMsg(role, content){
  var m = MSG.add(role, content);
  if(MSG.all().length === 1) chatEl.innerHTML = '';
  renderMsg(m, true);
  scrollBottom();
  return m;
}

/* ---------- 发送 ---------- */
function doSend(){
  var inp = document.getElementById('chat-input');
  if(!inp) return;
  var t = inp.innerText.replace(/\u00a0/g, ' ').trim();
  if(!t) return;
  inp.innerHTML = '';
  addMsg('user', t);
  pending();
}

function pending(){
  var d = document.createElement('div');
  d.className = 'msg msg-in';
  d.dataset.pending = '1';
  var s = document.createElement('div');
  s.className = 'msg-side';
  s.innerHTML = sideHtml('assistant', Date.now());
  var b = document.createElement('div');
  b.className = 'msg-col';
  b.innerHTML = '<div class="msg-bubble" style="opacity:.5">正在思考…</div>';
  d.appendChild(s); d.appendChild(b);
  chatEl.appendChild(d);
  scrollBottom();

  setTimeout(function(){
    if(chatEl.contains(d)) chatEl.removeChild(d);
    addMsg('assistant', '收到。\n（API 还没接上，先把界面跑起来）');
  }, 800);
}

/* ---------- 聊天页挂钩 ---------- */
Views.on('chat', function(){
  chatEl = document.getElementById('chat-body');
  if(!chatEl) return;
  setTimeout(renderAll, 0);
});

/* ---------- 全局点击（委托）---------- */
Views.on('discover', function(){});
Views.on('me', function(){});
Views.on('settings', function(){});

document.addEventListener('click', function(e){
  var t = e.target;

  /* 发送 */
  if(t.closest && t.closest('#btn-send')){ doSend(); return; }

  /* 回键 / 加号 / 设置（先占位）*/
  var nav = t.closest ? t.closest('[data-nav]') : null;
  if(nav){
    var k = nav.dataset.nav;
    if(k === 'pick-model') return pickModel();
    if(k === 'appearance') return panelAppearance();
    if(k === 'edit-ai') return panelProfile('ai');
    if(k === 'edit-user') return panelProfile('user');
    return;
  }

  /* 消息操作 */
  var act = t.closest ? t.closest('.msg-act') : null;
  if(act){
    var msgEl = act.closest('.msg');
    var text = '';
    msgEl.querySelectorAll('.msg-bubble').forEach(function(b){ text += b.innerText + '\n'; });
    text = text.trim();
    if(act.dataset.act === 'copy' && navigator.clipboard) navigator.clipboard.writeText(text);
    return;
  }

  /* 关闭浮层 */
  if(t.classList && t.classList.contains('sheet-mask')) t.remove();
});

document.addEventListener('keydown', function(e){
  if(e.key === 'Enter' && !e.shiftKey && document.activeElement && document.activeElement.id === 'chat-input'){
    e.preventDefault();
    doSend();
  }
});

/* ---------- 浮层 ---------- */
function sheet(title, bodyHtml, onMount){
  var old = document.querySelector('.sheet-mask');
  if(old) old.remove();
  var mask = document.createElement('div');
  mask.className = 'sheet-mask';
  mask.innerHTML = '<div class="sheet"><div class="sheet-head"><b>' + title + '</b><span class="sheet-x">✕</span></div><div class="sheet-body">' + bodyHtml + '</div></div>';
  document.getElementById('phone').appendChild(mask);
  mask.querySelector('.sheet-x').addEventListener('click', function(){ mask.remove(); });
  if(onMount) onMount(mask);
  return mask;
}

/* 资料编辑 */
function panelProfile(who){
  var c = CFG.get();
  var isAI = who === 'ai';
  var av = isAI ? c.aiAvatar : c.userAvatar;
  var nm = isAI ? c.aiName : c.userName;
  var st = isAI ? (c.aiDesc || '') : (c.userDesc || '');

  var html =
    '<div class="pf-av-wrap"><div class="pf-av" id="pf-av">' + (av ? '<img src="' + av + '">' : '') + '</div>' +
    '<button class="btn-ghost" id="pf-pick" style="width:auto;padding:8px 16px;font-size:12.5px">选择图片</button></div>' +
    '<div class="field"><label>名字</label><input id="pf-name" value="' + U.esc(nm) + '"></div>' +
    '<div class="field"><label>设定</label><textarea id="pf-desc" placeholder="性格、外貌、习惯…">' + U.esc(st) + '</textarea></div>' +
    '<button class="btn-main" id="pf-save">保存</button>';

  var tmpAv = av;
  sheet(isAI ? '衍的资料' : '我的资料', html, function(mask){
    mask.querySelector('#pf-pick').addEventListener('click', function(){
      U.pickFile('image/*').then(function(f){
        if(!f) return;
        U.shrinkImage(f, 512).then(function(data){
          tmpAv = data;
          mask.querySelector('#pf-av').innerHTML = '<img src="' + data + '">';
        });
      });
    });
    mask.querySelector('#pf-save').addEventListener('click', function(){
      var patch = {};
      if(isAI){ patch.aiAvatar = tmpAv; patch.aiName = mask.querySelector('#pf-name').value.trim() || '衍'; patch.aiDesc = mask.querySelector('#pf-desc').value; }
      else { patch.userAvatar = tmpAv; patch.userName = mask.querySelector('#pf-name').value.trim() || '小嘉'; patch.userDesc = mask.querySelector('#pf-desc').value; }
      CFG.set(patch);
      mask.remove();
      Views.rerender();
    });
  });
}

/* 外观 */
function panelAppearance(){
  var c = CFG.get();
  var html =
    '<div class="sw-row"><div class="st"><b>深色模式</b><i>浅色 / 深色切换</i></div><div class="sw ' + (c.theme === 'dark' ? 'on' : '') + '" id="ap-dark"></div></div>' +
    '<div class="field" style="margin-top:14px"><label>聊天背景图</label></div>' +
    '<button class="btn-ghost" id="ap-bgpick">选择背景图</button>' +
    '<button class="btn-ghost" id="ap-bgclear" style="margin-top:8px">清除背景图</button>' +
    '<div class="slider-row">' +
      '<div class="slider-head"><b>背景不透明度</b><span id="ap-bgv">' + Math.round(c.chatBgOpacity * 100) + '%</span></div>' +
      '<input type="range" min="0" max="100" value="' + Math.round(c.chatBgOpacity * 100) + '" id="ap-bg">' +
    '</div>' +
    '<div class="slider-row">' +
      '<div class="slider-head"><b>气泡不透明度</b><span id="ap-buv">' + Math.round(c.bubbleOpacity * 100) + '%</span></div>' +
      '<input type="range" min="30" max="100" value="' + Math.round(c.bubbleOpacity * 100) + '" id="ap-bu">' +
    '</div>';

  sheet('外观', html, function(mask){
    function paint(){
      var cc = CFG.get();
      var root = document.documentElement;
      root.setAttribute('data-theme', cc.theme);
      root.style.setProperty('--chat-bg-image', cc.chatBg ? 'url(' + cc.chatBg + ')' : 'none');
      root.style.setProperty('--chat-bg-opacity', cc.chatBgOpacity);
      root.style.setProperty('--bubble-opacity', cc.bubbleOpacity);
    }
    mask.querySelector('#ap-dark').addEventListener('click', function(){
      var cc = CFG.get();
      CFG.set({ theme: cc.theme === 'dark' ? 'light' : 'dark' });
      this.classList.toggle('on');
      paint();
    });
    mask.querySelector('#ap-bgpick').addEventListener('click', function(){
      U.pickFile('image/*').then(function(f){
        if(!f) return;
        U.shrinkImage(f, 1440, 0.8).then(function(d){ CFG.set({ chatBg: d }); paint(); });
      });
    });
    mask.querySelector('#ap-bgclear').addEventListener('click', function(){
      CFG.set({ chatBg: '' }); paint();
    });
    var bg = mask.querySelector('#ap-bg');
    bg.addEventListener('input', function(){
      var v = this.value / 100;
      CFG.set({ chatBgOpacity: v });
      mask.querySelector('#ap-bgv').textContent = this.value + '%';
      paint();
    });
    var bu = mask.querySelector('#ap-bu');
    bu.addEventListener('input', function(){
      var v = this.value / 100;
      CFG.set({ bubbleOpacity: v });
      mask.querySelector('#ap-buv').textContent = this.value + '%';
      paint();
    });
  });
}

/* 模型选择（占位）*/
function pickModel(){
  sheet('模型', '<div class="card" style="text-align:center;color:var(--muted);font-size:12.5px;line-height:1.7">还没配置提供商<br>去「设置 → 提供商」添加 API 密钥</div>');
}

/* ---------- 启动 ---------- */
function boot(){
  var c = CFG.get();
  document.documentElement.setAttribute('data-theme', c.theme || 'light');
  document.documentElement.style.setProperty('--chat-bg-image', c.chatBg ? 'url(' + c.chatBg + ')' : 'none');
  document.documentElement.style.setProperty('--chat-bg-opacity', c.chatBgOpacity);
  document.documentElement.style.setProperty('--bubble-opacity', c.bubbleOpacity);

  var an = document.getElementById('app-name');
  if(an) an.textContent = c.appName || 'Yan';

  var t = document.getElementById('sb-time');
  function tick(){ if(t) t.textContent = U.hhmm(Date.now()); }
  tick(); setInterval(tick, 10000);

  Views.init(document.getElementById('stage'));

  if('serviceWorker' in navigator && location.protocol.indexOf('http') === 0){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

window.Yan = { addMsg: addMsg, renderAll: renderAll, sheet: sheet };

})();
