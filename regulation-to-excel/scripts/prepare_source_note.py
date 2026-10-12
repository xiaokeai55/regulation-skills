#!/usr/bin/env python3
"""Update an existing E3 source note in a temporary template without restyling it.

Artifact Tool's documented note API exposes addition but not updating imported
notes. This helper changes only the existing note XML; all other ZIP members are
copied unchanged. A missing note is left for the builder to add through its API.
"""
import argparse
import json
import posixpath
from pathlib import Path
from urllib.parse import unquote
from xml.etree import ElementTree as ET
from zipfile import ZipFile

MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
DOC_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

def target_part(owner, target):
    return posixpath.normpath(posixpath.join(posixpath.dirname(owner), unquote(target))).lstrip('/')

def prepare(template, output, source_note):
    with ZipFile(template) as package:
        names = package.namelist()
        if len(names) != len(set(names)) or package.testzip() is not None:
            raise ValueError('Template ZIP is corrupt or has duplicate members')
        workbook = ET.fromstring(package.read('xl/workbook.xml'))
        first = workbook.find(f'{{{MAIN}}}sheets/{{{MAIN}}}sheet')
        if first is None:
            raise ValueError('Template has no worksheet')
        links = ET.fromstring(package.read('xl/_rels/workbook.xml.rels'))
        relationship = next(r for r in links if r.get('Id') == first.get(f'{{{DOC_REL}}}id'))
        sheet = target_part('xl/workbook.xml', relationship.get('Target'))
        rel_path = posixpath.join(posixpath.dirname(sheet), '_rels', posixpath.basename(sheet) + '.rels')
        relations = ET.fromstring(package.read(rel_path)) if rel_path in names else []
        note_parts = []
        matches = []
        for relation in relations:
            kind = relation.get('Type', '').rsplit('/', 1)[-1]
            if kind not in {'comments', 'threadedComment'}:
                continue
            part = target_part(sheet, relation.get('Target'))
            root = ET.fromstring(package.read(part))
            if kind == 'threadedComment':
                if any(c.get('ref', '').replace('$', '').upper() == 'E3' for c in root):
                    raise ValueError('E3 has a threaded comment; update it with a supported comment API instead of adding a note')
                continue
            note_parts.append(part)
            for comment in root.findall(f'{{{MAIN}}}commentList/{{{MAIN}}}comment'):
                if comment.get('ref', '').replace('$', '').upper() == 'E3':
                    matches.append((part, root, comment))
        if len(note_parts) > 1 or len(matches) > 1:
            raise ValueError('Template has duplicate comment parts or E3 notes; repair the template before generation')
        if not matches:
            return {'template': str(Path(template).resolve()), 'has_source_note': False}
        part, root, comment = matches[0]
        old = comment.find(f'{{{MAIN}}}text')
        if old is not None:
            comment.remove(old)
        text = ET.SubElement(comment, f'{{{MAIN}}}text')
        run = ET.SubElement(text, f'{{{MAIN}}}t')
        run.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        run.text = source_note
        updated = ET.tostring(root, encoding='utf-8', xml_declaration=True)
        if Path(template).resolve() == Path(output).resolve():
            raise ValueError('Temporary output must differ from the original template')
        with ZipFile(output, 'w') as dest:
            for member in package.infolist():
                dest.writestr(member, updated if member.filename == part else package.read(member))
    return {'template': str(Path(output).resolve()), 'has_source_note': True}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--template', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    data = json.loads(Path(args.manifest).read_text(encoding='utf-8-sig'))
    source_note = data['regulation']['source_note']
    if not isinstance(source_note, str) or not source_note.strip():
        raise ValueError('A nonempty source note is required')
    print(json.dumps(prepare(args.template, args.output, source_note), ensure_ascii=False))

if __name__ == '__main__':
    main()
