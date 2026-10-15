# Yan-

衍和他的小姑娘的小手机 ❤️

## 现在有什么

- **四个 Tab**：聊天 / 发现 / 我的 / 设置
- **聊天页**：消息按换行拆成多个气泡、时间在头像下方、AI 消息带四个操作按钮（复制 / 重新生成 / 编辑 / 更多）
- **我的页**：双人卡片，头像和名字都能改
- **设置页**：提供商、模型、生成参数、MCP、插件、设备访问、记忆、Supabase、外观
- **外观**：深色模式、自定义聊天背景、背景不透明度、气泡不透明度
- **数据**：localStorage 本地存储，刷新不丢
- **PWA**：支持添加到主屏幕、离线缓存

## 还没做

- API 调用（先在设置里存好提供商，下一步接上）
- Supabase 云端存储
- 朋友圈 / 番茄钟 / 小游戏
- 插件系统

## 文件结构

```
index.html
manifest.json
sw.js
src/css/
  base.css     基础与主题变量
  phone.css    手机外壳与聊天界面
  views.css    四个 Tab 与卡片
  sheet.css    底部浮层与滑块
  extra.css    补充
src/js/
  store.js     配置 / 消息 / 工具函数
  views.js     四个页面渲染
  app.js       主逻辑
```

## 怎么看效果

推上去之后，仓库地址是：

https://github.com/Linnea0120/Yan-

想直接看页面的话，用手机浏览器打开这个链接就行（把 <你的用户名> 换成 Linnea0120）：

https://Linnea0120.github.io/Yan-/

前提是仓库设置里打开了 Pages：

Settings → Pages → Source 选「Deploy from a branch」→ Branch 选 main / 根目录 → Save

## 本地打开

双击 `index.html` 就行，或者起个本地服务：

```bash
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`
