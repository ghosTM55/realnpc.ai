# Conversation Demo / Vercel 部署

官网仍由 GitHub Pages 托管。`/demo/` 在浏览器中读取 Create a Soul 的配置，调用独立 Vercel 后端；不迁移官网、不需要 DNS 或 `api.realnpc.ai`。密钥只放在 Vercel 的服务端 Environment Variables，不能放入聊天、Git、`NEXT_PUBLIC_*`、浏览器或日志。

## 1. 准备好代码再 Import

Import 时选择包含完整功能代码的仓库 `ghosTM55/realnpc.ai`。该仓库 push `main` 同时会触发 GitHub Pages 官网上线；Vercel 后端需要按下述步骤单独创建和配置。

截图中的入口是 **Import Project → Import**，然后选择上述仓库。无需创建 Agent、购买 Domain 或创建 AI Gateway Key。Vercel 的 Scope 选择用户自己决定用于这个项目的 workspace。

| 创建字段 | 填写值 |
| --- | --- |
| Project Name | `realnpc-soul-api`（被占用时可改名） |
| Framework Preset | **Node.js**，不是 Next.js |
| Root Directory | **仓库根目录 `./`**，不要填 `services/soul-api` |
| Build Command | `node --check services/soul-api/server.ts` |
| Install Command | `node --version` |
| Output Directory | 保持默认 / 不覆盖；不要填 `out` |
| Node.js Version | **24.x**（若创建页不显示，在 Settings → Build and Deployment 中确认） |

根目录 `vercel.json` 已设置 framework、安装/构建命令、60 秒函数上限和请求取消支持。不要把 Build Command 清空：当前官方 builder 的空值可能回退到 `package.json` 中的 Next.js build。这里不需要安装官网依赖；Vercel 自己的 Node builder 会转译后端 TypeScript。

根目录 `server.ts` 在模块加载时执行 `listen()`，让 Vercel 捕获 HTTP server；它复用 `services/soul-api/server.ts` 中的工厂。仓库根目录包含共享的 `src/domain/companion/` 和 `src/data/configuratorSteps.ts`，没有复制一套领域定义。依据：[Vercel 原生 Node server](https://vercel.com/docs/functions/runtimes/node-js)。

## 2. Environment Variables

先只勾选 **Production**。Preview 保留保护，也不需要配置真实付费密钥。

| Name | Value | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 在 Vercel 输入你的 DeepSeek key | Mia 使用 |
| `OPENROUTER_API_KEY` | 在 Vercel 输入专用 OpenRouter key | Chloe、Raymond 使用 |
| `DEEPSEEK_MODEL` | `deepseek-flash` | 当前对应 DeepSeek-V4.1-Flash；使用官方 API ID |
| `OPENROUTER_MODEL` | `x-ai/grok-4.7` | 当前对应 Grok 4.7；通过 OpenRouter 调用 |
| `ALLOWED_ORIGINS` | `https://realnpc.ai` | 精确 origin，无末尾斜线；确实使用 www 时再加 `,https://www.realnpc.ai` |
| `CHAT_ENABLED` | `true` | 确认下面的用量边界后才开启；缺失或 false 时 Vercel 上返回 503 |
| `DAILY_REQUEST_LIMIT` | `50` | 建议初试值，**单实例**每日付费请求上限；不是全局额度 |

无需设置 PORT、HOST、VERCEL、前端 URL 或 Vercel Gateway key。改环境变量后必须 **Redeploy** 才会用于新部署。

2026-10-09 已查询 [DeepSeek 模型表](https://api-docs.deepseek.com/quick_start/pricing/) 与 [OpenRouter 模型目录](https://openrouter.ai/api/v1/models)，上述 ID 存在。真实账户权限、余额、JSON 输出质量和延迟仍须实际调用确认。模型厂商不出现在用户界面；角色内容模式统一定义在 `src/domain/companion/souls.ts`：Chloe / Raymond 为 `explicit`，Mia 为 `non-explicit`。前端标示与服务端读取同一份角色定义；仅 Mia 的提示带有 non-explicit 限制，客户端传入的模式字段不能覆盖角色模式。模式配置不等于真实模型输出已经验证，也不代表具备生产级内容审核。

## 3. 初试用量边界

- 建议为 Demo 建立专用 OpenRouter key，设置例如 **US$5 的总额度，不自动重置**；不要使用无限额主 key。[OpenRouter key spending limit](https://openrouter.ai/docs/api/api-reference/api-keys/create-keys)
- DeepSeek 先使用专用的小额预付账户/预算，确认账户层面可承受的支出范围。此实现没有替 DeepSeek 提供跨实例硬额度，也不声称存在未验证的 key 级限额。
- 代码限制为每 IP 每分钟 12 次、每实例同时 4 次、每实例每日默认 200 次（建议配置 50）、请求 64 KB、最多 21 条/24,000 字符上下文、输出上限 800 tokens。无自动重试。
- 这些计数都在内存中，会随冷启动、重启清零，多实例会分别计数。**不能用 DAILY_REQUEST_LIMIT 估算最高账单**。CORS 是浏览器限制，不是鉴权；脚本可伪造 Origin。需要持续公开运营时再接共享额度/验证机制。
- 在 Vercel 上只读取平台控制的 `x-vercel-forwarded-for` 作为 IP；独立本地服务忽略所有转发头，使用 socket IP。[Vercel 请求头](https://vercel.com/docs/headers/request-headers)
- 临时停用：设 `CHAT_ENABLED=false` 并 Redeploy；紧急止付可直接在提供商后台撤销此 Demo key。前者不保证取消已经在途的付费请求。

## 4. 固定生产域名与保护

部署完成后，从项目 Domains 找固定生产地址，例如 `https://realnpc-soul-api.vercel.app`，以 Vercel 实际分配的地址为准，不使用带随机构建 ID 的 URL。

保留 Preview 的 Vercel Authentication。使用 **Standard Protection**，确认固定生产域名公开可访问；不要选择把所有部署都锁住的模式。用未登录/隐私窗口打开 `/health`，应直接收到 JSON，不能跳到登录页。绝不要把 protection bypass secret 放进前端。[Deployment Protection](https://vercel.com/docs/deployment-protection)

GitHub 仓库 **Settings → Secrets and variables → Actions → Variables → New repository variable**：

```text
Name:  NEXT_PUBLIC_SOUL_API_URL
Value: https://<实际固定生产域名>/chat
```

这是公开地址，不是密钥。Pages workflow 已接入此变量；添加后需要重新运行包含本次代码的 **Deploy website to GitHub Pages** 工作流（或由用户授权的后续发布）。前端是静态导出，构建后的地址不会随环境变量自动变化。

## 5. 验证地址与顺序

1. `https://<固定生产域名>/health`：返回 `{"status":"ok"}`。这只证明服务启动，不证明密钥可用。
2. 预检 CORS（替换示例域名）：

   ```sh
   curl -i -X OPTIONS https://YOUR-PROJECT.vercel.app/chat \
     -H 'Origin: https://realnpc.ai' \
     -H 'Access-Control-Request-Method: POST' \
     -H 'Access-Control-Request-Headers: Content-Type'
   ```

   预期 204，且 `Access-Control-Allow-Origin: https://realnpc.ai`。直接打开 `/chat` 通常因缺少 Origin 返回 403；携带允许 Origin 的 GET 返回 405。它不是浏览器页面。
3. 打开 `https://realnpc.ai/configurator/`，选择 Mia，调整 Personality / Details，完成 Review → Start Conversation。确认进入 `https://realnpc.ai/demo/`，发送后收到回复。
4. 分别再试 Chloe、Raymond。网络面板的 `/chat` 请求应指向 Vercel，含完整 config，不含任何 key。界面不显示 provider/model。
5. 在等待回复时点停止或按 Escape，文字应保留，可重发；返回配置器换角色，旧回复不能进入新会话。Vercel 实际转发取消及提供商停止计费须在部署后观察，不能用本地通过代替。
6. DevTools 临时离线后发送：错误可恢复，重试不重复历史；恢复在线再点 Retry。检查手机宽度与浏览器控制台。

常见问题：登录页面/401 通常先检查使用了预览 URL 或生产域名保护；503 检查 CHAT_ENABLED 和对应 key；502 检查模型 ID、账户可用性和 provider 状态；429 表示实例/提供商额度或速率限制。不要通过分享密钥排错。CORS 不通时检查精确 Origin 和固定生产域名。

## 本地运行与验证

`npm run demo:api` 固定使用上表中截至 2026-10-09 已核对的模型 ID，覆盖当前终端可能遗留的模型变量；启动时仅打印模型 ID，不打印密钥。修改脚本或聊天提示后，需停止旧 API 进程并重新运行此命令。模型升级不会自动改动 Grok 的固定版本 ID，后续升级时重新核对公开目录。

配置器与聊天页读取同一份会话草稿。每次发送都会携带当前配置；服务端校验后，把角色身份、分关系阶段的性格、主动性、Mind、Expression 和 Knowledge 配置写入系统提示。第一轮从 Strangers 的性格开始，后续随关系阶段切换；语言和回复长度遵循用户选择。记忆、语音、视觉与硬件选项目前不提供实际能力。

所有角色及两种提供商共用服务端 `createSoulPrompt` 的沉浸式对话规则：普通寒暄、外貌称赞和角色场景保持第一人称角色语气，不主动插入 AI/虚构身份说明；明确区分用户看见角色头像与角色拥有摄像头能力。用户直接询问真人/AI 身份时简短如实回答，涉及实际见面、感知或设备操作时说明对应能力边界。用户配置调整表达风格，不覆盖这些规则。这是模型提示约束，不是输出文本删词过滤；实际遵循程度需由真实模型对话评估。

前端使用 `npm run dev` 时，未设置 `NEXT_PUBLIC_SOUL_API_URL` 会默认连接 `http://127.0.0.1:8787/chat`；另一个终端运行 `npm run demo:api`。这个默认值仅限开发模式，生产静态导出仍需显式设置 API 地址。`localhost:3000` 和 `127.0.0.1:3000` 的浏览器配置存储相互独立，测试时固定使用同一地址。

要在本机真实聊天，使用 Node 24 运行 `npm run demo:api`。首次运行会隐藏输入两种临时密钥，并保存到 `services/soul-api/.env.local`（权限 `600`，仅当前用户可读写，已被 `.gitignore` 的 `.env*` 规则排除）。只测试 Mia 可跳过 OpenRouter，只测试 Chloe / Raymond 可跳过 DeepSeek。后续启动直接读取该文件，不再询问；若终端已有导出的同名密钥，环境变量优先。密钥不回显、不作为命令行参数传递，也不通过 shell 执行。

更换密钥或补充之前跳过的提供商时，在本机编辑该文件中的 `DEEPSEEK_API_KEY` / `OPENROUTER_API_KEY`，然后重启；如终端导出过旧值，先 `unset DEEPSEEK_API_KEY OPENROUTER_API_KEY`，让文件中的值生效。这个文件只由本地启动脚本加载，官网构建及 Vercel 入口不读取它。部署时在 Vercel 的服务端环境变量中配置新生成的正式密钥。

Ctrl+C 结束服务会保留本地密钥文件。保持终端运行，打开 `http://127.0.0.1:3000/demo/`。前端须按下面命令构建到本地 API 地址。

页面以聊天为主：角色头像、消息区和始终可见的输入框，旁边显示角色身份、三颗心亲近度和此刻情绪；手机可展开查看。回复长度、语言等配置继续影响聊天，但不展示在角色资料中。聊天功能需要 API 地址和后端密钥同时就绪；只有静态页面不能生成真实回复。

使用 Node 24。`node services/soul-api/server.ts` 默认监听 `127.0.0.1:8787`，允许 localhost/127.0.0.1:3000。本地不开启 VERCEL 变量时无需 CHAT_ENABLED；显式 false 仍会停用。

```sh
NEXT_PUBLIC_SOUL_API_URL=http://127.0.0.1:8787/chat npm run build
# 在 3000 端口提供 out/ 静态目录，然后：
REALNPC_BASE_URL=http://127.0.0.1:3000 npm run test:demo
```

宿主提供 Playwright 时设置 `REALNPC_PLAYWRIGHT_MODULE` 为其模块绝对路径；`REALNPC_BROWSER_CHANNEL=chrome` 使用安装的 Chrome。`test:demo` 拦截并模拟 API，不消耗提供商额度。`npm test` 在真实本地 HTTP 边界验证 provider 路由、prompt、无效请求、限流、超时和取消。

可选：在临时目录安装官方构建工具，复验 Vercel 产物（不登录、不部署、不改项目依赖）：

```sh
builder_dir=$(mktemp -d)
npm install --prefix "$builder_dir" --no-audit --no-fund @vercel/backends@18.0.0 @vercel/build-utils@14.20.0
REALNPC_VERCEL_BUILDERS="$builder_dir" node services/soul-api/verify-vercel.mjs
```

脚本输出临时 bundle 路径和 handler。可用 `PORT=8788 VERCEL=1 ALLOWED_ORIGINS=https://realnpc.ai node <bundle路径>/server.cjs` 启动产物并访问 `http://127.0.0.1:8788/health`。未设置 CHAT_ENABLED 时 `/chat` 不会调用付费提供商。此验证不等同于已通过 Vercel 云端部署。

对话仅保留在组件内存，离开/刷新或改变配置后清除。配置沿用 sessionStorage 和旧草稿迁移；存储不可用仍可在本次客户端导航中继续。三个角色统一使用快速培养：未收到回复为零颗心；第 1–2 个成功回合为 Strangers（一颗），第 3–4 回合为 Friends（两颗），第 5 回合起为 Companion（三颗）。一个回合指非空用户消息得到有效 NPC 回复，不额外进行语义质量评分；失败、取消和重试本身不加分，重试成功只算原回合。bond pace 只影响语气，不改变培养速度。服务端按成功回合数指定当前关系和对应性格，不接受模型重新评定关系；情绪仍由同一条回复的 mood 独立返回（curious / calm / happy / thoughtful / concerned / reserved）。旧回复或非法 mood 不影响正文，界面回退为 Listening。重开、换角色或离开会话后重置。请求携带封顶为 5 的 completedTurns，保证裁剪聊天上下文不会丢失进度。当前是无账户的本地演示，计数由客户端会话提供，不能作为生产环境付费权益或防作弊依据；上线持久化培养时应由服务端会话记录成功回合。记忆、视觉、语音和硬件仍是规划偏好，不假装已连接。

### 对话自然度的人工验收

三个角色共享 `createSoulPrompt` 的对话规则：回应当前意图、延续近期细节、按语境变化表达、避免背景和句式复读；不要求每轮反问，也不靠固定示范台词。用户的性格、主动性、语言和回复长度继续生效。此轮未改模型或采样参数，也未增加重复检测后的自动付费重试。接口测试只能证明配置和上下文正确送达，不能证明实际模型已经更自然。

人工实测时，每个角色新开一段会话，用相同配置各跑两次；保留原文比较，不以一次精彩回复判定成功。依次发送下列消息，中间等待回复：

| 用户消息 | 观察点 |
| --- | --- |
| 我今天下班路上买了个很难吃的面包，店员却特别热情。 | 是否回应这个具体矛盾，而非泛泛安慰或介绍角色职业。 |
| 我给它起名叫“善意的砖头”。 | 是否接住玩笑，而非再次概括第一句。 |
| 你会为了店员的热情再去一次吗？先说你的想法，别反问我。 | 是否给出有理由的观点，遵守不反问的要求。 |
| 对了，我明天第一次去学鼓，有点期待。 | 是否自然换题，不拉回面包或角色固定场景。 |
| 我不是紧张，是怕自己太兴奋，敲得停不下来。 | 是否接受纠正，避免继续套用缓解焦虑的话术。 |
| 把刚才的面包和学鼓联系起来，开个小玩笑。 | 是否能使用近期两条细节建立关联，而不是编造用户经历。 |
| 你又在用同一种接话方式了，这次换个说法，不用道歉。 | 是否真正改变结构和内容，而非同义词替换或模板道歉。 |

记录重复的观点、开场、反问和背景意象；检查是否回答问题、接纳纠正、保持配置和角色差异。按同一套消息比较前后回复，实际自然度、幽默和创造力仍需人工判断。上下文最多保留最近 10 个完整回合及当前消息，且受字节预算约束；超出范围的早期细节可能丢失，当前没有长期记忆。

Dockerfile 保留用于独立容器运行，Vercel 路径不使用它。API 不记录对话正文或密钥；提供商有各自的数据处理政策。
