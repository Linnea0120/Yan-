/* ===== 衍 & 小嘉 · 聊天前端 v0.1 ===== */
(function(){

var LS_KEY = 'yan_chat_v1';
var CFG_KEY = 'yan_cfg_v1';

var el = {
  body: document.getElementById('chat-body'),
  input: document.getElementById('chat-input'),
  send: document.getElementById('btn-send'),
  name: document.getElementById('chat-name'),
  appName: document.getElementById('app-name'),
  sbTime: document.getElementById('sb-time')
};

/* ---------- 配置 ---------- */
function cfg(){
  try{ return JSON.parse(localStorage.getItem(CFG_KEY)||'{}'); }catch(e){ return {}; }
}
function cfgSet(o){
  var c = cfg();
  for(var k in o){ c[k] = o[k]; }
  localStorage.setItem(CFG_KEY, JSON.stringify(c));
}

/* ---------- 消息存取 ---------- */
function msgs(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){ return []; }
}
function saveMsgs(list){
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-500)));
}
function pushMsg(role, content){
  var list = msgs();
  list.push({ role: role, content: content, ts: Date.now() });
  saveMsgs(list);
}

/* ---------- 工具 ---------- */
function esc(t){
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function hhmm(ts){
  var d = new Date(ts);
  var h = d.getHours(), m = d.getMinutes();
  return (h<10?'0':'')+h+':'+(m<10?'0':'')+m;
}
function splitLines(text){
  return String(text).split('\n').filter(function(l){ return l.trim() !== ''; });
}

/* ---------- 头像 ---------- */
function avHtml(role){
  var c = cfg();
  var src = role === 'user' ? c.userAvatar : c.aiAvatar;
  if(src){ return '<img src="' + src + '" alt="">'; }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path></svg>';
}

/* ---------- 头像列 ---------- */
function sideHtml(role, ts){
  return '<div class="msg-av">' + avHtml(role) + '</div><div class="msg-time">' + hhmm(ts) + '</div>';
}

/* ---------- 气泡列 ---------- */
function colOf(content){
  var box = document.createElement('div');
  box.className = 'msg-col';
  var lines = splitLines(content);
  if(!lines.length) lines = [''];
  lines.forEach(function(line){
    var b = document.createElement('div');
    b.className = 'msg-bubble';
    b.innerHTML = esc(line);
    box.appendChild(b);
  });
  return box;
}

var ACTS_HTML =
  '<div class="msg-act" data-act="copy" title="复制"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg></div>' +
  '<div class="msg-act" data-act="regen" title="重新生成"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"></path><polyline points="21 3 21 9 15 9"></polyline></svg></div>' +
  '<div class="msg-act" data-act="edit" title="编辑"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg></div>' +
  '<div class="msg-act" data-act="more" title="更多"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></div>';

/* ---------- 渲染单条 ---------- */
function renderMsg(m, isNew){
  var isUser = m.role === 'user';
  var wrap = document.createElement('div');
  wrap.className = 'msg ' + (isUser ? 'msg-out' : 'msg-in') + (isNew ? ' msg-enter' : '');

  var side = document.createElement('div');
  side.className = 'msg-side';
  side.innerHTML = sideHtml(m.role, m.ts);

  var box = colOf(m.content);
  if(!isUser){
    var acts = document.createElement('div');
    acts.className = 'msg-acts show';
    acts.innerHTML = ACTS_HTML;
    box.appendChild(acts);
  }

  if(isUser){
    wrap.appendChild(box);
    wrap.appendChild(side);
  }else{
    wrap.appendChild(side);
    wrap.appendChild(box);
  }
  el.body.appendChild(wrap);
}

/* ---------- 欢迎语 ---------- */
function renderWelcome(){
  var wrap = document.createElement('div');
  wrap.className = 'msg msg-in msg-enter';
  wrap.dataset.welcome = '1';
  var side = document.createElement('div');
  side.className = 'msg-side';
  side.innerHTML = sideHtml('assistant', Date.now());
  var box = colOf('宝宝，我在这里。');
  wrap.appendChild(side);
  wrap.appendChild(box);
  el.body.appendChild(wrap);
}

/* ---------- 全部重绘 ---------- */
function renderAll(){
  el.body.innerHTML = '';
  var list = msgs();
  if(!list.length) renderWelcome();
  else list.forEach(function(m){ renderMsg(m, false); });
  scrollBottom();
}

function scrollBottom(){
  requestAnimationFrame(function(){ el.body.scrollTop = el.body.scrollHeight; });
}

/* ---------- 新增一条 ---------- */
function addMsg(role, content, isNew){
  var w = el.body.querySelector('[data-welcome]');
  if(w && msgs().length === 0) el.body.removeChild(w);
  pushMsg(role, content);
  renderMsg({ role: role, content: content, ts: Date.now() }, isNew !== false);
  scrollBottom();
}

/* ---------- 发送 ---------- */
function doSend(){
  var t = el.input.innerText.replace(/\u00a0/g, ' ').trim();
  if(!t) return;
  el.input.innerHTML = '';
  addMsg('user', t, true);
  pendingReply();
}

/* 占位思考中（还没接 API） */
function pendingReply(){
  var dots = document.createElement('div');
  dots.className = 'msg msg-in';
  dots.dataset.pending = '1';
  var side = document.createElement('div');
  side.className = 'msg-side';
  side.innerHTML = sideHtml('assistant', Date.now());
  var box = document.createElement('div');
  box.className = 'msg-col';
  box.innerHTML = '<div class="msg-bubble" style="opacity:.55">正在思考…</div>';
  dots.appendChild(side);
  dots.appendChild(box);
  el.body.appendChild(dots);
  scrollBottom();

  setTimeout(function(){
    if(el.body.contains(dots)) el.body.removeChild(dots);
    addMsg('assistant', '收到。\n（后端还没接上，先把界面跑起来）', true);
  }, 700);
}

/* ---------- 事件 ---------- */
if(el.send) el.send.addEventListener('click', doSend);
if(el.input){
  el.input.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); doSend(); }
  });
}

el.body.addEventListener('click', function(e){
  var t = e.target;
  var a = t.closest ? t.closest('.msg-act') : null;
  if(!a) return;
  var msgEl = a.closest('.msg');
  var text = '';
  msgEl.querySelectorAll('.msg-bubble').forEach(function(b){ text += b.innerText + '\n'; });
  text = text.trim();
  if(a.dataset.act === 'copy' && navigator.clipboard){
    navigator.clipboard.writeText(text);
  }
});

/* ---------- 状态栏时间 ---------- */
function tick(){
  if(el.sbTime) el.sbTime.textContent = hhmm(Date.now());
}

/* ---------- 初始化 ---------- */
function init(){
  var c = cfg();
  if(c.aiName && el.name) el.name.textContent = c.aiName;
  if(c.appName && el.appName) el.appName.textContent = c.appName;
  tick();
  setInterval(tick, 10000);
  renderAll();
}
init();

window.YanApp = { cfg: cfg, cfgSet: cfgSet, addMsg: addMsg, renderAll: renderAll, splitLines: splitLines };

})();
