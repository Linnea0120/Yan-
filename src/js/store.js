/* ===== 数据层：配置 / 消息 / 本地存储 ===== */
(function(){

var CFG_KEY = 'yan_cfg_v1';
var MSG_KEY = 'yan_msgs_v1';

var DEFAULT_CFG = {
  appName: 'Yan',
  aiName: '衍',
  aiAvatar: '',
  userName: '小嘉',
  userAvatar: '',
  theme: 'light',
  chatBg: '',
  chatBgOpacity: 1,
  bubbleOpacity: 1,
  providers: [],
  model: '',
  supabaseUrl: '',
  supabaseKey: ''
};

var CFG = {
  get: function(){
    var raw = null;
    try{ raw = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); }catch(e){ raw = null; }
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_CFG));
    var out = JSON.parse(JSON.stringify(DEFAULT_CFG));
    for(var k in raw){ if(raw[k] !== undefined && raw[k] !== null) out[k] = raw[k]; }
    return out;
  },
  set: function(patch){
    var cur = CFG.get();
    for(var k in patch){ cur[k] = patch[k]; }
    localStorage.setItem(CFG_KEY, JSON.stringify(cur));
    return cur;
  },
  defaults: function(){ return JSON.parse(JSON.stringify(DEFAULT_CFG)); }
};

var MSG = {
  all: function(){
    var raw = null;
    try{ raw = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); }catch(e){ raw = []; }
    return Array.isArray(raw) ? raw : [];
  },
  add: function(role, content){
    var list = MSG.all();
    var m = { role: role, content: String(content), ts: Date.now() };
    list.push(m);
    if(list.length > 800) list = list.slice(-800);
    localStorage.setItem(MSG_KEY, JSON.stringify(list));
    return m;
  },
  save: function(list){
    localStorage.setItem(MSG_KEY, JSON.stringify(list.slice(-800)));
  },
  clear: function(){
    localStorage.removeItem(MSG_KEY);
  },
  context: function(n){
    var list = MSG.all();
    return list.slice(-(n || 20));
  }
};

/* ===== 工具函数 ===== */
var U = {
  esc: function(t){
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  hhmm: function(ts){
    var d = new Date(ts || Date.now());
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  },
  /* 按换行拆成多行气泡，空行丢弃 */
  lines: function(text){
    var arr = String(text).split(/\r?\n/).filter(function(l){ return l.trim() !== ''; });
    return arr.length ? arr : [''];
  },
  /* 压缩上传的图片：最长边 max，返回 dataURL */
  shrinkImage: function(file, max, quality){
    max = max || 512;
    quality = quality || 0.82;
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(e){
        var img = new Image();
        img.onload = function(){
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, max / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
          try{ resolve(cv.toDataURL('image/jpeg', quality)); }
          catch(err){ reject(err); }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  pickFile: function(accept){
    return new Promise(function(resolve){
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = accept || 'image/*';
      inp.style.position = 'fixed';
      inp.style.left = '-9999px';
      document.body.appendChild(inp);
      inp.addEventListener('change', function(){
        var f = inp.files && inp.files[0];
        document.body.removeChild(inp);
        resolve(f || null);
      });
      inp.click();
    });
  }
};

window.CFG = CFG;
window.MSG = MSG;
window.U = U;

})();
