import re
import json
import logging
from typing import Dict, Any, Optional
import requests
from app.core.config import settings
from app.models.enums import TicketSeverity
from app.schemas.ticket import TriageResponse

logger = logging.getLogger("campuspulse.ai_triage")


class AITriageService:
    """
    Intelligent Triage & Classification Service
    - Uses Google Gemini / OpenAI when API keys are configured.
    - Uses advanced regex + semantic heuristics as zero-cost robust local fallback.
    """

    @classmethod
    def triage_text(cls, raw_text: str) -> TriageResponse:
        cleaned_text = raw_text.strip()
        if not cleaned_text:
            return cls._default_fallback("")

        # 1. Attempt Gemini if key exists
        if settings.GEMINI_API_KEY:
            try:
                result = cls._call_gemini_api(cleaned_text)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to heuristic: {e}")

        # 2. Attempt OpenAI if key exists
        if settings.OPENAI_API_KEY:
            try:
                result = cls._call_openai_api(cleaned_text)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to heuristic: {e}")

        # 3. High-Accuracy Rule-Based Fallback
        return cls._heuristic_triage(cleaned_text)

    @classmethod
    def _heuristic_triage(cls, text: str) -> TriageResponse:
        lower = text.lower()

        # 1. Location Detection (Building & Room)
        building = "General Campus"
        room = "Unspecified Room"

        # Check common building patterns
        if re.search(r'\b(ab-?1|academic block 1|block 1)\b', lower):
            building = "Academic Block 1"
        elif re.search(r'\b(ab-?2|academic block 2|block 2)\b', lower):
            building = "Academic Block 2"
        elif re.search(r'\b(ab-?3|academic block 3|block 3)\b', lower):
            building = "Academic Block 3"
        elif re.search(r'\b(hostel|dorm|block [a-f]|hostel [a-f])\b', lower):
            hostel_match = re.search(r'\b(hostel|block)\s*([a-fA-F0-9]+)\b', text, re.IGNORECASE)
            building = f"Hostel {hostel_match.group(2).upper()}" if hostel_match else "Student Residence"
        elif re.search(r'\b(library|central lib|reading room)\b', lower):
            building = "Central Library"
        elif re.search(r'\b(cafeteria|canteen|food court|mess)\b', lower):
            building = "Student Center / Canteen"
        elif re.search(r'\b(sports complex|gym|ground|stadium)\b', lower):
            building = "Sports Complex"
        elif re.search(r'\b(admin block|administrative building|main office)\b', lower):
            building = "Administrative Block"

        # Check Room Number / Code pattern (e.g. AB1-305, LH-1, Room 204, Lab 3)
        # 1. Look for hyphenated / block-room codes like AB1-305, B-201
        hyphen_code = re.search(r'\b[A-Za-z]{1,4}\d?[-_]\d{1,4}[A-Za-z]?\b', text)
        if hyphen_code:
            room = hyphen_code.group(0).upper()
        else:
            # 2. Look for labelled rooms: Room 305, Lab 2, LH-1, Seminar Hall 2
            labelled = re.search(r'\b(?:room|lab|lh|hall|cabin|hallway|floor)\s*[-#]?\s*\d{1,4}[A-Za-z]?\b', text, re.IGNORECASE)
            if labelled:
                room = labelled.group(0).strip().title()
            else:
                simple_num = re.search(r'\b\d{3,4}\b', text)
                if simple_num:
                    room = f"Room {simple_num.group(0)}"

        # 2. Category Detection
        category = "Infrastructure"
        if any(w in lower for w in ["ac", "a/c", "air condition", "cooling", "chiller", "ventilation", "hvac", "thermostat"]):
            category = "Air Conditioning (HVAC)"
        elif any(w in lower for w in ["light", "switch", "fan", "spark", "socket", "power", "short circuit", "wire", "voltage", "bulb"]):
            category = "Electrical"
        elif any(w in lower for w in ["leak", "tap", "pipe", "water", "drain", "flush", "sink", "restroom", "toilet", "washroom", "plumbing"]):
            category = "Plumbing"
        elif any(w in lower for w in ["wifi", "internet", "projector", "screen", "lan", "network", "mic", "microphone", "speaker", "audio", "computer", "pc", "monitor"]):
            category = "IT & Audio-Visual"
        elif any(w in lower for w in ["dust", "dirty", "trash", "garbage", "smell", "clean", "sweep", "mop", "stain", "spill"]):
            category = "Cleanliness & Sanitation"
        elif any(w in lower for w in ["lost", "found", "wallet", "id card", "bag", "keys", "phone", "umbrella", "bottle"]):
            category = "Lost & Found"
        elif any(w in lower for w in ["chair", "desk", "table", "bench", "door", "window", "lock", "handle", "whiteboard", "podium"]):
            category = "Furniture & Carpentry"

        # 3. Severity & Hazard Detection
        severity = TicketSeverity.MEDIUM
        hazard_detected = False

        critical_words = ["fire", "sparking", "shock", "smoke", "explosion", "flooding", "gas leak", "burning", "slipping", "danger", "urgent", "injury"]
        high_words = ["leaking", "broken", "overflow", "blackout", "no power", "cut off", "slippery", "exam", "stuck"]
        low_words = ["minor", "flickering", "creaking", "slow", "suggestion", "dim", "dirty spot"]

        if any(w in lower for w in critical_words):
            severity = TicketSeverity.CRITICAL
            hazard_detected = True
        elif any(w in lower for w in high_words):
            severity = TicketSeverity.HIGH
        elif any(w in lower for w in low_words):
            severity = TicketSeverity.LOW

        # 4. Summary & Suggested Title Generation
        summary = text if len(text) <= 120 else text[:117] + "..."
        if "slip" in lower and "leak" in lower:
            suggested_title = f"{category} water leakage hazard in {room}"
        elif room != "Unspecified Room":
            suggested_title = f"{category} reported at {building} ({room})"
        else:
            suggested_title = f"{category} issue in {building}"

        return TriageResponse(
            category_name=category,
            suggested_title=suggested_title,
            building=building,
            room=room,
            severity=severity,
            summary=summary,
            confidence=0.88,
            hazard_detected=hazard_detected,
            explanation="Triaged using deterministic heuristic engine with location, keyword, and safety hazard detection."
        )

    @classmethod
    def _call_gemini_api(cls, text: str) -> Optional[TriageResponse]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = f"""
        You are CampusPulse AI, an intelligent campus operations assistant.
        Analyze this campus issue report:
        "{text}"

        Return ONLY a JSON object strictly matching this schema:
        {{
            "category_name": "One of: Air Conditioning (HVAC), Electrical, Plumbing, IT & Audio-Visual, Cleanliness & Sanitation, Furniture & Carpentry, Lost & Found, Infrastructure",
            "suggested_title": "Concise 5-8 word title",
            "building": "Specific Building Name e.g. Academic Block 1 or General Campus",
            "room": "Room or space code e.g. AB1-305 or Library 2nd Floor",
            "severity": "LOW, MEDIUM, HIGH, or CRITICAL",
            "summary": "1 sentence executive summary of problem",
            "confidence": 0.95,
            "hazard_detected": true/false,
            "explanation": "Brief reasoning for categorization and severity"
        }}
        """
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        resp = requests.post(url, json=payload, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            content_str = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(content_str)
            return TriageResponse(
                category_name=parsed.get("category_name", "Infrastructure"),
                suggested_title=parsed.get("suggested_title", "Campus Issue"),
                building=parsed.get("building", "General Campus"),
                room=parsed.get("room", "Unspecified"),
                severity=TicketSeverity(parsed.get("severity", "MEDIUM").upper()),
                summary=parsed.get("summary", text[:100]),
                confidence=float(parsed.get("confidence", 0.95)),
                hazard_detected=bool(parsed.get("hazard_detected", False)),
                explanation=parsed.get("explanation", "Parsed via Gemini API")
            )
        return None

    @classmethod
    def _call_openai_api(cls, text: str) -> Optional[TriageResponse]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
        prompt = f"""
        Analyze this campus issue: "{text}"
        Return JSON strictly matching:
        {{"category_name": string, "suggested_title": string, "building": string, "room": string, "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "summary": string, "confidence": number, "hazard_detected": boolean, "explanation": string}}
        """
        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            parsed = json.loads(data["choices"][0]["message"]["content"])
            return TriageResponse(
                category_name=parsed.get("category_name", "Infrastructure"),
                suggested_title=parsed.get("suggested_title", "Campus Issue"),
                building=parsed.get("building", "General Campus"),
                room=parsed.get("room", "Unspecified"),
                severity=TicketSeverity(parsed.get("severity", "MEDIUM").upper()),
                summary=parsed.get("summary", text[:100]),
                confidence=float(parsed.get("confidence", 0.95)),
                hazard_detected=bool(parsed.get("hazard_detected", False)),
                explanation=parsed.get("explanation", "Parsed via OpenAI API")
            )
        return None

    @classmethod
    def _default_fallback(cls, text: str) -> TriageResponse:
        return TriageResponse(
            category_name="Infrastructure",
            suggested_title="General Campus Issue",
            building="General Campus",
            room="General Area",
            severity=TicketSeverity.MEDIUM,
            summary=text,
            confidence=0.5,
            hazard_detected=False,
            explanation="Default fallback"
        )
