# 用户建议 → Discord

## 已确定

- [done] 使用站内短表单，参考同级 Scribix 项目右下角建议入口。
- [done] 无需登录，不要求邮箱；使用独立的 Elemendle Discord 频道，不复用 Scribix Webhook。
- [done] 本地实现及独立频道接收已验证；2026-09-16 用户授权发布建议表单和英文 Guide。

## 本地实现

- [done] 全站右下角入口、可关闭弹窗、桌面文字按钮与手机图标按钮。
- [done] 13 种界面语言的表单及提示；Guide 仍只提供英文。
- [done] 10–1000 字符建议；发送中阻止重复点击；失败保留输入；成功显示确认。
- [done] `POST /api/feedback` 从服务端读取 `DISCORD_FEEDBACK_WEBHOOK_URL`。
- [done] Discord 消息标题为 `New Elemendle feedback`，包含建议和当前页面路径，不转发查询参数、邮箱、游戏记录或 IP。
- [done] `allowed_mentions: { parse: [] }`；`wait=true` 等待 Discord 确认；8 秒发送超时。
- [done] 同源请求检查、8 KiB 请求体上限、隐藏反垃圾字段、链接数量与重复字符检查。
- [done] 成功后设置 10 分钟 HttpOnly Cookie，限制同一浏览器重复提交；失败不设置 Cookie。
- [done] 更新 FAQ，区分匿名游戏统计和主动提交的建议。

Cookie 是基础提交间隔限制，清除 Cookie 或直接调用接口可绕过，不是按 IP 的全局限流。若出现垃圾建议，可在 Cloudflare 为 `/api/feedback` 配置速率限制，或增加 Turnstile。

## 配置与发布

1. 在独立的 Elemendle Discord 文字频道创建 Incoming Webhook。
2. 在本项目 `.env.local` 添加以下变量；该文件已被 Git 忽略：

   ```dotenv
   DISCORD_FEEDBACK_WEBHOOK_URL=你的专用Webhook地址
   ```

   地址属于密钥，不要放入 `NEXT_PUBLIC_*`、代码、文档或聊天。
3. 重启本地服务，发送一条明确标记为测试的建议，核对独立频道收到的正文和路径。
4. 准备部署时，在 Cloudflare Worker 的 Secrets 中配置同名变量。用户已完成同名 Secret 配置，发布时通过 Wrangler 验证其存在。

- [done] 配置独立频道 Webhook：保存在被 Git 忽略的 `.env.local`，`.env.example` 保留空值。
- [done] 2026-09-16：通过本地 `/api/feedback` 发送一条标记为 `[TEST / 本地接入测试]` 的消息；Discord 在 `wait=true` 下确认成功，本地接口返回 HTTP 200 和 `ok: true`，并设置提交间隔 Cookie。
- [done] 2026-09-16：部署到 `elemendle.com`，Worker 版本 `0b07d2fe-fc5e-43be-ac20-428bc2c7d91e`。Chrome ai-publisher 从 `/ch` 提交上线测试，页面显示发送成功，服务端在 Discord 确认后返回成功。
- [done] 发布内容仅含建议表单和英文 Guide；其他练习与分子模式改动留在本地。

## 验证

- [done] 2026-09-16：17 个测试文件、101 项测试全部通过。
- [done] ESLint 通过，保留项目原有的 8 条 `<img>` 警告。
- [done] Next.js 生产构建和 OpenNext Cloudflare Worker 构建通过。
- [done] Chrome `ai-publisher` 中验证中文输入、未配置时的失败提示与文本保留、Escape 关闭并恢复焦点；检查 390px 手机布局及英文 Guide 上的表单。
- 单元测试覆盖无效输入、同源检查、提交间隔、Discord 失败、敏感 URL 参数过滤和提醒禁用。
- UI 测试覆盖失败保留输入、重试成功和并发提交保护。
- `lib/feedback.workerd.test.ts` 在真实 workerd 中执行请求流读取与 Fetch，外发流量由本地模拟服务接收，不发送到 Discord。
- 使用 Node 22.16.0 运行 `npm test`、`npm run lint`、`npm run build:cloudflare`（包含 Next.js 生产构建）。

参考：[Discord Execute Webhook 文档](https://docs.discord.com/developers/resources/webhook#execute-webhook)。

## 本次发布验证

- 隔离目录基于已提交代码，仅导入本次范围；79 项测试通过，lint 无错误（8 条原有警告），Next.js 与 Cloudflare 构建通过。
- 线上英文 Guide 返回 200，含 12 道题和正确 canonical；13 个语言入口及 12 个非英文跳转验证通过。
- Python 默认客户端提交被 Cloudflare 以 1010 拒绝；真实浏览器提交通过，未更改防护配置。
