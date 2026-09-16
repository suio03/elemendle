# Elemendle 内容页面执行路线图

更新日期：2026-09-16

状态：**done — 英文 guide 的内容、网页、全语言入口和本地验证已完成。** 用户已授权发布建议表单和英文 Guide；翻译暂缓。

状态约定：`done` = 已完成，`todo` = 未开始，`deferred` = 暂缓。本地验证与上线结果分别记录；本轮英文 Guide 已上线。

已完成：[英文草稿](./content-drafts/periodic-table-riddles.en.md) · [核查记录](./content-drafts/periodic-table-riddles.en-review.md)。

## 1. 从这里开始

| 工作项 | 状态 | 记录 |
| --- | --- | --- |
| 内容方向调研与规划 | done | 本文第 4–5 节 |
| 12 道英文原创题及解析、事实核查 | done | 英文草稿与核查记录 |
| 英文网页、目录、折叠答案及游戏入口 | done | [页面规范](./periodic-table-riddles-plan.md) |
| 全部 13 种语言显示英文入口，非英文 guide 地址跳转英文 | done | [语言策略](./content-localization-plan.md) |
| 桌面、手机、键盘、正文一致性及路由验证 | done | 86 项测试、lint、生产与 Cloudflare 构建通过 |
| 部署及线上验收 | done | 2026-09-16，仅发布建议表单和英文 Guide；Git 同步随本次提交 |
| 12 种非英文译文 | deferred | 当前共用英文内容 |
| 前 20 个元素、属性说明等后续页面 | todo | 尚未编写或实施 |

本轮仅发布已完成的英文 Guide 和建议表单，不发布本地练习大厅或分子模式。扩展内容与翻译继续暂缓。

## 2. 已确定的方向

- 建立帮助读者认识元素、读懂线索的内容区，并衔接现有游戏。
- 首篇主题为 `Periodic Table Riddles with Answers`，即元素周期表猜谜题，附答案和解析。
- 谜题由我们原创；解析解释我们自己的题，不是整理其他网站题目的答案。
- 文章使用固定示例，不公布每日游戏答案，也不读取当天目标。
- 最新决定：只提供英文版，所有语言站点显示英文入口；暂缓翻译。
- 优先使用化学属性和生活用途线索，减少对英文谐音、字母数量和双关的依赖。

## 3. 当前项目基础

以下为 2026-09-16 的本地代码观察，不代表线上部署状态：

| 项目现状 | 对内容规划的影响 |
| --- | --- |
| `/` 为每日猜元素游戏 | 内容可以引导用户体验每日挑战 |
| `/practice/classic` 为经典练习，已提交版本的 `/practice` 为元素挑战 | 首篇谜题文章优先衔接元素挑战 |
| `/properties` 目前只有标题 | 可将此路径发展为完整属性说明，避免再建重复主题页 |
| 分子模式属于未发布的本地改动 | 近期不围绕分子玩法规划内容入口 |
| `data/atom.json` 有元素属性和提示 | 可用于挑选候选题，但不能直接视为已审核的教学资料 |
| 已有多语言路由，英文默认不带前缀 | 内容需要单独管理已发布语言，不能自动为全部语言生成文章 |

实施时重新核对相关代码，尤其是练习入口与语言路由。

## 4. 内容优先级

优先级依据为产品契合度、搜索意图和制作成本，不是搜索量排名。

| 顺序 | 主题 | 建议路径 | 读者要解决的问题 | 内容交付物 |
| --- | --- | --- | --- | --- |
| 1 | Periodic Table Riddles with Answers | `/learn/periodic-table-riddles` | 根据线索猜元素，理解推理过程 | 原创固定题、答案、逐步解析、练习入口 |
| 2 | First 20 Elements: Names, Symbols and Memory Tips | `/learn/first-20-elements` | 记忆前 20 个元素的名字、符号和顺序 | 对照表、记忆方法、静态自测和答案 |
| 3 | How to Read Periodic Table Clues | `/properties` | 理解游戏各项属性和反馈 | 字段说明、示意图、实际解题案例 |
| 后续 | Confusing Element Symbols Explained | `/learn/element-symbols` | 理解 Na、K 等符号与英文名字的差异 | 名称来源、易混淆组合、记忆提示 |
| 后续 | A 10-Minute Periodic Table Guessing Activity | `/learn/classroom-activity` | 教师组织短课堂活动 | 操作步骤、讨论问题、原创练习单和答案 |
| 后续 | 元素家族，如 Noble Gases | `/learn/noble-gases` 等 | 理解一类元素的共性与区别 | 成员表、特点、例外、线索示例 |
| 后续 | 精选元素档案 | 路径待具体规划 | 认识某种元素及其识别特点 | 经核查的特点、用途、对比与识别线索 |

注意：现有经典练习不是仅覆盖前 20 个元素的专项模式，不能在文章中作此承诺。文章自测可以使用静态题目，无需新增游戏。

## 5. 调研依据及限制

调研日期：2026-09-16。范围：英文查询和公开网页，未限定单一国家；不是美国、英国或其他地区的固定排名报告。

未取得搜索量、关键词难度、趋势或 Search Console 数据。因此不预测流量、排名或收入，也不据此决定优先翻译哪个国家或语言。

| 候选词或意图 | 观察到的证据 | 对我们的启示 |
| --- | --- | --- |
| `periodic table riddles with answers`、`what element am i` | [AACT 的 Which Element Am I?](https://teachchemistry.org/classroom-resources/which-element-am-i) 和 [教师谜题资料](https://www.teacherspayteachers.com/Product/Who-Am-I-WS-Riddles-using-basic-Periodic-Table-knowledge-includes-KAHOOT-8645696) | 有现成教学应用场景；我们强调原创题和逐步解释 |
| `first 20 elements`、记忆和自测 | [JetPunk 测验](https://www.jetpunk.com/user-quizzes/200832/periodic-table-quiz-first-20-elements?device=phone)、[Creative Chemistry 资料](https://www.creative-chemistry.org.uk/funstuff/wordsearch/elements) | 列表、记忆和自测可先合为一页；已有竞争，不视为低难度词 |
| `periodic table groups and periods`、读表 | [OpenStax 周期表说明](https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table) | 通用定义有教材竞争，需要结合我们的游戏案例 |
| `why is sodium Na`、符号来源 | [美国国会图书馆解释](https://www.loc.gov/everyday-mysteries/categories/chemistry/item/chemical-elements/) | 适合后续制作易混淆符号专题；写作时重新读取并核查来源 |
| 教师资料与游戏的衔接 | [Periodic Bubbles 教师页](https://periodicbubbles.com/teach/)、[Periodic Room 每日游戏](https://periodicroom.com/games/daily/) | 同类站已有这种内容组织方式，不代表其流量或转化已被验证 |
| 单元素百科 | [RSC 钠元素档案](https://periodic-table.rsc.org/element/11/sodium) | 权威参考内容丰富，暂不批量生成 118 个薄内容页面 |

以上链接用于保留调研依据，不授权复制其题目、插图或文章。原创内容里的化学事实应另行记录可靠来源。

## 6. 执行阶段与完成标准

### 阶段 A：首篇内容准备 — done

- [x] 按谜题规范写英文草稿，建议首版 12 道题。
- [x] 为每道题记录答案、线索、解析和事实来源。
- [x] 核对答案唯一性、化学事实和难度。
- [x] 完成页面简介、标题、描述与游戏引导文案。

完成标准：草稿完整、可直接审阅；没有未经核实的线索，没有当天答案依赖。

### 阶段 B：英文页面实现与全语言入口 — done

- [x] 按既有样式实现文章、目录和答案展示。
- [x] 正文可直接访问，页面含真实的游戏入口。
- [x] 设置英文 metadata、canonical、语言可用性及 sitemap。
- [x] 全部 13 种语言显示标注 English 的入口。
- [x] 12 个非英文 guide 路径以 307 跳转英文，保留查询参数。
- [x] 完成移动端、键盘和内容检查。
- [x] 按项目要求运行 `npm test`、`npm run lint`、`npm run build`。
- [x] 涉及部署配置变动时增加 `npm run build:cloudflare` 验证。

完成标准：本地内容与页面验证通过，清楚记录是否已部署。实际发布仅在对应任务授权范围内执行。

### 阶段 C：上线后观察

- [x] 发布日期：2026-09-16；内容版本：`en-v1`；URL：`https://elemendle.com/learn/periodic-table-riddles`。
- [ ] 在可获得的数据中查看文章曝光、点击、查询和读者语言。
- [ ] 观察文章到现有游戏的访问路径；若现有统计不支持，记录缺口，另行规划必要事件。
翻译状态：deferred。当前不选择或生成译文；未来只有重新决定翻译时才启用翻译流程。

建议发布后约 4–6 周做首次复盘；这是检查时间，不是排名生效承诺。数据不足时标注不足，不用短期无流量推断主题无需求。

### 阶段 D：扩展主题 — todo

- [ ] 完成前 20 个元素学习页。
- [ ] 完成 `/properties` 属性说明。
- [ ] 用实际查询与游戏承接情况重新排序后续主题。

## 7. 范围控制

- 当前交付包括规划文档、首篇 12 题英文草稿及网页，不包含扩展题库或翻译；本轮已授权部署。
- 首篇内容实施无需引入账号、反馈表单、投票、题目生成器或新的游戏模式。
- 暂不批量制作 118 个元素档案，暂不按日期生成每日答案文章。
- 翻译按文章的已发布语言管理，详见独立流程；不能将未翻译正文伪装为本地化页面。

## 8. 草稿阶段任务记录

> 按 `docs/periodic-table-riddles-plan.md` 完成第一篇英文文章草稿，保存为 Markdown。包含 12 道原创题、答案、逐步解析、事实来源和唯一性核查记录。本次只写内容，不实现网页。

上述草稿阶段及网页实施已完成，详细验证见谜题页面规范末尾的实施记录。本轮发布以用户限定的建议表单和英文 Guide 为范围，翻译继续暂缓。
