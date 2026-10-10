# Excel格式与数据结构

## 14列合同

| 列 | 字段 | 内容 |
|---|---|---|
| A | 编号 | 从1开始的行序号；与法律条号区分 |
| B | 控制域 | 原文真实章节名称，保留原文及中文；原文非英语时再补英语 |
| C | 原文编号 | 原始法律条号、标签及必要层级，保留原文及中文；原文非英语时再补英语，纯数字及符号保持原样 |
| D | 控制子域 | 只填原文明确存在的子标题，可附忠实译文；不存在时填“/”，不自行概括主题 |
| E | 原文条款 | 完整原始语言正文；仅清除版面噪声与不改变内容的换行 |
| F | 英文版条款（翻译） | 原文非英文时完整英文译文；英文原文则真正留空 |
| G | 中文简体版条款（翻译） | 完整中文译文 |
| H | 是否适用于目标环境 | 按实际目标名称显示“是否适用于<名称>”，只填“是”或“否”；证据口径见适用性规则 |
| I | 相关主体责任解读 | H是时填写，按照实际组织角色区分各主体职责 |
| J | 内部实践情况 | H是时逐字摘录资料中的目标主体实践 |
| K | 出处 | J各摘录对应文件、章节／表行和控制项 |
| L | 可使用的产品与服务 | H是时填写有据且适合的产品／服务，否则“/” |
| M | 出处 | L对应官方产品页／文档；无产品／服务则“/” |
| N | 备注 | 覆盖缺口、职责边界、必要的不适用说明及原文异常 |

H为否的I至M必须是JSON null／Excel空单元格。D不存在时的“/”规则不能推广到I至M。F隐藏设置遵照模板；随附模板默认隐藏F，但非英文法规仍需填入完整英文译文。

## 整体格式与配色

默认使用体现已确认DFSA布局的随附模板，保留14列、两行表头、合并、字体、列宽、边框和隐藏设置。保留原先黄（A至G）、紫（H至I）、绿（J至N）的表头分区；正文其他列不按适用性重新着色。只在H列设置“是”绿色（#00B050）、“否”灰色（#BFBFBF），同时保留H列自身字体和对齐。使用H列专属条件格式，使后续修改“是／否”时颜色随之更新；不得扩展到整行。

用户明确提供新样表或配色时以其要求为准，使用实际模板并调整manifest.format；不要硬套默认字体或其他列样式。责任和服务表头可按组织角色命名；H表头由目标环境名称生成。

每份法规一工作簿、一主表，不增添摘要、统计、来源或评分表；不写修订沿革。正文与附表保留原顺序。单元格超过32767字符时，沿原款／子项拆分到连续行，C保留条号及子项定位，不能截断。无编号引言或定义可使用忠实位置标签，注明不是法律条号。

## 工作数据：manifest.json

使用UTF-8 JSON，工作数据由模型根据用户说明、原始法规及当前证据准备，不要求用户手填。以下是结构示例，不能把示例法规、环境、版本或条文当作真实资料：

```json
{
  "target_environment": {
    "name": "目标环境",
    "business_context": "用户提供或可从资料确定的业务场景",
    "organization_role": "实际组织角色",
    "products_and_services": ["实际产品或服务范围"]
  },
  "source_review": {
    "url_status": "matched",
    "newer_version_found": false,
    "confirmed_version": null
  },
  "format": {
    "applicability_colors": {"是": "#00B050", "否": "#BFBFBF"}
  },
  "regulation": {
    "title": "法规名称",
    "user_url": "用户提供的链接",
    "official_landing_url": "核验后的官方页面",
    "actual_text_url": "实际提取正文的页面或文件",
    "version": "最终选定的版本标识",
    "checked_date": "YYYY-MM-DD",
    "scope": "全文或用户指定范围",
    "source_language": "英文",
    "source_note": "来源、版本、生效状态、核对日、范围和必要限制"
  },
  "inventory": ["Article 1", "Article 2"],
  "units": [
    {
      "id": "Article 1",
      "source_locator": "官方PDF第2页，第1条",
      "source_labels": {
        "control_domain": {"original": "Chapter 1", "english": null, "chinese": "第一章"},
        "clause_number": {"original": "Article 1", "english": null, "chinese": "第1条"},
        "control_subdomain": null
      },
      "original_text": "完整原文",
      "values": [1, "Chapter 1\n第一章", "Article 1\n第1条", "/", "完整原文", null, "完整中文译文", "否", null, null, null, null, null, "必要说明"]
    },
    {
      "id": "Article 2",
      "source_locator": "官方PDF第2页，第2条",
      "source_labels": {
        "control_domain": {"original": "Chapter 1", "english": null, "chinese": "第一章"},
        "clause_number": {"original": "Article 2", "english": null, "chinese": "第2条"},
        "control_subdomain": {"original": "Actual source heading", "chinese": "原文真实子标题的译文"}
      },
      "original_text": "另一条完整原文",
      "values": [2, "Chapter 1\n第一章", "Article 2\n第2条", "Actual source heading\n原文真实子标题的译文", "另一条完整原文", null, "完整中文译文", "否", null, null, null, null, null, null]
    }
  ],
  "translation_checks": [],
  "evidence": []
}
```

- target_environment.name及business_context必须有真实依据，组织角色与产品服务范围按现有资料记录；影响判断的信息不明时请求必要信息，不默认为任何厂商。H表头显示“是否适用于”加name。
- source_review.url_status可记录matched、mismatch或unreadable。未解决的不符或无法核验时不能生成完成文件；取得用户确认及可核验的正确正文后再记录matched。
- newer_version_found为布尔值。发现新版时，必须告知版本差异及生效状态并取得用户选择，再将confirmed_version记录为用户选定版本，且与regulation.version一致；用户可选择原版本。无新版时confirmed_version可以为空。对照真实用户消息，不虚构确认。候选版本及确认依据可记录在source_note／工作资料中。
- inventory必须从原始资料独立清点，不能复制输出编号来证明覆盖。
- source_labels逐项记录原文标题与编号。B、C的original及chinese必填，非英文原文还需english；显示顺序为原文、英语、中文，完全相同的值只显示一次。纯数字条号不编造语言前缀。
- D无真实子标题时control_subdomain为null，D填“/”；有标题时original必须逐字来自原文，可附英语或中文译文。原文异常编号保留并备注，不生成新的法定条号。
- values固定14格，values[4]等于original_text；F／G为完整译文。id作为稳定覆盖标识，可以不同于C的多语言显示。
- source_locator能回到原始位置。自动检查只核对标题元数据与单元格一致，不能证明标题真实存在或译文准确，仍须回看原文。
- translation_checks根据真实条文核对关键数字、起算点和例外，不复用无依据的示例检查。
- 每个H“是”至少有一条evidence，包含id、file、locator、quote及从当前资料读取的source_text；J逐字组合quote，K对应每段定位。source_text不能从J反向拼造。无内部资料时evidence为空，H按证据状态填否并在需要时说明。
- manifest用于追溯，不默认交付。已有旧manifest需按真实来源和用户消息补齐新增字段，不能自动假定曾完成核验或确认。

## 辅助脚本运行

安装与平台差异见[使用说明](../README.md)。Node生成步骤适用于具备artifact-tool的Codex；Claude使用可用xlsx／表格工具，或在不可用时使用可用Excel库。两者遵守相同数据合同和语义复核；具备Python及openpyxl时均可运行只读验证脚本。

1. 使用当前平台表格skill及运行时依赖，不固定用户、操作系统或旧版本路径。复制scripts/build_excel.mjs到本次可写工作目录，在该目录链接平台允许的node_modules；按表格skill记录生成操作。
2. 调用 `node build_excel.mjs --manifest manifest.json --template <本次样表.xlsx> --output <用户目录>/法规名称.xlsx --preview-dir <工作目录>/previews`。无新样表时使用随附模板。脚本保留模板样式，超出已有模板范围时沿最后一个正文样式行延展，只对H列设置适用性颜色。新样表的特殊分区／来源位置及可见F列若超出现有脚本能力，应按实际模板调整生成与验证。
3. 调用 `python <skill目录>/scripts/verify_excel.py --workbook <输出.xlsx> --manifest manifest.json --template <本次样表.xlsx> --report <工作目录>/verification.json`。传入样表检查列宽、隐藏设置及H列以外的配色保留。
4. 查看渲染的表头、适用与不适用行、长条、真实子标题和末行。检查只是机械校验，URL身份、用户确认、完整原文、翻译及证据真实性仍须逐项复核，全部完成后交付。
