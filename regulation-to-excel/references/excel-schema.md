# Excel格式与数据结构

## 14列合同

| 列 | 字段 | 内容 |
|---|---|---|
| A | 编号 | 从1开始的行序号；与法律条号区分 |
| B | 控制域 | 原文真实章节名称，提供当地语言、英语和中文 |
| C | 原文编号 | 原始法律条号、标签及必要层级，提供当地语言、英语和中文；纯数字及符号保持原样 |
| D | 控制子域 | 只填原文明确存在的子标题及当地语言、英语和中文；不存在时填“/”，不自行概括主题 |
| E | 当地语言条款 | 优先同版当地语言官方原文；无法取得时为译自英文的完整非官方译文，明确标注身份 |
| F | 英文版条款 | 完整英语内容；英文为实际来源时保留原文，否则使用核验后的同版英译或标明非官方自译；不得留空 |
| G | 中文简体版条款（翻译） | 完整中文译文 |
| H | 是否适用于目标环境 | 按实际目标名称显示“是否适用于<名称>”，只填“是”或“否”；证据口径见适用性规则 |
| I | 相关主体责任解读 | H是时填写，按照实际组织角色区分各主体职责 |
| J | 内部实践情况 | H是时逐字摘录资料中的目标主体实践 |
| K | 出处 | J各摘录对应文件、章节／表行和控制项 |
| L | 可使用的产品与服务 | H是时填写有据且适合的产品／服务，否则“/” |
| M | 出处 | L对应官方产品页／文档；无产品／服务则“/” |
| N | 备注 | 覆盖缺口、职责边界、必要的不适用说明及原文异常 |

H为否的I至M必须是JSON null／Excel空单元格。D不存在时的“/”规则不能推广到I至M。F隐藏设置遵照模板；随附模板默认隐藏F，但E／F／G无论来源语言为何都必须填完整内容，隐藏不代表可省略。

## 整体格式与配色

默认使用体现已确认DFSA布局的随附模板，保留14列、两行表头、合并、字体、列宽、边框和隐藏设置。保留原先黄（A至G）、紫（H至I）、绿（J至N）的表头分区；正文其他列不按适用性重新着色。只在H列设置“是”绿色（#00B050）、“否”灰色（#BFBFBF），同时保留H列自身字体和对齐。使用H列专属条件格式，使后续修改“是／否”时颜色随之更新；不得扩展到整行。

用户明确提供新样表或配色时以其要求为准，使用实际模板并调整manifest.format；不要硬套默认字体或其他列样式。责任和服务表头可按组织角色命名；H表头由目标环境名称生成。

每份法规一工作簿、一主表，不增添摘要、统计、来源或评分表；不写修订沿革。正文与附表保留原顺序。单元格超过32767字符时，沿原款／子项拆分到连续行，C保留条号及子项定位，不能截断。无编号引言或定义可使用忠实位置标签，注明不是法律条号。

## 行粒度与子项合并

在已确认的整理范围内，默认以原文独立条款为一行。同一条款内的引导句、a）、b）、c）、d）等子项及附属说明放在同一行，按原顺序保留换行、编号、全部原文及完整译文。例如11.1.1的子项合为11.1.1一行，12.2的子项合为12.2另一行；不得把这两个独立条款合在一起。独立编号且具有自身义务的条款不因同属一章而合并。附表或附件按实际独立内容单元判断。

独立来源清单仍需逐项记录子项及定位，再映射到合并后的输出unit；inventory记录对应输出单元的覆盖标识，同时在工作资料保留子项到unit的对应关系，不能通过合并掩盖漏项。J／K保留全部相关摘录及出处，I／N区分各子项的支持范围和缺口；不能把某一子项有证据写成全部子项已覆盖。

仅当任一单元格超过32767字符，或用户明确要求拆分时，才沿原文层级拆为连续行。C保留父条号及实际子项定位，并在N注明容量拆分；不得擅自删减或改写选定范围的内容来避免拆分；经确认的部分摘录规则见下文。

## 适用性说明及部分摘录的呈现

法规开头的适用对象、范围、条件及例外，以及理解选定条款所必需的定义，按原顺序独立纳入数据单元，E／F／G依原文语言填写完整原文及译文。只整理部分技术要求也须保留这些必要背景，不新增工作表或改变14列结构。

超长或混合条款只有取得用户对具体摘录范围的确认后，才能只整理相关款项。C保留原父条号及实际子项，N注明“摘录”及选定款项；E／F／G完整对应选定内容，并保留限定其含义的引导句、条件、职责、例外及必要结尾。I／J／N的责任与实践映射限定于该范围，不能以局部对应声称整条已覆盖。未确认缩减范围时保留完整条款，容量不足只作连续分行。

regulation.scope和source_note应准确注明部分整理及摘录范围；真实确认依据和原文定位保留在工作资料中。inventory从原始资料独立清点后对应已确认的输出范围，包含必要适用性说明及定义；不得以删去清单项目来掩盖漏项。original_text为当前unit实际来源中选定范围的完整原文；当地语言官方原文模式下values[4]与其一致，英文回译模式下values[5]与其一致；该一致性检查不能证明用户已确认摘录或范围完整，仍须回看原文及用户消息。

## 工作数据：manifest.json

使用UTF-8 JSON，工作数据由模型根据用户说明、原始法规及当前证据准备，不要求用户手填。以下是结构示例，不能把示例法规、环境、版本或条文当作真实资料：

```json
{
  "target_environment": {
    "name": "目标环境",
    "business_context": "用户提供或可从资料确定的业务场景",
    "organization_role": "实际组织角色",
    "products_and_services": [
      "实际产品或服务范围"
    ]
  },
  "source_review": {
    "url_status": "matched",
    "newer_version_found": false,
    "confirmed_version": null
  },
  "format": {
    "applicability_colors": {
      "是": "#00B050",
      "否": "#BFBFBF"
    }
  },
  "regulation": {
    "title": "法规名称",
    "user_url": "用户提供的链接",
    "official_landing_url": "核验后的官方页面",
    "actual_text_url": "实际提取正文的页面或文件",
    "version": "最终选定的版本标识",
    "checked_date": "YYYY-MM-DD",
    "scope": "全文或用户指定范围",
    "source_language": "英语",
    "source_note": "来源、版本、生效状态、核对日、范围和必要限制"
  },
  "inventory": [
    "Article 1",
    "Article 2"
  ],
  "units": [
    {
      "id": "Article 1",
      "source_locator": "官方PDF第2页，第1条",
      "source_labels": {
        "control_domain": {"original": "Chapter 1", "english": "Chapter 1", "chinese": "第一章", "local": "Chapter 1"},
        "clause_number": {"original": "Article 1", "english": "Article 1", "chinese": "第1条", "local": "Article 1"},
        "control_subdomain": null
      },
      "original_text": "完整原文",
      "values": [1, "Chapter 1\n第一章", "Article 1\n第1条", "/", "完整原文", "完整原文", "完整中文译文", "否", null, null, null, null, null, "必要说明"]
    },
    {
      "id": "Article 2",
      "source_locator": "官方PDF第2页，第2条",
      "source_labels": {
        "control_domain": {"original": "Chapter 1", "english": "Chapter 1", "chinese": "第一章", "local": "Chapter 1"},
        "clause_number": {"original": "Article 2", "english": "Article 2", "chinese": "第2条", "local": "Article 2"},
        "control_subdomain": {"original": "Actual source heading", "chinese": "原文真实子标题的译文", "local": "Actual source heading", "english": "Actual source heading"}
      },
      "original_text": "另一条完整原文",
      "values": [2, "Chapter 1\n第一章", "Article 2\n第2条", "Actual source heading\n原文真实子标题的译文", "另一条完整原文", "另一条完整原文", "完整中文译文", "否", null, null, null, null, null, null]
    }
  ],
  "translation_checks": [],
  "evidence": [],
  "language_plan": {
    "local_language": "英语",
    "local_text_kind": "official_original",
    "local_source_search_note": "已核验本示例的当地正式语言为英语；实际任务记录真实检索入口、结果和日期"
  }
}
```

- target_environment.name及business_context必须有真实依据，组织角色与产品服务范围按现有资料记录；影响判断的信息不明时请求必要信息，不默认为任何厂商。H表头显示“是否适用于”加name。
- source_review.url_status可记录matched、mismatch或unreadable。未解决的不符或无法核验时不能生成完成文件；取得用户确认及可核验的正确正文后再记录matched。
- newer_version_found为布尔值。发现新版时，必须告知版本差异及生效状态并取得用户选择，再将confirmed_version记录为用户选定版本，且与regulation.version一致；用户可选择原版本。无新版时confirmed_version可以为空。对照真实用户消息，不虚构确认。候选版本及确认依据可记录在source_note／工作资料中。
- inventory必须从原始资料独立清点，不能复制输出编号来证明覆盖。
- language_plan必填：local_language为明确的当地语言名称；local_text_kind为official_original或translated_from_english；local_source_search_note记录真实检索入口、结果及日期。official_original模式的source_language与local_language使用同一名称；translated_from_english模式要求source_language为英语，并在source_note包含“非官方译文，译自英文”。该模式只能在已检索仍无法取得同版当地官方文本时使用。
- source_labels逐项记录真实来源中的original及local、english、chinese。B、C及非空D均需三语；显示顺序为当地语言、英语、中文，完全相同的值只显示一次。original与实际来源语言对应的local或english一致；不得把生成的当地译文填为original。纯数字条号三字段可相同，不编造语言前缀。
- D无真实子标题时control_subdomain为null，D填“/”；有标题时original必须逐字来自实际来源，local、english、chinese均需填写。原文异常编号保留并备注，不生成新的法定条号。
- values固定14格，E／F／G依次是完整当地语言、英语及简体中文。original_text匹配实际来源栏：official_original为E，translated_from_english为F；当地语言为英语时E和F仍均填写且一致。id作为稳定覆盖标识，可以不同于C的多语言显示。
- source_locator能回到原始位置。自动检查只核对标题元数据与单元格一致，不能证明标题真实存在或译文准确，仍须回看原文。
- translation_checks可检查E、F或G，根据真实条文核对关键数字、起算点和例外，不复用无依据的示例检查。
- E2动态标注当地语言及“原文”或“非官方译文，译自英文”；F2在回译模式或当地语言本为英语时标为英文原文，否则标为英文译文。旧manifest需按真实来源补齐语言计划与三语内容，不能把旧的空F或英语E冒充当地语言。
- 每个H“是”至少有一条evidence，包含id、file、locator、quote及从当前资料读取的source_text；J逐字组合quote，K对应每段定位。source_text不能从J反向拼造。无内部资料时evidence为空，H按证据状态填否并在需要时说明。
- manifest用于追溯，不默认交付。已有旧manifest需按真实来源和用户消息补齐新增字段，不能自动假定曾完成核验或确认。

## 辅助脚本运行

安装与平台差异见[仓库使用说明](https://github.com/xiaokeai55/regulation-skills#readme)。Node生成步骤适用于具备artifact-tool的Codex；Claude使用可用xlsx／表格工具，或在不可用时使用可用Excel库。两者遵守相同数据合同和语义复核；具备Python及openpyxl时均可运行只读验证脚本。

1. 使用当前平台表格skill及运行时依赖，不固定用户、操作系统或旧版本路径。将scripts/build_excel.mjs及同目录prepare_source_note.py复制到本次可写工作目录，在该目录链接平台允许的node_modules；按表格skill记录生成操作。
2. 调用 `node build_excel.mjs --manifest manifest.json --template <本次样表.xlsx> --output <用户目录>/法规名称.xlsx --preview-dir <工作目录>/previews --python <当前平台Python路径>`。无新样表时使用随附模板。脚本保留模板样式，超出已有模板范围时沿最后一个正文样式行延展，只对H列设置适用性颜色。生成脚本需Python 3.9以上的标准库处理已有E3来源备注：在临时样表中更新已有备注后导入，没有备注时才新增；保留其他备注，不支持叠加线程批注，发现冲突时停止并按实际样表调整。临时样表用完自动清理。新样表的特殊分区／来源位置及可见F列若超出现有脚本能力，应按实际模板调整生成与验证。
3. 调用 `python <skill目录>/scripts/verify_excel.py --workbook <输出.xlsx> --manifest manifest.json --template <本次样表.xlsx> --report <工作目录>/verification.json`。传入样表检查列宽、隐藏设置及H列以外的配色保留；同时检查ZIP、XML、内部关系目标及重复备注引用，损坏包以失败报告返回。结构检查不是Excel正常打开的证明。
4. 可用Excel时，正常模式只读打开最终保存文件，确认无修复提示后关闭且不保存；不可用时在交付说明中明确该项未验证。出现修复提示时回到生成环节修正并重新检查，不交付仍需修复的文件。
5. 查看渲染的表头、适用与不适用行、长条、真实子标题和末行。检查只是机械校验，URL身份、用户确认、完整原文、翻译及证据真实性仍须逐项复核，全部完成后交付。
