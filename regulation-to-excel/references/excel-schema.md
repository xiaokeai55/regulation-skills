# Excel格式与数据结构

## 14列合同

| 列 | 字段 | 内容 |
|---|---|---|
| A | 编号 | 从1开始的行序号；与法律条号区分 |
| B | 控制域 | 对应原章节；按参考样表保留原语／英语／中文章名 |
| C | 原文编号 | 原始法律条号及必要层级；样表要求时附英中译名 |
| D | 控制子域 | 忠实描述本条主题；不得生成不存在的法定条号 |
| E | 原文条款 | 完整原始语言正文；仅清除版面噪声与不改变内容的换行 |
| F | 英文版条款（翻译） | 原文非英文时完整英文译文；英文原文则真正留空 |
| G | 中文简体版条款（翻译） | 完整中文译文 |
| H | 是否适用于腾讯云 | 只填“是”或“否” |
| I | 客户责任解读 | H是时填写，区分客户与云服务商责任 |
| J | 内部实践情况 | H是时逐字摘录资料中的服务商实践 |
| K | 出处 | J各摘录对应文件、章节／表行和控制项 |
| L | 客户可以使用的服务 | H是时填写有据且适合的服务，否则“/” |
| M | 出处 | L对应官方产品页／文档；无服务则“/” |
| N | 备注 | 覆盖缺口、职责边界、必要的不适用说明及原文异常 |

H为否的I至M是JSON null／Excel空单元格。F隐藏设置遵照模板；本项目空白模板默认隐藏F，但非英文法规仍需填入完整英文译文。

模板沿用原先黄（A至G）、紫（H至I）、绿（J至N）分区及两行表头。不得在表格中添加修订沿革。每份法规一工作簿、一主表；保留正文和附表原顺序。不擅自添加摘要、统计、来源或评分表。

条款单元格超32767字符时，将同一条按原款／子项拆分到连续行，C写明原条号及子项定位，不能截断。正文正常一条一行；复杂条文可按法律结构拆分，但清单必须对应同一拆分颗粒度。无编号引言及定义可使用位置标签，如“附表1—术语名”，并说明不是法律条号。

## 工作数据：manifest.json

使用UTF-8 JSON。结构如下（实际数据不要保留示例内容）：

```json
{
  "regulation": {
    "title": "法规名称",
    "user_url": "用户提供的链接",
    "official_landing_url": "核验后的官方页面",
    "actual_text_url": "实际提取全文的页面或文件",
    "version": "官方版本标识",
    "checked_date": "YYYY-MM-DD",
    "scope": "全文或用户指定的条款范围",
    "source_language": "英文",
    "source_note": "原文来源、版本及生效日、核对日、范围、译文及映射说明"
  },
  "inventory": ["Article 1", "Article 2"],
  "units": [
    {
      "id": "Article 1",
      "source_locator": "官方PDF第2页，第1条",
      "original_text": "完整原文",
      "values": [1, "第一章", "Article 1", "主题", "完整原文", null, "完整中文译文", "否", null, null, null, null, null, "必要说明"]
    },
    {
      "id": "Article 2",
      "source_locator": "官方PDF第2页，第2条",
      "original_text": "另一条完整原文",
      "values": [2, "第一章", "Article 2", "主题", "另一条完整原文", null, "完整中文译文", "否", null, null, null, null, null, null]
    }
  ],
  "translation_checks": [
    {"id": "Article 1", "column": "G", "contains": ["48小时", "超过", "3,500"]}
  ],
  "evidence": [
    {
      "id": "Article 2",
      "file": "内部指南.docx",
      "locator": "表2第5行",
      "quote": "实际逐字摘录",
      "source_text": "从当前源文件实际读取的对应实践全文"
    }
  ]
}
```

- inventory必须先从完整原文独立清点，而不是复制已经整理好的输出编号来宣称覆盖完整。
- units每项values固定14格。values[4]必须等于original_text；完整译文在values[5]／values[6]。id是稳定的覆盖标识，可以不同于C列多语言显示，但C必须包含原编号。
- source_locator须能让复核者回到原始位置；不能只写法规名称。
- translation_checks对全部关键数字／起算点／例外设定需要出现的表达。示例检查只有在原文确实包含相关义务时才可使用；不能把示例数字写进其他法规。
- evidence每项代表一个实际实践摘录。source_text从当前文件读取，不从quote或J反向拼造。每个“是”至少有一项；每段J和K必须关联证据。没有内部资料时evidence为空且H均为否。
- 内部manifest不默认交付；它用于追溯和校对。脚本校验只是机械检查，仍须与未加工的全文、分页、表格逐项核对。

## 辅助脚本运行

安装与平台差异见[使用说明](../README.md)。以下Node生成步骤适用于具有artifact-tool的Codex环境；Claude环境使用自身xlsx／表格工具，或在这些工具不可用时使用可用Excel库，按同一manifest与模板生成。Claude不必运行build_excel.mjs；只读验证脚本可在具备Python和openpyxl的任一环境使用。

使用当前环境的表格skill及其运行时依赖；不要固定为某个用户、操作系统或旧版本绝对路径。

1. 将scripts/build_excel.mjs复制到本次任务可写工作目录，按表格skill在该目录链接其允许的node_modules。读取适用API说明，首次创建／编辑前按表格skill记录生成操作。
2. 调用 `node build_excel.mjs --manifest manifest.json --template <skill目录>/assets/regulation-template.xlsx --output <用户目录>/法规名称.xlsx --preview-dir <工作目录>/previews`。用户另有参考模板时用其路径；脚本默认采用随附模板的字体、对齐与行高规则，且只支持本14列合同。新模板有不同字体、可见F列或既有来源位置时，应相应调整生成及验证脚本，保持用户模板优先；不要强制套用默认样式。
3. 调用 `python <skill目录>/scripts/verify_excel.py --workbook <输出.xlsx> --manifest manifest.json --report <工作目录>/verification.json`。
4. 查看脚本渲染的图片。预览仅是代表性范围，实际长条和附表仍须检查。只有全部适用检查通过，且语义复核完成后才能交付。
