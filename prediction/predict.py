"""
Khaffif — crowd forecast from the class timetable.

Usage:   python predict.py schedule.csv
Output:  prediction.csv  (open in Excel / Google Sheets to chart it)

Model (hourly, per weekday):
  - parking   = students with a lecture this hour or within +/- 1 hour (on campus)
  - cafeteria = students whose lecture ends this hour
  - library   = students on campus who are not in a lecture
Each series is normalised to 0-100% of its weekly peak.
"""
import csv, sys
from collections import defaultdict

DAYS = ["sun", "mon", "tue", "wed", "thu"]
DAY_NAME = {"sun": "Sunday", "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday", "thu": "Thursday"}
HOURS = range(7, 19)

def to_min(t):
    h, m = t.split(":")
    return int(h) * 60 + int(m)

def main(path):
    in_class = defaultdict(int)   # (day, hour) -> students in a lecture
    ending = defaultdict(int)     # (day, hour) -> students whose lecture just ended
    on_campus = defaultdict(int)  # (day, hour) -> students likely on campus

    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            s, e, n = to_min(row["start"]), to_min(row["end"]), int(row["students"])
            for day in row["days"].split(";"):
                for h in HOURS:
                    hs, he = h * 60, h * 60 + 60
                    if s < he and e > hs:
                        in_class[(day, h)] += n
                    if hs <= e < he:
                        ending[(day, h)] += n
                    if s - 60 < he and e + 60 > hs:
                        on_campus[(day, h)] += n

    rows = []
    for day in DAYS:
        for h in HOURS:
            k = (day, h)
            rows.append({
                "day": DAY_NAME[day], "hour": f"{h}:00",
                "parking": on_campus[k],
                "cafeteria": ending[k],
                "library": max(0, on_campus[k] - in_class[k]),
            })

    # normalise each column to 0-100% of its peak
    for col in ["parking", "cafeteria", "library"]:
        mx = max(r[col] for r in rows) or 1
        for r in rows:
            r[col] = round(r[col] / mx * 100)

    with open("prediction.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["day", "hour", "parking", "cafeteria", "library"])
        w.writeheader(); w.writerows(rows)

    print("Weekly peak per place:")
    for col, name in [("parking", "Parking"), ("cafeteria", "Cafeteria"), ("library", "Library")]:
        top = max(rows, key=lambda r: r[col])
        print(f"  {name}: {top['day']} at {top['hour']}")
    print("Saved prediction.csv")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "schedule.csv")
