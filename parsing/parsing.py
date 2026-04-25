import csv
import json
import re

INPUT_CSV = r"C:\Users\rexth\courses\parsing\ucalgary-economics.csv"
OUTPUT_JSON = "courses_parsed.json"

def find_col(fieldnames, keywords):
    for name in fieldnames:
        if any(k in name.lower() for k in keywords):
            return name
    return None

def infer_year(course_id):
    return 1 if 200 <= course_id < 300 else 3

def clean_dept(raw):
    raw = (raw or "").upper()
    m = re.search(r'\b([A-Z]{3,4})\b', raw)
    return m.group(1) if m else ""

# 🔥 FIXED PREREQ PARSER
def extract_prereqs(desc):
    if not desc:
        return []

    # grab ONLY the prerequisite sentence (stop at period)
    m = re.search(r'Prereq(?:uisite)?s?[:\s]+([^.]*)', desc, re.IGNORECASE)
    if not m:
        return []

    text = m.group(1)

    # normalize separators
    text = text.replace(" and ", ",")
    text = text.replace(" or ", ",")
    text = text.replace(";", ",")

    # extract course codes
    matches = re.findall(r'\b([A-Z]{3,4})\s*(\d{3})\b', text.upper())

    seen = set()
    result = []

    for dept, num in matches:
        num = int(num)

        val = num if dept == "ECON" else f"{dept} {num}"

        if val not in seen:
            seen.add(val)
            result.append(val)

    return result

courses = []

with open(INPUT_CSV, newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)

    COL_SUBJECT = find_col(reader.fieldnames, ["subject", "dept"])
    COL_ID = find_col(reader.fieldnames, ["catalog", "number", "course"])
    COL_NAME = find_col(reader.fieldnames, ["title", "name"])
    COL_DESC = find_col(reader.fieldnames, ["description", "desc"])

    for row in reader:
        raw_id = str(row.get(COL_ID, ""))
        id_match = re.search(r'\d{3}', raw_id)
        if not id_match:
            continue

        course_id = int(id_match.group())

        raw_dept = row.get(COL_SUBJECT) or raw_id
        dept = clean_dept(raw_dept)

        name = (row.get(COL_NAME) or "").strip()
        desc = (row.get(COL_DESC) or "").strip()

        course = {
            "id": course_id,
            "dept": dept,
            "name": name,
            "year": infer_year(course_id),
            "desc": desc,
            "prereqs": extract_prereqs(desc),
            "tags": []
        }

        courses.append(course)

courses.sort(key=lambda x: (x["dept"], x["id"]))

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=2, ensure_ascii=False)

print(f"Done. Wrote {len(courses)} courses to {OUTPUT_JSON}")