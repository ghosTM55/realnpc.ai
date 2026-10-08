<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shared project instructions

- 本文件是 Codex 和 Claude 的项目规则唯一来源。当前本地 `CLAUDE.md`
  通过 `@AGENTS.md` 引用它，不再维护第二套规则。
- `CLAUDE.md` 被 Git 忽略，新克隆不会携带它；使用 Claude 时确认本文件
  已加载，必要时在本地创建只含 `@AGENTS.md` 的入口。
- 这里只记录长期约束和可验证的验收条件，不堆积审查日志、临时性能数字或任务计划。

## Architecture and release

- RealNPC 官网使用 Next.js 16 / React 19 / Tailwind 4，静态导出到 `out/`，
  无后端。保持静态导出兼容；不要在普通重构中引入服务器运行时或真实表单提交。
- `.github/workflows/pages.yml` 在 push `main` 后部署 GitHub Pages，
  **push main 就是上线**。提交、合并和发布须有用户针对当前任务的授权；
  过去一次发布的授权不自动延续到新任务。

## Ponytail Scope

Use ponytail to remove implementation redundancy, not to flatten deliberate
product expression. Do not recommend cutting core visual or interaction
surfaces such as the 3D globe, hero/assembly animation, VI tokens, typography,
or semantic color system merely because they are heavier than a simpler UI.
Target dead code, unused assets, unused options, placeholder UI, duplicate
config, and documentation drift first.

- 代码优化默认保持公开文案、NPC 名称、布局、字体、颜色和动效观感。
  可访问性和交互修复应说明行为差异；可见变化须得到用户明确授权。
- 用户已批准的新功能按其验收目标开发；上述保真要求用于保护功能范围外的
  既有体验，不应被解释为禁止必要的新界面或交互，也不必重复确认已授权的变化。
- 地球优化必须检查正反面国界、遮挡和旋转过程；不能只凭 draw call 降低
  就接受背面线条或层级变化。保留完整地图几何。
- 流场优化不得通过减少粒子、降低帧率或削弱视觉密度来实现。
- 既有否决方向，除非用户重新明确要求，不要引入：Prettier、CI 浏览器测试、
  构建期地图几何生成、portrait assembly 拼图、通用 Reveal 框架、
  通用步骤渲染注册表、通用 reduced-motion hook。步骤常量和明确的步骤组件可以使用。

## Implementation boundaries

- 修改前先找现有行为的归属：领域数据与校验在 `src/domain/`，
  配置器 UI 与存储适配在 `src/components/configurator/`，
  流场算法与运行适配在 `src/lib/flowField.ts`、`flowBackground.ts`、`flowWorker.ts`。
  复用已有枚举、步骤常量和 VI token，不复制平行定义，也不为单一实现建立通用框架。
- 存储和 URL 都是输入边界。内存与存储使用一致的规范化结果；保留旧草稿迁移、
  损坏数据及存储不可用时的行为。旧入口只转发已支持的查询参数，
  不要因重构而让原本忽略的参数覆盖用户草稿。
- 新增生产依赖须先获授权。构建脚本直接使用的工具应显式声明依赖，
  不依赖其他包偶然带来的传递依赖。

## Feature delivery and review handoff

- 新功能开始前明确用户目标、验收条件及允许改变的行为；按可验证的小步实现，
  将无关重构留在任务范围外。核心逻辑和稳定 bug 用行为测试覆盖，视觉调整用实际渲染验收。
- 交给 Claude 或其他 reviewer 时提供：基准 commit、待审分支与 HEAD、
  功能目标、允许的视觉或行为差异、已跑测试及结果、已知限制和未验证项目。
  不依赖 reviewer 能看到当前聊天或被 Git 忽略的本地文档。
- Review 应核对实际 diff 和验收条件，优先报告正确性、兼容性、可访问性及性能回归，
  附文件位置、触发条件和影响；区分必须修复的问题与可选建议。
  Commit message 和开发者自述只是线索，不能替代验证。

## Animation and failure handling

- 动画要覆盖完整生命周期：按页面可见性、是否被遮挡、暂停状态和 reduced motion
  控制运行；卸载时清理 RAF、GSAP、observer、事件监听和 Worker。
  跨路由共享的背景不要因导航重复初始化；手机工具栏伸缩不应导致重播或闪烁。
- Worker 功能检测通过不代表启动成功。保留构造失败、加载失败、context 不可用
  和启动超时的主线程回退；回退复用同一绘制算法及最新尺寸、暂停状态。
  Canvas 已转移给 Worker 后，回退需要可用的新 Canvas，并正确维护观察器与清理。
- 改动 Worker、地图加载或浏览器存储时，增加或运行对应故障注入检查，
  验证用户仍能继续使用，不能只检查正常路径或是否没有抛异常。
- 地球射线检测只包含可交互对象，并保留背面遮挡判断。
  涉及 picking 时验证旋转后的城市悬停和点击，包括 Stockholm、Warsaw、
  Istanbul、Tel Aviv、Doha；不能只验证单个默认视角。

## Accessibility

- 交互修改必须实际用 Tab / Shift+Tab / Enter / Space / Escape 检查。
  同一操作避免重复焦点入口，隐藏或退出中的控件不得继续获得焦点，
  弹层关闭后应将焦点返回触发元素。
- 优先使用原生语义；`aria-label` 要与允许命名的元素或 role 配合。
  保持合理的标题层级，页面级 header / main / footer 不错误嵌套。
  验证键盘和 reduced-motion 路径，不以鼠标操作正常替代可访问性验收。

## Verification and assets

- Use Node 24. Run `npm test`, `npm run lint`, `npm run typecheck`,
  `npm run build`, then `npm run test:budget` before deployment.
- Against a local production export, run `npm run test:browser` and
  `npm run test:site`. Set `REALNPC_BASE_URL` and, if Playwright is provided
  by the host, `REALNPC_PLAYWRIGHT_MODULE` to its module path;
  `REALNPC_BROWSER_CHANNEL=chrome` runs them in installed Chrome instead of
  Playwright's bundled Chromium.
- Web fonts and responsive images are committed build-time assets. Regenerate
  fonts with `scripts/subset-fonts.py` (Python deps in
  `scripts/requirements-assets.txt`), images with `npm run assets:images`
  and the globe map with `npm run assets:map`.
  Original typefaces and source images must remain available for regeneration.
- 修改字体子集或图片尺寸后，检查实际文案的字符覆盖、字体加载与高 DPR 显示；
  新增文案可能需要重新生成字体子集。不得为通过测试而直接放宽资源预算。
- 每项优化记录可复核的证据：资源字节数、主线程工作、draw call 或交互结果。
  分别说明测得的收益和预期收益，不把代码迁移到 Worker 等同于已证明真机帧率提升。
- 涉及渲染的优化需与修改前的生产导出对比，覆盖桌面与移动宽度、
  正常动画和 reduced motion、交互状态及浏览器控制台。
  静态截图不能替代运动与遮挡检查；声明视觉不变时说明已检查的范围。
- 本地浏览器测试不能冒充真机验证。涉及动画、viewport 或 WebGL 的发布，
  报告 iPhone Safari（NPC World / Partnership 滚动及工具栏伸缩）、
  Mac Safari（城市悬停与背面国界）、低端 Android（intro 后滚动）的
  实测结果或明确标记未验证。
- 纯规则文档修改检查 diff、路径和命令一致性即可，无需重跑应用测试；
  应用代码按影响范围验证，应用改动发布前执行上述完整检查。
  发布后确认 Pages 工作流成功、线上关键路由
  能加载本次构建，报告未验证项目。
