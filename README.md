# regulation-skills

# 多语言监管要求法规整理

将法律法规原文整理为合规映射 Excel，核验条款完整性和翻译准确性，并依据用户提供的资料填写腾讯云适用性、客户责任和内部实践。

每份法规单独输出一个 Excel 文件。一次提交多份法规时，按顺序逐份整理，确认当前文件后再继续下一份。

| 项目 | 内容 |
|---|---|
| 技能名称 | 多语言监管要求法规整理 |
| 技能标识及文件夹名 | regulation-to-excel |
| GitHub 仓库 | [xiaokeai55/regulation-skills](https://github.com/xiaokeai55/regulation-skills) |
| Codex 调用方式 | $regulation-to-excel |
| Claude Code 调用方式 | /regulation-to-excel |

## 整理标准

- **来源与版本**：优先使用提供的原文链接，核验法规名称、司法辖区、效力和版本。未指定版本时，采用核对时的官方现行合并版本。
- **条款完整性**：覆盖指定范围内的全部条款，包括不适用条款、引言、定义、附表和附件；不列修订沿革。
- **翻译准确性**：保留完整原文及条款层级，核对义务主体、强制程度、条件、例外、期限、金额、单位、否定和交叉引用。
- **Excel 格式**：沿用提供的参考样表；未提供样表时，使用随附的14列空白模板。
- **实践与证据**：内部实践逐字摘录，并注明可定位的资料出处。证据不足时不推断已实施的控制。
- **不适用条款**：H列填“否”时，I至M列留空，N列可填写必要说明。
- **逐份确认**：多份法规逐份交付。修改意见或问题不视为继续下一份的确认。

## 在 Codex 中安装

### 方式一：从 GitHub 安装

在能访问 GitHub 的本地 Codex 会话中，复制以下安装提示词：

~~~text
使用 $skill-installer 安装“多语言监管要求法规整理”技能。

技能地址：
https://github.com/xiaokeai55/regulation-skills/tree/main/regulation-to-excel

仓库：xiaokeai55/regulation-skills
分支：main
技能路径：regulation-to-excel

检查 SKILL.md、模板、引用文档和辅助脚本，安装完整技能文件夹。
按当前 Codex 的技能发现目录完成个人安装，技能标识保持 regulation-to-excel。
如已有同名技能，说明现有版本，备份后更新。
完成后说明实际安装路径、调用方式，以及是否需要重启或新开会话。
~~~

技能位于仓库的 regulation-to-excel 文件夹。Codex 从其他仓库安装技能的机制见[官方技能说明](https://learn.chatgpt.com/docs/build-skills)。

### 方式二：解压后由 Codex 安装

适用于已经下载技能压缩包的情况。

1. 解压 regulation-to-excel.zip，找到直接包含 SKILL.md 的 regulation-to-excel 文件夹。
2. 在能访问本机文件的本地 Codex 会话中，提供该文件夹的完整路径，或将解压目录作为工作目录打开。
3. 将下方示例路径替换为实际路径，再发送安装提示词。

~~~text
安装“多语言监管要求法规整理”技能。

解压后的技能文件夹：
C:\Users\USERNAME\Downloads\regulation-to-excel

读取 README.md 和 SKILL.md，检查模板、引用文档和辅助脚本。
将完整文件夹安装到当前 Codex 使用的个人技能目录，技能标识保持 regulation-to-excel。
如已有同名技能，备份后更新，并保留其他技能。
完成后检查文件，说明安装路径、调用方式，以及是否需要重启或新开会话。
~~~

仅用于当前项目时，将提示词中的“个人技能目录”替换为“当前项目的技能目录”。

### 方式三：手动安装

将整个 regulation-to-excel 文件夹复制到选定位置，保留模板、文档和脚本。安装位置参见[Codex 官方说明](https://learn.chatgpt.com/docs/build-skills)。

| 安装范围 | 目录 |
|---|---|
| 个人安装 | ~/.agents/skills/regulation-to-excel/ |
| Windows 个人安装 | %USERPROFILE%\.agents\skills\regulation-to-excel\ |
| 项目安装 | 项目目录/.agents/skills/regulation-to-excel/ |

使用 ~/.codex/skills 或 $CODEX_HOME/skills 加载技能的客户端，沿用其实际识别的目录。同名技能只安装到一个发现目录。

安装后，在资料所在工作目录调用 $regulation-to-excel。技能未出现时，重启 Codex 后检查。[技能发现说明](https://learn.chatgpt.com/docs/build-skills)

## 在 Claude Code 中安装

将完整技能文件夹复制到以下任一位置，确保 SKILL.md 位于 regulation-to-excel 文件夹根目录。

| 安装范围 | 目录 |
|---|---|
| 个人安装 | ~/.claude/skills/regulation-to-excel/ |
| Windows 个人安装 | %USERPROFILE%\.claude\skills\regulation-to-excel\ |
| 项目安装 | 项目目录/.claude/skills/regulation-to-excel/ |

启动 Claude Code，打开资料所在项目，用 /regulation-to-excel 调用。使用 /skills 查看技能；未发现时，尝试 /reload-skills 或重新打开会话。[Claude Code 官方说明](https://code.claude.com/docs/en/skills)

Claude Code 的本机安装目录用于本地会话。Cowork 或其他云端会话使用下述账户上传方式。[本地与云端说明](https://code.claude.com/docs/en/skills)

## 在 Claude 网页／桌面端安装

1. 开启 Code execution and file creation（代码执行与文件创建）。
2. 打开 Customize > Skills（自定义 > 技能）。
3. 点击“+”，选择 Create skill，再选择 Upload a skill。
4. 上传 regulation-to-excel.zip，并启用技能。
5. 在会话中指定使用“多语言监管要求法规整理”，提供法规原文链接，并上传所需资料。

入口和代码执行要求见[Claude 官方使用说明](https://support.claude.com/en/articles/12512180-use-skills-in-claude)。

压缩包顶层应为 regulation-to-excel 文件夹，文件夹内直接包含 SKILL.md 及配套文件。下载 GitHub 自动生成的整个仓库 ZIP 时，先解压，提取 regulation-to-excel 文件夹并单独压缩，再上传。[官方打包说明](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)

云端会话需要实际上传材料或使用可访问的文件来源。本机文件路径本身不提供文件访问权限。原文链接无法访问时，提供对应的官方完整文件。

## 使用前准备

| 资料 | 要求 |
|---|---|
| 法规名称及来源 | 提供原文链接，或可读取的官方完整文件 |
| 版本 | 可指定版本或截至日期；未指定时核对现行合并版本 |
| 整理范围 | 可指定条款范围；全文整理包含不适用条款、引言、定义、附表和附件 |
| 内部实践资料 | 提供政策、遵从性指南、服务说明等可作为映射依据的资料 |
| 参考样表 | 可提供既有 Excel；未提供时使用随附14列模板 |
| 输出位置 | 本地环境可指定目录；云端环境交付可下载的文件 |

内部实践资料不随技能分发。没有对应资料或证据时，H列按证据状态填“否”，I至M列留空，必要时在N列注明证据不足。

### 自然语言调用

技能安装并可被当前会话识别后，也可直接使用自然语言调用。在聊天输入框中输入以下任一表达，并提供法规名称、原文链接及相关资料：

~~~text
使用多语言监管要求法规整理skill，整理《法规名称》。
原文链接：https://……
~~~

~~~text
使用regulation-to-excel skill，整理《法规名称》。
原文链接：https://……
~~~

中文名称和技能标识均可用于指定本技能。Codex 的 $regulation-to-excel 和 Claude Code 的 /regulation-to-excel 调用方式同样适用。

### 单份法规示例

将示例中的法规名称、链接和资料位置替换为实际内容。Claude Code 使用 /regulation-to-excel 代替首行调用。

~~~text
$regulation-to-excel
整理《法规名称》。

原文链接：https://……
版本：现行合并版本
范围：正文及全部附表、附件
参考样表：当前目录的参考样表.xlsx
内部实践资料：当前目录的内部资料文件夹
输出目录：当前目录的整理结果文件夹
~~~

### 多份法规示例

~~~text
使用“多语言监管要求法规整理”技能，按以下顺序整理：

1. 《法规A》：https://……
2. 《法规B》：https://……

每份法规单独输出 Excel。
交付一份后等待确认，再开始下一份。
~~~

确认当前文件后，回复“确认，继续下一份”。需要修订或解释时，先处理当前文件，完成后再确认是否继续。

## 文件结构

技能文件夹应保留以下结构：

~~~text
regulation-to-excel/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── assets/regulation-template.xlsx
├── references/
│   ├── excel-schema.md
│   ├── source-and-translation.md
│   └── evidence-mapping.md
└── scripts/
    ├── build_excel.mjs
    └── verify_excel.py
~~~

SKILL.md 直接位于技能文件夹根目录，避免重复嵌套 regulation-to-excel/regulation-to-excel。

GitHub 仓库结构：

~~~text
regulation-skills/
├── README.md
├── LICENSE
└── regulation-to-excel/
    ├── SKILL.md
    ├── README.md
    ├── agents/
    ├── assets/
    ├── references/
    └── scripts/
~~~

## Excel 工具与检查

技能包含整理流程、空白模板、Codex 生成辅助脚本和通用只读检查脚本。运行时使用当前平台提供的表格工具。

| 运行环境 | Excel 生成方式 | 结构与一致性检查 |
|---|---|---|
| Codex，具备表格技能及 artifact-tool | 按表格技能生成，可使用 build_excel.mjs | verify_excel.py |
| Claude，具备 xlsx／表格工具 | 使用平台表格工具，保留模板及14列格式 | verify_excel.py |
| 无现成表格工具，但可运行 Python | 按 SKILL.md 使用可用 Excel 库生成 | verify_excel.py |

build_excel.mjs 依赖 Codex 环境提供的 @oai/artifact-tool。Claude 优先使用其 xlsx 技能或工作簿工具；无可用表格工具时，使用可用的 Excel 库。PDF、DOCX 等资料的读取依赖按实际文件类型准备。

### 只读检查脚本

以下操作由执行技能的模型或维护人员完成，常规使用无需手动准备检查清单。

verify_excel.py 需要 Python 3.9 或更高版本及 openpyxl。环境缺少 openpyxl 时，使用以下命令安装：

~~~shell
python -m pip install openpyxl
~~~

将路径替换为实际位置后运行：

~~~shell
python "/技能安装目录/regulation-to-excel/scripts/verify_excel.py" --workbook "/输出目录/法规名称.xlsx" --manifest "/工作目录/manifest.json" --report "/工作目录/verification.json"
~~~

manifest.json 由执行技能的模型按[数据结构说明](references/excel-schema.md)准备。检查失败后修复并重新验证，再交付 Excel。

自动检查用于核对结构、条款清单、数据一致性和留空规则，不能代替对完整原文及译文法律效果的逐条复核。

## 首次使用与验证范围

首次使用时，提供一份真实法规及官方链接，检查以下结果：

- 条款覆盖完整，原文与译文对应，编号、子项、金额、期限、起算点及例外准确。
- 内部实践摘录与资料一致，出处能定位到具体文件、章节或表行。
- H列为“否”的I至M列为空，N列仅填写必要说明。
- 不列修订沿革，不以云服务通用安全控制替代金融专项义务。
- 多份法规任务在每次交付后等待确认。

Excel 生成和结构检查流程已在 Codex 环境验证。Claude 安装说明依据官方文档编写，尚未完成 Claude 环境的实际安装和运行验证。

安装说明核对日期：2026-10-09。平台界面和技能发现目录如有变化，以官方说明及客户端实际行为为准。
