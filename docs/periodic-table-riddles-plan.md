# Periodic Table Riddles with Answers：页面与内容规范

更新日期：2026-09-16

状态：**done — 英文 `en-v1` 内容、网页、全语言入口和本地验证已完成。** 提交、推送、部署与翻译均为 deferred，按用户决定暂不执行。

- [英文草稿](./content-drafts/periodic-table-riddles.en.md)
- [逐题核查记录](./content-drafts/periodic-table-riddles.en-review.md)

上级计划：[内容路线图](./content-roadmap.md)。

## 1. 页面定位

一篇包含我们原创的固定元素谜题、答案和推理过程的学习文章。

读者可以先猜，再查看答案和解释，最后进入现有元素挑战。它不是其他网站题目的答案库，不是每日游戏答案页，也不是新游戏模式。

- 建议英文标题：`Periodic Table Riddles with Answers`
- 建议路径：`/learn/periodic-table-riddles`
- 首发语言：英文。
- 建议首版规模：12 道原创题；这是可调整的编辑起点，不是 SEO 要求。
- 主要承接入口：`/practice`，实施时验证其仍然可用。

## 2. 原创题的原则

### 使用哪些线索

- 在周期表中的位置：族、周期、区块。
- 元素类型与明确条件下的物态。
- 经核查的性质或生活用途。
- 通过组合线索排除其他候选元素。

### 编写时的边界

- 每道题组合起来必须只有一个正确元素；单条线索可以不唯一。
- 不把主观形容词，如“最神奇”，当作决定答案的依据。
- 物态写明温度条件，必要时写明压力；不要混用室温与 STP。
- 区分原子序数、质量数和周期表中的原子质量，不靠含糊近似判断唯一答案。
- 族编号统一采用 1–18；说明本页使用该编号，避免与部分教材旧编号混淆。
- 涉及家族、区块或分类例外时明确措辞，不以简化规则掩盖例外。
- 用途线索区分元素单质和其化合物，例如食盐含钠离子，不能写成金属钠可食用。
- 不以英文名字长度、首字母或谐音作为首版主要题型，方便后续翻译。
- 独立写作，不复制第三方题目和答案解析。

## 3. 建议题目分布

| 难度 | 建议数量 | 出题方式 | 解析重点 |
| --- | ---: | --- | --- |
| 入门 | 4 | 明确位置与类别组合 | 教读者找到行、列和交叉点 |
| 进阶 | 4 | 多条属性或性质组合 | 解释每条线索如何缩小范围 |
| 挑战 | 4 | 容易混淆的元素、用途与属性组合 | 对比候选，解释为何其他答案不成立 |

尽量覆盖不同元素类型，避免多道题只是替换族和周期数字。难度标签为编辑判断，不宣传为经过学生测试的等级。

## 4. 单题写作模板

英文正文已保存到 `docs/content-drafts/periodic-table-riddles.en.md`，逐题核查记录另存于同目录的 `periodic-table-riddles.en-review.md`。以下模板供后续修订或扩展使用。

每题使用稳定 ID，翻译与修订沿用相同 ID：

```markdown
### riddle-01

Difficulty: Easy

Question:
[Original English clues]

Answer:
[Element name] ([Symbol]), atomic number [N].

Explanation:
1. [What the first clue establishes]
2. [How the next clue narrows the candidates]
3. [Why the remaining element is the answer]

Fact-check sources (editorial notes):
- [Source title](URL) — supports [specific clue]; checked YYYY-MM-DD.

Uniqueness check (editorial notes):
- Candidate scope: [all elements / explicitly stated subset].
- Combined clues leave: [one element].
- Ambiguities or exceptions checked: [...].

Localization notes (editorial notes):
- [Terminology, wordplay, or other issues; write “None” when appropriate]
```

### 格式示例，非已完成的审核题库

**Question:** I am in period 3 and belong to the noble gases. Which element am I?

**Answer:** Argon (Ar).

**Explanation:** Period 3 narrows the search to one row. The noble-gas clue identifies group 18. Their intersection is argon.

该示例只说明写法。正式纳入文章前，同样补充来源和核查记录。

## 5. 化学事实与唯一性审核

按题逐项完成，不把数据文件存在视为核查完成：

1. 从 `data/atom.json` 或现有挑战中选候选元素与属性组合。
2. 对照 RSC 周期表、IUPAC、OpenStax 等可靠资料核对对应事实；记录实际查阅的页面和日期。
3. 对结构化属性线索，可用全部候选元素筛选，检查是否仅余一个答案。
4. 用途、历史等非结构化线索人工核查，不把字符串筛选当成科学审核。
5. 检查解析是否真的用到了题目给出的线索，避免额外引入未给出的决定条件。
6. 对有争议、条件不明确或多个答案的题，修改线索或替换题目。

若本地数据与可靠来源冲突，先记录差异并使用核实事实写作；游戏数据修复作为独立范围处理，不在内容任务中随意扩张修改。

## 6. 页面结构

1. H1 与简短简介：说明有答案和解释，适合自测，也可以借助周期表。
2. 使用说明：先读题，再看答案；解释 1–18 族编号约定。
3. 难度目录：跳转至入门、进阶、挑战三个章节。
4. 题目主体：每题有独立标题，答案和解析默认可折叠。
5. 解题方法小结：读位置、识别类别、组合线索、检查例外。
6. 继续练习入口：链接现有元素挑战，不承诺文章所没有的专项训练功能。
7. 参考资料与最近审核日期：日期与实际审核一致。

可选简短 FAQ 只回答文章读者真实需要的问题，如是否需要背完整张表；不为了关键词重复堆积问答。

## 7. 后续网页实施要求

- 复用项目样式与组件，保证移动端长句、化学符号和段落可读。
- 题目、答案与解析出现在服务端生成的 HTML 中；折叠仅改变显示状态。
- 可使用原生 `details/summary` 或已具备可访问性的组件；键盘可展开，焦点可见。
- 使用正确标题层级、段落和列表，不能仅靠颜色表达难度或答案状态。
- title、description、canonical、语言链接和 sitemap 与实际发布情况一致。
- 首篇可从现有页脚添加明确入口；首版不必先建立庞大的内容中心。
- 所有语言显示已完成的英文文章入口，明确标注 English；不生成未完成的译文页面。
- 不读取、存储或发送当天目标答案；文章固定题目与每日状态独立。
- 若增加统计，只按现有约定记录页面访问或进入游戏的动作，避免发送题目答案、自由输入或用户标识。

翻译和未发布语言的路由行为见 [翻译流程](./content-localization-plan.md)。

## 8. 执行清单

### 英文草稿 — done

- [x] 写齐简介、使用说明、12 道题、方法小结和练习引导。
- [x] 为所有题分配稳定 ID。
- [x] 每题有独立原创表达、答案和逐步解析。
- [x] 每题有事实来源、核查日期和唯一性记录。
- [x] 检查语言依赖、术语、温度条件、分类例外及单质与化合物的区别。
- [x] 完成英文 title 与 description 草稿。

### 页面实现与验证 — done

- [x] 核对页面正文与完成审核的英文草稿一致。
- [x] 检查手机、桌面、键盘操作和服务端 HTML 中的正文。
- [x] 检查目录锚点、答案折叠和游戏入口。
- [x] 检查 metadata、语言路由与 sitemap。
- [x] 所有语言显示英文入口，标注 English，直接链接英文规范 URL。
- [x] 核查全部 12 个非英文路径跳转英文后返回 200，并保留查询参数。
- [x] 运行项目要求的测试、lint 和 build；只有部署配置变动才追加对应构建检查。
- [x] 记录验证结果及本地、预览、正式发布状态。

文档编写阶段不需要运行应用构建；上述检查在实际代码实施时执行。

## 9. 当前实施与验证记录 — done（2026-09-16）

- 路由：`/learn/periodic-table-riddles`，仅英文；最新本地验收使用端口 `3108`，预览服务是否仍运行需以实际状态为准。
- 实现文件：`app/[locale]/learn/periodic-table-riddles/page.tsx`、`riddles-article.tsx`、`riddles.module.css`。
- 正文以静态 JSX 服务端输出，来源为 `en-v1`；无新增 Markdown 运行时依赖。修改题目时同步正文文档与 JSX。
- 原生 `details/summary` 折叠答案，保留服务端 HTML；难度目录、解题方法、来源和游戏入口齐全。
- 所有共享页脚显示 `Periodic Table Riddles & Answers (English)`，直接链接英文 URL，带 `lang="en"` 和 `hreflang="en"`。
- 12 个非英文 locale 的 guide 地址以 307 跳转至英文 URL，并保留查询参数；不再隐藏入口或返回 404。
- 英文文章不受 Cookie 或浏览器语言自动跳转影响；游戏原有语言协商保持不变。
- canonical、Open Graph、Twitter 和 sitemap 已补齐；hreflang 仅英文与 x-default，不生成不存在的译文链接。
- 路由回归测试覆盖全部非英文 locale；Vitest 对 next-intl 使用 inline 依赖处理，解决测试环境中的 Next.js ESM 子路径解析。
- Node 22.16.0：`npm test` 86/86 通过；`npm run lint` 无错误（8 条原有图片警告）；Next.js 生产构建与 `npm run build:cloudflare` 通过。既有 middleware 命名弃用提示仍存在。
- Chrome ai-publisher：桌面与手机目视检查、目录跳转、Enter 展开/收起答案通过，未发现横向溢出。
- 本地 HTTP：12 道题与 36 段解释逐条匹配正文文档；13 个语言入口可见；非英文路径跳转英文后返回 200；查询参数、SEO 标签、游戏目的地与 sitemap 检查通过。
- 上述记录引用本轮实际验证结果。本次 Markdown 状态整理没有重新运行应用测试或构建。

## 10. 发布与后续事项

- **发布范围：** 2026-09-16 用户授权只发布建议表单和英文 Guide；练习大厅、独立挑战路由和分子模式保留本地。Guide 使用现有 `/practice` 入口。
- **deferred：翻译。** 用户决定所有语言共用英文 guide，不生成 12 种译文。
- **done：线上验收。** 2026-09-16 英文文章返回 200，12 道题、canonical、13 个语言入口及 12 个非英文跳转验证通过。数据观察为后续 todo。
- **done：部署。** 使用隔离目录完成 79 项测试、lint 和 Cloudflare 构建，Worker 版本 `0b07d2fe-fc5e-43be-ac20-428bc2c7d91e`。线上 URL：`https://elemendle.com/learn/periodic-table-riddles`。
