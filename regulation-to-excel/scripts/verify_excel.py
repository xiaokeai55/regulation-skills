#!/usr/bin/env python3
"""Read-only checks for a regulation workbook; semantic/source review remains mandatory."""
import argparse
import json
import re
from collections import defaultdict
from pathlib import Path
from openpyxl import load_workbook

ENGLISH = {"en", "english", "英文", "英语"}
ERRORS = {"#REF!", "#DIV/0!", "#VALUE!", "#NAME?", "#N/A", "#NUM!", "#NULL!", "#SPILL!", "#CALC!"}
MERGES = {"A1:A2", "B1:B2", "C1:G1", "H1:H2", "I1:I2", "J1:J2", "K1:K2", "L1:L2", "M1:M2", "N1:N2"}

def meaningful(value):
    return isinstance(value, str) and bool(value.strip())

def labels(text):
    return re.findall(r"(?m)^\s*((?:[a-z]|[ivx]+|[0-9]+)[.)]|\([a-z]\)|[①②③④⑤⑥⑦⑧⑨⑩])(?:\s|$)", text)

def check_manifest(data):
    failures = []
    def need(ok, message):
        if not ok:
            failures.append(message)
    reg = data.get("regulation", {})
    for name in ["title", "user_url", "official_landing_url", "actual_text_url", "version", "checked_date", "scope", "source_language", "source_note"]:
        need(meaningful(reg.get(name)), "来源字段缺失：" + name)
    inventory = data.get("inventory", [])
    units = data.get("units", [])
    ids = [u.get("id") for u in units]
    need(bool(inventory) and all(meaningful(x) for x in inventory), "原文清单为空或含无效编号")
    need(len(inventory) == len(set(inventory)), "原文清单存在重复编号")
    need(len(ids) == len(set(ids)), "整理项存在重复编号")
    need(inventory == ids, "原文清单与输出编号／顺序不一致")
    evidence = defaultdict(list)
    for item in data.get("evidence", []):
        evidence[item.get("id")].append(item)
        need(item.get("id") in ids, "证据引用不存在的条款：" + str(item.get("id")))
        for field in ["file", "locator", "quote", "source_text"]:
            need(meaningful(item.get(field)), "证据字段缺失：" + str(item.get("id")) + "/" + field)
        if meaningful(item.get("quote")) and meaningful(item.get("source_text")):
            need(item["quote"] in item["source_text"], "摘录不在读取的实践原文中：" + str(item.get("id")))
    is_english = str(reg.get("source_language", "")).lower() in ENGLISH
    for index, unit in enumerate(units, 1):
        uid = str(unit.get("id"))
        row = unit.get("values", [])
        need(meaningful(unit.get("source_locator")), uid + "无原文位置")
        need(meaningful(unit.get("original_text")), uid + "无原文")
        need(isinstance(row, list) and len(row) == 14, uid + "不是14列")
        if not isinstance(row, list) or len(row) != 14:
            continue
        need(row[0] == index, uid + "A序号错误")
        need(meaningful(row[1]) and meaningful(row[2]) and meaningful(row[3]), uid + "章节、编号或主题缺失")
        need(row[4] == unit.get("original_text"), uid + "E与原文清单不同")
        need(meaningful(row[6]), uid + "中文译文缺失")
        need(row[5] is None if is_english else meaningful(row[5]), uid + "英文译文缺失或英文原文F未留空")
        need(row[7] in ["是", "否"], uid + "H不是是／否")
        for j, value in enumerate(row):
            need(value is None or isinstance(value, (str, int, float)), uid + "含不支持的单元格值")
            need(not isinstance(value, str) or len(value) <= 32767, uid + "单元格超Excel字符上限：" + str(j + 1))
        if row[7] == "否":
            need(all(value is None for value in row[8:13]), uid + "否行I至M不是真正空白")
            need(not evidence.get(unit.get("id")), uid + "否行包含实践证据")
        elif row[7] == "是":
            need(all(meaningful(value) for value in row[8:14]), uid + "是行I至N不完整")
            blocks = evidence.get(unit.get("id"), [])
            need(bool(blocks), uid + "是行没有可追溯证据")
            if blocks and all(meaningful(b.get("quote")) for b in blocks):
                numbered = "\n\n".join(f"{n}. {b['quote']}" for n, b in enumerate(blocks, 1))
                plain = "\n\n".join(b["quote"] for b in blocks)
                need(row[9] in [numbered, plain], uid + "J并非证据摘录的完整组合")
                for block in blocks:
                    need(block.get("file", "") in (row[10] or ""), uid + "K缺少证据文件")
                    need(block.get("locator", "") in (row[10] or ""), uid + "K缺少证据定位")
            need((row[11] == "/") == (row[12] == "/"), uid + "L／M无服务标记不一致")
        for col in [5, 6]:
            if meaningful(row[col]):
                need(labels(row[4]) == labels(row[col]), uid + "原文与译文子项标记不同：" + chr(65 + col))
                need(row[4].count("•") == row[col].count("•"), uid + "原文与译文列表项数量不同：" + chr(65 + col))
    lookup = {u.get("id"): u for u in units}
    for item in data.get("translation_checks", []):
        uid = item.get("id")
        column = item.get("column")
        need(uid in lookup and column in ["F", "G"], "无效关键译文检查")
        if uid not in lookup or column not in ["F", "G"]:
            continue
        text = lookup[uid]["values"][ord(column) - 65] or ""
        for expected in item.get("contains", []):
            need(expected in text, str(uid) + "关键译文表达缺失：" + expected)
    return failures

def verify_workbook(data, path):
    failures = check_manifest(data)
    def need(ok, message):
        if not ok:
            failures.append(message)
    workbook = load_workbook(path, data_only=False)
    need(len(workbook.worksheets) == 1, "默认14列交付应只有一张主表")
    sheet = workbook.worksheets[0]
    need(sheet.max_column == 14, "保存文件列数不是14")
    need({str(m) for m in sheet.merged_cells.ranges} == MERGES, "两行表头合并与合同不同")
    need(sheet["A1"].value == "编号" and sheet["H1"].value == "是否适用于腾讯云", "模板主要字段错误")
    units = data.get("units", [])
    for offset, unit in enumerate(units, 3):
        expected = tuple(unit.get("values", []))
        actual = tuple(sheet.cell(offset, c).value for c in range(1, 15))
        need(actual == expected, str(unit.get("id")) + "导出后单元格错位或改变")
        for col in range(1, 15):
            cell = sheet.cell(offset, col)
            need(cell.data_type != "f", cell.coordinate + "出现非预期公式")
            need(cell.data_type != "e", cell.coordinate + "出现Excel错误")
            need(bool(cell.alignment.wrap_text), cell.coordinate + "未自动换行")
        height = sheet.row_dimensions[offset].height
        need(height is None or height <= 409.5, str(offset) + "行高超过Excel上限")
    for rr in sheet.iter_rows(min_row=len(units) + 3):
        need(all(c.value is None for c in rr), "表尾残留其他法规内容：" + str(rr[0].row))
    note = sheet["E3"].comment
    need(note is not None and data.get("regulation", {}).get("source_note", "") in note.text, "首条原文缺来源备注或备注错位")
    return {"passed": not failures, "rows": len(units), "failures": failures, "limitations": "仅机械校验；不替代对未加工法规全文、翻译法律效果及当前证据来源的逐条复核。"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workbook", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--report")
    args = parser.parse_args()
    data = json.loads(Path(args.manifest).read_text(encoding="utf-8-sig"))
    report = verify_workbook(data, args.workbook)
    if args.report:
        Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(report, ensure_ascii=False))
    raise SystemExit(0 if report["passed"] else 1)

if __name__ == "__main__":
    main()
