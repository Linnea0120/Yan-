/* ===== 视图层：四个 Tab 页面 ===== */
(function(){

var stage = null;
var act = 'chat';
var hooks = {};

/* ---------- 小图标 ---------- */
var ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.8 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.3 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.4 13.8H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.3A1.6 1.6 0 0 0 10.3 3.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"></path></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
};

/* ---------- 通用片段 ---------- */
function head(title, right){
  return '<div class="vhead"><div class="vtitle">' + title + '</div>' + (right || '') + '</div>';
}
function avatarHtml(src, cls){
  cls = cls || 'couple-av';
  if(src) return '<div class="' + cls + '"><img src="' + src + '" alt=""></div>';
  return '<div class="' + cls + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path></svg></div>';
}

/* ================= 聊天页 ================= */
function viewChat(){
  var c = CFG.get();
  return '' +
  '<div class="view" data-view="chat">' +
    '<div class="chat-head">' +
      '<div class="ch-back" data-nav="chat-list">' + ICON.back + '</div>' +
      '<div class="ch-name">' + U.esc(c.aiName) + '</div>' +
      '<div class="ch-settings" data-nav="new-chat">' + ICON.plus + '</div>' +
      '<div class="ch-settings" data-nav="chat-set">' + ICON.gear + '</div>' +
    '</div>' +
    '<div class="chat-body" id="chat-body"></div>' +
    '<div class="chat-input-row">' +
      '<div class="ch-input-btn" data-nav="pick-model" title="模型">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="7" width="18" height="12" rx="4"></rect><circle cx="9" cy="13" r="1.3" fill="currentColor"></circle><circle cx="15" cy="13" r="1.3" fill="currentColor"></circle></svg>' +
      '</div>' +
      '<div class="ch-input-btn" data-nav="think" title="思考">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5a4 4 0 0 0-4 4v1a3 3 0 0 0 0 6 3 3 0 0 0 4 3 3 3 0 0 0 4-3 3 3 0 0 0 0-6V9a4 4 0 0 0-4-4z"></path></svg>' +
      '</div>' +
      '<div class="chat-input" id="chat-input" contenteditable="true" data-ph="发消息…"></div>' +
      '<div class="ch-input-btn" data-nav="plus" title="更多">' + ICON.plus + '</div>' +
      '<button class="chat-send" id="btn-send">发送</button>' +
    '</div>' +
  '</div>';
}

/* ================= 发现页 ================= */
function viewDiscover(){
  return '' +
  '<div class="view" data-view="discover">' +
    head('发现') +
    '<div class="vbody">' +
      '<div class="card-row" data-nav="moments"><div class="ci">📸</div><div class="ct"><b>朋友圈</b><i>看看我们发过什么</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="pomodoro"><div class="ci">🍅</div><div class="ct"><b>番茄钟</b><i>25 分钟专注</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="games"><div class="ci">🎮</div><div class="ct"><b>小游戏</b><i>猜拳 / 扫雷 / 五子棋</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="sec-title">未安装的功能会显示在这里</div>' +
      '<div class="card" style="text-align:center;color:var(--muted);font-size:12.5px;line-height:1.7">插件装上后会自动出现在这里<br>（番茄钟、小游戏正在做）</div>' +
    '</div>' +
  '</div>';
}

/* ================= 我的页 ================= */
function viewMe(){
  var c = CFG.get();
  var days = Math.max(1, Math.floor((Date.now() - 1760000000000) / 86400000));
  return '' +
  '<div class="view" data-view="me">' +
    head('我的') +
    '<div class="vbody">' +
      '<div class="couple">' +
        '<div class="couple-top">' +
          '<div class="couple-side">' + avatarHtml(c.aiAvatar) + '<div class="couple-name" id="ai-name-label">' + U.esc(c.aiName) + '</div></div>' +
          '<div class="couple-heart">❤</div>' +
          '<div class="couple-side">' + avatarHtml(c.userAvatar) + '<div class="couple-name" id="user-name-label">' + U.esc(c.userName) + '</div></div>' +
        '</div>' +
        '<div class="couple-hr"></div>' +
        '<div class="couple-stats">' +
          '<div class="couple-stat"><span>聊天记录</span><b>' + MSG.all().length + ' 条</b></div>' +
          '<div class="couple-stat"><span>认识</span><b>' + days + ' 天</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="card-row" data-nav="edit-ai"><div class="ci">✨</div><div class="ct"><b>衍的资料</b><i>头像 / 名字 / 设定</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="edit-user"><div class="ci">🌿</div><div class="ct"><b>我的资料</b><i>头像 / 名字 / 设定</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="memory"><div class="ci">🧠</div><div class="ct"><b>记忆</b><i>记录下的关于我们的事</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
    '</div>' +
  '</div>';
}

/* ================= 设置页 ================= */
function viewSettings(){
  var c = CFG.get();
  return '' +
  '<div class="view" data-view="settings">' +
    head('设置') +
    '<div class="vbody">' +
      '<div class="sec-title">服务</div>' +
      '<div class="card-row" data-nav="providers"><div class="ci">🔌</div><div class="ct"><b>提供商</b><i>API 密钥 / 基础 URL</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="model"><div class="ci">🤖</div><div class="ct"><b>模型</b><i>' + (c.model ? U.esc(c.model) : '未选择') + '</i></div><div class="cs">' + ICON.arrow + '</div></div>' +

      '<div class="sec-title">回复</div>' +
      '<div class="card-row" data-nav="gen"><div class="ci">⚙️</div><div class="ct"><b>生成</b><i>上下文 / 思考 / 参数</i></div><div class="cs">' + ICON.arrow + '</div></div>' +

      '<div class="sec-title">工具</div>' +
      '<div class="card-row" data-nav="mcp"><div class="ci">🧩</div><div class="ct"><b>MCP 服务器</b><i>接入外部工具</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="plugins"><div class="ci">📦</div><div class="ct"><b>插件</b><i>导入 .zip 扩展功能</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="device"><div class="ci">📱</div><div class="ct"><b>设备访问</b><i>位置 / 电池 / 通知</i></div><div class="cs">' + ICON.arrow + '</div></div>' +

      '<div class="sec-title">记忆与数据</div>' +
      '<div class="card-row" data-nav="memory"><div class="ci">🧠</div><div class="ct"><b>记忆</b><i>开关与记忆列表</i></div><div class="cs">' + ICON.arrow + '</div></div>' +
      '<div class="card-row" data-nav="supabase"><div class="ci">🗄️</div><div class="ct"><b>数据控制</b><i>' + (c.supabaseUrl ? '已配置' : '未配置 Supabase') + '</i></div><div class="cs">' + ICON.arrow + '</div></div>' +

      '<div class="sec-title">外观</div>' +
      '<div class="card-row" data-nav="appearance"><div class="ci">🎨</div><div class="ct"><b>外观</b><i>主题 / 背景 / 透明度</i></div><div class="cs">' + ICON.arrow + '</div></div>' +

      '<div class="sec-title">关于</div>' +
      '<div class="card-row" data-nav="about"><div class="ci">💙</div><div class="ct"><b>关于</b><i>v0.1 · 给椰椰的小手机</i></div></div>' +
    '</div>' +
  '</div>';
}

var VIEWS = {
  chat: viewChat,
  discover: viewDiscover,
  me: viewMe,
  settings: viewSettings
};

/* ---------- 切页 ---------- */
function show(name){
  act = name;
  stage.innerHTML = VIEWS[name] ? VIEWS[name]() : '';
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function(t){
    t.classList.toggle('active', t.dataset.tab === name);
  });
  if(hooks[name]) hooks[name](stage);
}

/* ---------- 对外 ---------- */
window.Views = {
  init: function(el){
    stage = el;
    document.getElementById('tabbar').addEventListener('click', function(e){
      var t = e.target.closest ? e.target.closest('.tab') : null;
      if(t) show(t.dataset.tab);
    });
    show('chat');
  },
  show: show,
  current: function(){ return act; },
  rerender: function(){ show(act); },
  on: function(name, fn){ hooks[name] = fn; },
  icon: ICON,
  avatarHtml: avatarHtml,
  head: head
};

})();
