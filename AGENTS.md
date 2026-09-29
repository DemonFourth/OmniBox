# AGOmniBox — OpenCode 会话指引

> 本文件面向后续 OpenCode 会话，只记录「不读就会踩坑」的信息。
> 通用 TypeScript / Cloudflare 知识不在此重复。

## 项目功能（中文速览）

OmniBox 是跑在 **Cloudflare Workers** 上的通用 Web 代理服务，**零运行时依赖**（纯 TypeScript）。
访问形式：`https://<worker>/<目标URL>`，例如 `https://xxx.workers.dev/https://github.com`。

核心能力：
- 代理任意站点（HTML/CSS/JS/图片/字体），自动重写页面内所有 URL
- 注入浏览器端脚本：`ProxyLocation` 包装 `window.location`、拦截 XHR/fetch/window.open、`MutationObserver` 追踪动态 DOM
- 安全：SSRF 内网 IP 拦截、爬虫黑名单、SHA-256 + 常量时间比较、移除 CSP/HSTS/X-Frame-Options
- 可选密码保护、深浅色主题前端、健康检查 API

## 常用命令

```bash
npm run dev        # 本地开发 http://127.0.0.1:8787
npm run lint       # ESLint
npm run typecheck  # tsc 类型检查
npm run build      # wrangler build
npm run deploy     # wrangler deploy（推送到 main 时 CI 也会自动部署）
```

**验证顺序**：`lint` → `typecheck` → `build`（CI 只跑 lint + typecheck）。

## 关键约束（容易踩坑）

- **零运行时依赖**：`package.json` 只有 `devDependencies`。不要引入任何运行时依赖，核心逻辑保持纯 TS。
- **`npm test` 是空操作**：脚本为 `echo "No tests specified" && exit 0`，没有测试。不要假设跑过测试。
- **`npm run clean` 在 Windows 上不可用**：脚本用了 `rm -rf`，Windows 下会失败。需清理时手动删除 `node_modules`。
- **`src/injector.ts` 里注入的代码是「浏览器端 JS 字符串」**，不是 Worker TS 代码。必须保持 ES5/纯 JS 语法（`var`、函数表达式、无类型标注），不能引入 TS 语法或 Worker API。
- **跨模块通过 `globalThis` 传值**：`worker.ts` 设置 `thisProxyServerUrlHttps` / `thisProxyServerUrl_hostOnly`，`proxy.ts` 和 `injector.ts` 读取。改这三个模块时注意这层隐式耦合。
- **`PROXY_PASSWORD` 是 Secret**：只能通过 Cloudflare Dashboard 添加，**不要**写进 `wrangler.toml` 或提交到 git。
- **代码风格由 ESLint 强制**：单引号、必须分号、2 空格缩进、禁止尾逗号。改完跑 `npm run lint`。

## Git / 仓库

- **所有提交只推送到 `DemonFourth/OmniBox`（即 `origin`）**，不要 push 到或涉及 `Zoroaaa/OmniBox`。
- `origin` 指向 fork `DemonFourth/OmniBox`；`Zoroaaa/OmniBox` 是仅供只读参考的上游，本地**没有配置 `upstream` remote**，也不要添加。
- 提交信息风格：简短中文描述（如「去除缓存功能」「优化缓存」），不使用 Conventional Commits。
- 需要对比上游时（只读）：`git fetch https://github.com/Zoroaaa/OmniBox.git main`，再 `git log --oneline HEAD..FETCH_HEAD`。

## 已知问题

- `src/injector.ts` 的 `XMLHttpRequest.prototype.open` 重写**实际失效**：重写了局部 `url` 却用 `originalOpen.apply(this, arguments)` 传了原始参数，XHR 请求未走代理。修复：显式传参 `originalOpen.call(this, method, url, async, user, password)`。
- `src/utils.ts` 的 `sha256Hex()` 已无调用方（缓存移除后的死代码）。
- `package.json` keywords 仍含 `kv-cache`，但 KV 已在 `ed09e6a` 移除。
- **本机 `npm run lint` 报 "eslint 不是内部或外部命令"**：`node_modules/.bin` 缺 eslint 可执行文件。临时替代：`node node_modules\eslint\bin\eslint.js src`。
- **外部代理（SOCKS5/HTTP 出站）在 Workers 上不可行**（2026-09-29 评估后放弃）：`fetch()` 无 proxy 选项；`cloudflare:sockets` 的 `startTls()` 会用 `connect()` 传入的主机名（隧道内是代理而非目标站）校验证书、必然失败；`expectedServerHostname` 选项在 workerd 中不受支持。HTTPS 走代理需 userland TLS（数千行），违背零运行时依赖约束。已保留出口 IP 探测作为信息展示，不做出口切换。

## 修改记录（Change Log）

> 统一登记每次维护开发的内容，便于追溯。格式：`日期 — 改动摘要 — 涉及文件`。

| 日期 | 改动 | 涉及文件 |
|------|------|----------|
| 2026-09-28 | 创建 AGENTS.md，记录项目功能、命令、约束与已知问题 | `AGENTS.md` |
| 2026-09-28 | 明确仓库规则：提交只推送到 DemonFourth/OmniBox，不涉及 Zoroaaa/OmniBox | `AGENTS.md` |
| 2026-09-29 | 密码页右上角新增「出口 IP」探测按钮与弹窗；新增 Worker `/api/trace` 端点（1.1.1.1/cdn-cgi/trace），展示 ip/colo/loc/tls 等 | `templates.ts`, `worker.ts` |
| 2026-09-29 | 移除弹窗「探测指定网站出口 IP」区块（两次 fetch 出口 IP 可能不同、结果不准确）及其死 CSS/JS；`/api/trace` 移除 `?url=` 分支 | `templates.ts`, `worker.ts` |
| 2026-09-29 | 放弃外部代理核心：移除 `config.ts` 的 ProxyConfig 接口与 PROXY_* 环境变量；评估确认 Workers 上 HTTPS 隧道内 TLS 不可行 | `config.ts` |
| 2026-09-29 | 修复密码页右上角「出口 IP」按钮被主题切换按钮完全覆盖：`.top-bar` 内 `.theme-toggle` 取消 `position: fixed`，恢复 flex 布局并统一内边距 | `templates.ts` |
| 2026-09-29 | 代理提示横幅内直接显示出口 IP：提示脚本先捕获原生 fetch（防 `/api/trace` 被代理钩子改写到上游站），异步请求同源 `/api/trace` 渲染「当前出口 IP · 机房 · 地区」，探测失败静默 | `injector.ts` |
