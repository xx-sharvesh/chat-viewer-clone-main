import re
import json
from datetime import datetime

INPUT_FILE = "textsforwa.txt"
OUTPUT_FILE = "messages.json"

# Regex for message start: DD/MM/YY, H:MM am/pm - Sender: Message
MESSAGE_REGEX = re.compile(
    r"^(\d{1,2}/\d{1,2}/\d{2,4}),\s+(\d{1,2}:\d{2}\s*[ap]m)\s+-\s+([^:]+?):\s+(.*)$",
    re.IGNORECASE
)

def normalize_spaces(s: str) -> str:
    """Convert special spaces (non-breaking, narrow) to normal spaces."""
    return s.replace("\u202F", " ").replace("\u00A0", " ")

def parse_whatsapp_chat(text: str):
    messages = []
    lines = text.splitlines()

    current_msg = None

    for line in lines:
        line = normalize_spaces(line.strip())
        if not line:
            continue

        match = MESSAGE_REGEX.match(line)
        if match:
            # Save previous multi-line message if exists
            if current_msg:
                messages.append(current_msg)
                current_msg = None

            date_str, time_str, sender, content = match.groups()

            # Skip system messages or encryption lines
            if (
                "end-to-end encrypted" in content.lower()
                or "messages and calls" in sender.lower()
                or content.strip() == "<Media omitted>"
            ):
                continue

            try:
                # Parse date
                day, month, year = date_str.split("/")
                day, month, year = int(day), int(month), int(year)
                if year < 100:
                    year += 2000

                # Normalize time string
                time_str = normalize_spaces(time_str).lower()

                # Extract hours and minutes
                time_match = re.match(r"(\d{1,2}):(\d{2})\s*([ap]m)", time_str)
                if not time_match:
                    raise ValueError("Time format not recognized")

                hours, minutes, period = time_match.groups()
                hours, minutes = int(hours), int(minutes)

                # Convert 12-hour to 24-hour
                if period == "pm" and hours != 12:
                    hours += 12
                elif period == "am" and hours == 12:
                    hours = 0

                # Create datetime object
                msg_datetime = datetime(year, month, day, hours, minutes)

                current_msg = {
                    "datetime": msg_datetime.isoformat() + "Z",
                    "date": msg_datetime.date().isoformat(),
                    "time": time_str.strip(),
                    "sender": sender.strip(),
                    "content": content.strip()
                }

            except Exception as e:
                print(f"⚠️ Failed to parse line: {line}\nError: {e}")

        else:
            # This is a continuation of the previous message (multi-line)
            if current_msg:
                current_msg["content"] += "\\n" + line.strip()

    # Push the last message if exists
    if current_msg:
        messages.append(current_msg)

    return messages

def main():
    # Read input text file
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        txt_content = f.read()

    print("📂 Parsing WhatsApp chat...")
    messages = parse_whatsapp_chat(txt_content)
    print(f"✅ Parsed {len(messages)} messages")

    # Save JSON output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)

    print(f"📁 Output written to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
