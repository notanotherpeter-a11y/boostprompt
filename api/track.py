#!/usr/bin/env python3
"""
BoostPrompt Analytics Tracker — RAG Integration
Receives tracking events from the website and stores them for agent analysis.
"""
import json, os, csv
from datetime import datetime
from pathlib import Path

WORKSPACE = "/Users/king/.openclaw/workspace"
ANALYTICS_DIR = os.path.join(WORKSPACE, "boostprompt-site/analytics")
EVENTS_FILE = os.path.join(ANALYTICS_DIR, "events.jsonl")
SESSIONS_FILE = os.path.join(ANALYTICS_DIR, "sessions.jsonl")
SUBSCRIBERS_FILE = os.path.join(ANALYTICS_DIR, "subscribers.csv")
DAILY_STATS = os.path.join(ANALYTICS_DIR, "daily-stats.json")

os.makedirs(ANALYTICS_DIR, exist_ok=True)

def log_event(event_data):
    """Append event to JSONL file."""
    event_data["server_ts"] = datetime.now().isoformat()
    with open(EVENTS_FILE, "a") as f:
        f.write(json.dumps(event_data) + "\n")

def log_subscriber(email, source="direct"):
    """Track email signup."""
    if not os.path.exists(SUBSCRIBERS_FILE):
        with open(SUBSCRIBERS_FILE, "w", newline="") as f:
            csv.writer(f).writerow(["email", "timestamp", "source"])
    with open(SUBSCRIBERS_FILE, "a", newline="") as f:
        csv.writer(f).writerow([email, datetime.now().isoformat(), source])

def get_daily_stats():
    """Generate daily analytics summary for RAG/agents."""
    stats = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "page_views": 0,
        "unique_sessions": set(),
        "product_clicks": {},
        "email_signups": 0,
        "avg_scroll_depth": 0,
        "sources": {},
        "devices": {},
        "geo": {},
        "sections_viewed": {},
    }
    
    scroll_depths = []
    today = datetime.now().strftime("%Y-%m-%d")
    
    if os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE) as f:
            for line in f:
                try:
                    evt = json.loads(line.strip())
                    if not evt.get("server_ts", "").startswith(today):
                        continue
                    
                    name = evt.get("name", "")
                    if name == "page_view":
                        stats["page_views"] += 1
                        src = evt.get("source", "direct")
                        stats["sources"][src] = stats["sources"].get(src, 0) + 1
                    elif name == "product_click":
                        prod = evt.get("product", "unknown")
                        stats["product_clicks"][prod] = stats["product_clicks"].get(prod, 0) + 1
                    elif name == "email_signup":
                        stats["email_signups"] += 1
                    elif name == "scroll_depth":
                        scroll_depths.append(evt.get("depth", 0))
                    elif name == "section_view":
                        sec = evt.get("section", "unknown")
                        stats["sections_viewed"][sec] = stats["sections_viewed"].get(sec, 0) + 1
                    elif name == "session_end":
                        dev = evt.get("device", "unknown")
                        stats["devices"][dev] = stats["devices"].get(dev, 0) + 1
                        geo = evt.get("geo", "unknown")
                        stats["geo"][geo] = stats["geo"].get(geo, 0) + 1
                    
                    sid = evt.get("sid")
                    if sid:
                        stats["unique_sessions"].add(sid)
                except:
                    continue
    
    stats["unique_visitors"] = len(stats["unique_sessions"])
    stats["avg_scroll_depth"] = round(sum(scroll_depths) / len(scroll_depths)) if scroll_depths else 0
    del stats["unique_sessions"]  # Not JSON serializable
    
    # Count total subscribers
    if os.path.exists(SUBSCRIBERS_FILE):
        with open(SUBSCRIBERS_FILE) as f:
            stats["total_subscribers"] = sum(1 for _ in f) - 1  # minus header
    
    with open(DAILY_STATS, "w") as f:
        json.dump(stats, f, indent=2)
    
    return stats

def generate_rag_report():
    """Generate a report for RAG ingestion by Harold/Golda."""
    stats = get_daily_stats()
    
    report = f"""## BoostPrompt.ai Analytics — {stats['date']}

### Traffic
- Page Views: {stats['page_views']}
- Unique Visitors: {stats['unique_visitors']}
- Avg Scroll Depth: {stats['avg_scroll_depth']}%

### Conversions
- Product Clicks: {json.dumps(stats['product_clicks'])}
- Email Signups Today: {stats['email_signups']}
- Total Subscribers: {stats.get('total_subscribers', 0)}

### Traffic Sources
{chr(10).join(f'- {k}: {v} visits' for k,v in stats['sources'].items()) or '- No traffic yet'}

### Devices
{chr(10).join(f'- {k}: {v}' for k,v in stats['devices'].items()) or '- No data yet'}

### Most Viewed Sections
{chr(10).join(f'- {k}: {v} views' for k,v in sorted(stats['sections_viewed'].items(), key=lambda x:-x[1])[:5]) or '- No data yet'}
"""
    
    report_path = os.path.join(ANALYTICS_DIR, "rag-report.md")
    with open(report_path, "w") as f:
        f.write(report)
    
    return report

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "report":
        print(generate_rag_report())
    elif len(sys.argv) > 1 and sys.argv[1] == "stats":
        print(json.dumps(get_daily_stats(), indent=2))
    else:
        print("Usage: python3 track.py [report|stats]")
