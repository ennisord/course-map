import csv
import json
import re

INPUT_CSV = r"C:\Users\rexth\courses\parsing\ucalgary-economics.csv"
OUTPUT_JSON = "courses_parsed.json"

CORE_IDS = {
    ("ECON", 201), ("ECON", 203), ("ECON", 301), ("ECON", 303),
    ("ECON", 357), ("ECON", 359), ("ECON", 395),
    ("STAT", 213), ("STAT", 217), ("MATH", 249),
}

HONOURS_IDS = {
    ("MATH", 211),
    ("ECON", 387), ("ECON", 389),
    ("ECON", 495), ("ECON", 497),
    ("ECON", 557), ("ECON", 559),
}

# Maps spelled-out dept names in prereq text to their code
DEPT_NAME_MAP = {
    "ECONOMICS": "ECON",
    "ECON": "ECON",
    "STATISTICS": "STAT",
    "STAT": "STAT",
    "MATHEMATICS": "MATH",
    "MATH": "MATH",
    "ENGINEERING": "ENGG",
    "ENGG": "ENGG",
}

def find_col(fieldnames, keywords):
    for name in fieldnames:
        if any(k in name.lower() for k in keywords):
            return name
    return None

def infer_year(course_id):
    hundreds = course_id // 100
    return {2: 1, 3: 2, 4: 3, 5: 4}.get(hundreds, 3)

def clean_dept(subject_field, subject_code_field):
    # Prefer the dedicated subject code column (always clean e.g. "ECON")
    code = (subject_code_field or "").strip().upper()
    if re.match(r'^[A-Z]{3,4}$', code):
        return code
    # Fall back to extracting from the subject field
    raw = (subject_field or "").upper()
    m = re.search(r'\b([A-Z]{3,4})\b', raw)
    return m.group(1) if m else ""

def extract_prereqs(desc):
    if not desc:
        return []

    # Normalize whitespace so \n\n doesn't break matching
    desc = re.sub(r'\s+', ' ', desc)

    # Strip antireq and coreq sentences before prereq parsing
    desc = re.sub(r'Antireq(?:uisite)?s?\s*\([^)]*\)?\s*:', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'Coreq(?:uisite)?s?\s*\([^)]*\)?\s*:', '', desc, flags=re.IGNORECASE)

    m = re.search(r'Prereq(?:uisite)?s?\s*\([^)]*\)?\s*:\s*([^.]*)', desc, re.IGNORECASE)
    if not m:
        return []

    text = m.group(1).strip()
    if not text:
        return []

    # Flatten AND/OR separators
    text = re.sub(r'\band\b|\bor\b', ',', text, flags=re.IGNORECASE)
    # Strip filler phrases like "3 units from"
    text = re.sub(r'\d+\s+units?\s+from\b', ',', text, flags=re.IGNORECASE)
    text = text.replace(';', ',')

    chunks = [c.strip() for c in text.split(',')]

    seen = set()
    result = []
    last_dept = None

    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue

        # Try "DeptName 301" or "DEPT 301"
        m2 = re.match(r'^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d{3})$', chunk)
        if m2:
            raw_dept = m2.group(1).upper().strip()
            dept = DEPT_NAME_MAP.get(raw_dept) or DEPT_NAME_MAP.get(raw_dept.split()[0])
            num = int(m2.group(2))
            if dept:
                last_dept = dept
            else:
                continue
        else:
            # Bare number — inherit last seen dept
            m3 = re.match(r'^(\d{3})$', chunk)
            if m3 and last_dept:
                dept = last_dept
                num = int(m3.group(1))
            else:
                continue

        val = num if dept == "ECON" else f"{dept} {num}"
        if val not in seen:
            seen.add(val)
            result.append(val)

    return result

courses = []

with open(INPUT_CSV, newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)

    COL_SUBJECT      = find_col(reader.fieldnames, ["subject"])
    COL_SUBJECT_CODE = find_col(reader.fieldnames, ["subject code", "code"])
    COL_ID           = find_col(reader.fieldnames, ["catalog", "number"])
    COL_NAME         = find_col(reader.fieldnames, ["title", "name"])
    COL_DESC         = find_col(reader.fieldnames, ["description", "desc"])

    for row in reader:
        raw_id = str(row.get(COL_ID, ""))
        id_match = re.search(r'\d{3}', raw_id)
        if not id_match:
            continue

        course_id = int(id_match.group())

        dept = clean_dept(row.get(COL_SUBJECT), row.get(COL_SUBJECT_CODE))
        if not dept:
            continue

        name = (row.get(COL_NAME) or "").strip()
        desc = (row.get(COL_DESC) or "").strip()
        prereqs = extract_prereqs(desc)
        desc = re.sub(r'\s*Prereq(?:uisite)?s?\s*\([^)]*\)?\s*:.*', '', desc, flags=re.IGNORECASE | re.DOTALL).strip()

        key = (dept, course_id)
        if key in CORE_IDS:
            tags = ["core"]
        elif key in HONOURS_IDS:
            tags = ["honours"]
        else:
            tags = []

        course = {
            "id": course_id,
            "dept": dept,
            "name": name,
            "year": infer_year(course_id),
            "desc": desc,
            "prereqs": prereqs,
            "tags": tags,
        }

        courses.append(course)

courses.sort(key=lambda x: (x["dept"], x["id"]))

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=2, ensure_ascii=False)

print(f"Done. Wrote {len(courses)} courses to {OUTPUT_JSON}")