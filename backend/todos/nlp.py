from email.mime import text
import re
# from turtle import title
import dateparser


TAG_PATTERN = re.compile(r"(?:#|\btag:)\s*([A-Za-z0-9_\-]+)")


COMMON_KEYWORDS = {
'groceries': ['buy', 'shop', 'market', 'milk', 'bread'],
'work': ['report', 'meeting', 'email', 'standup'],
'study': ['read', 'assignment', 'exam', 'homework'],
}


WEEK_HINTS = {
'monday': 'MO', 'tuesday': 'TU', 'wednesday': 'WE', 'thursday': 'TH',
'friday': 'FR', 'saturday': 'SA', 'sunday': 'SU'
}




def parse_quick_add(text: str):
    text = (text or '').strip()
    tags = [m.group(1).lower() for m in TAG_PATTERN.finditer(text)]
    due = None
    try:
        due = dateparser.parse(text, settings={'PREFER_DATES_FROM': 'future'})
    except Exception:
        due = None


    rrule = None
    lowered = text.lower()
    if 'every' in lowered:
        byday = [code for name, code in WEEK_HINTS.items() if name in lowered]
        if byday:
            rrule = f"FREQ=WEEKLY;BYDAY={','.join(byday)}"
        elif 'day' in lowered:
            rrule = 'FREQ=DAILY'
        elif 'week' in lowered:
            rrule = 'FREQ=WEEKLY'
        elif 'month' in lowered:
            rrule = 'FREQ=MONTHLY'


    title = re.sub(TAG_PATTERN, '', text)
    title = re.sub(r"\b(every|tomorrow|today|tonight|next|on|at)\b", '', title, flags=re.I)
    title = re.sub(r"\s+", ' ', title).strip()


    suggested = set(tags)
    for k, words in COMMON_KEYWORDS.items():
        if any(w in lowered for w in words):
            suggested.add(k)


    return {'title': title or text, 'tags': sorted(suggested), 'due': due, 'rrule': rrule}