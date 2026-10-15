"""Validate per-column provenance and derive truthful language headers."""
import argparse
import json
from pathlib import Path

KINDS = {'original': '原文', 'official_translation': '官方译文',
         'unofficial_translation': '非官方译文'}

def language_headers(data):
    plan = data.get('language_plan', {})
    records = plan.get('columns', {})
    headers = {}
    note = data.get('regulation', {}).get('source_note', '')
    fallback = plan.get('local_text_kind') == 'translated_from_english'
    for column, name in [('E', str(plan.get('local_language', '')) + '版条款'),
                         ('F', '英文版条款'), ('G', '中文简体版条款')]:
        record = records.get(column, {})
        kind = record.get('kind')
        if kind not in KINDS or any(not isinstance(record.get(k), str) or not record[k].strip()
                                    for k in ['source', 'basis']):
            raise ValueError(column + '须记录原文／官方译文／非官方译文身份、来源及依据')
        conversion = record.get('script_conversion')
        if conversion not in ['none', 'traditional_to_simplified']:
            raise ValueError(column + '须明确是否进行了繁转简')
        if conversion != 'none' and column != 'G':
            raise ValueError('繁转简标记仅用于G；E保留当地来源文字')
        label = KINDS[kind]
        if conversion == 'traditional_to_simplified':
            label += '，繁转简，非官方转换'
        if column == 'E':
            if kind != ('unofficial_translation' if fallback else 'original'):
                raise ValueError('E来源身份与当地语言来源模式冲突')
            if fallback:
                label += '，译自英文'
        headers[column] = name + '（' + label + '）'
        disclosure = column + '：' + label + '；来源：' + record['source'] + '；依据：' + record['basis']
        if disclosure not in note:
            raise ValueError('来源备注缺少三语来源披露：' + disclosure)
    # Simplified Chinese original repeated in E/G must remain identical.
    if (records['E']['kind'] == records['G']['kind'] == 'original'
            and records['G']['script_conversion'] == 'none'
            and str(plan.get('local_language', '')).lower() in ['中文', '简体中文', '中文简体', 'zh', 'zh-cn', 'zh-hans']):
        for unit in data.get('units', []):
            if unit['values'][4] != unit['values'][6]:
                raise ValueError('当地简体中文原文在E/G必须一致')
    return headers

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', required=True)
    args = parser.parse_args()
    print(json.dumps(language_headers(json.loads(Path(args.manifest).read_text(encoding='utf-8-sig'))), ensure_ascii=False))
