import re

with open(r'C:\Users\K KRISHNA CHARAN\.gemini\antigravity\brain\ac19c53b-4f65-4f7b-80c8-e070f4eae242\.system_generated\steps\837\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

items = re.findall(r'data-sentry-element="GalleryListItem"[^>]*>.*?</h3>', text, re.DOTALL)
if not items:
    # search for headings
    headings = re.findall(r'<h[234][^>]*>(.*?)</h[234]>', text)
    print("Headings:", headings[:40])
    
# Let's search for template names
names = set(re.findall(r'/templates/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+', text))
print("Template URLs:", list(names)[:40])
