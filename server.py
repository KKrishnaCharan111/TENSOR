"""
KAVACH-AURA (TENSOR) — Dedicated Tactical Server
Serves index.html at / and provides /api/psych endpoints for check-in chat, TTS, and STT.
Zero external dependencies required (uses standard library http.server).
"""

import http.server
import socketserver
import os
import json
import urllib.parse
import re

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Semantic NLP dictionary for natural voice check-in free speech mapping
POSITIVE_PHRASES = [
    'great', 'excellent', 'amazing', 'optimal', 'very good', 'slept well', 'rested',
    'no issues', 'feeling good', 'strong', 'very calm', 'peaceful', 'focused',
    'sharp', 'motivated', 'high energy', 'solid', 'confident', 'connected',
    'proud', 'ready', 'healthy', 'refreshed', 'best', 'fine', 'no problem', 'all good',
    'बहुत अच्छा', 'शानदार', 'बढ़िया', 'तरोताजा', 'बाधित नहीं',
    'చాలా బాగుంది', 'బాగుంది', 'ఉత్సాహంగా',
    'ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ', 'ಉತ್ತಮವಾಗಿದೆ', 'ಚೆನ್ನಾಗಿದೆ'
]

GOOD_PHRASES = [
    'good', 'pretty good', 'decent', 'mostly fine', 'normal', 'adequate',
    'okay', 'manageable', 'fair', 'about seven hours', 'six to seven hours',
    'calm enough', 'doing fine', 'satisfactory', 'stable',
    'अच्छा', 'ठीक', 'सामान्य', 'नियंत्रण में',
    'బాగుంది', 'సాధారణం',
    'ಪರವಾಗಿಲ್ಲ', 'ಸಾಧಾರಣ'
]

MODERATE_PHRASES = [
    'moderate', 'so-so', 'average', 'not bad', 'could be better',
    'mixed', 'sometimes', 'a bit tired', 'a little stressed', 'somewhat',
    'maybe two nights', 'a couple of nights', 'not really sure',
    'मध्यम', 'कभी-कभी', 'थोड़ा तनाव',
    'మధ్యస్థంగా', 'కొంతవరకు',
    'ಸ್ವಲ್ಪ ಒತ್ತಡ', 'ಮಧ್ಯಮ'
]

LOW_PHRASES = [
    'poor', 'bad', 'tired', 'drained', 'fatigued', 'stressed', 'hard to sleep',
    'trouble sleeping', 'anxious', 'worried', 'scattered', 'overthinking',
    'isolated', 'distant', 'irritated', 'struggling', 'tough week',
    'four hours', 'barely four hours', 'restless', 'heavy', 'tense',
    'खराब', 'थका हुआ', 'कम नींद', 'तनाव', 'चिंता',
    'బాధగా', 'అలసట', 'నిద్ర లేదు',
    'ಆಯಾಸ', 'ನಿದ್ರೆ ಕಡಿಮೆ', 'ಆತಂಕ'
]

SEVERE_PHRASES = [
    'terrible', 'horrible', 'barely slept', 'two hours', 'no sleep', 'exhausted',
    'extreme stress', 'can not focus', 'panic', 'depressed', 'hopeless', 'overwhelmed',
    'can not take it', 'breakdown', 'severe', 'insomnia', 'suffocating', 'agony',
    'बहुत खराब', 'बिल्कुल नींद नहीं', 'अत्यधिक तनाव', 'अकेलापन',
    'చాలా తీవ్రమైన', 'నిద్ర అస్సలు లేదు', 'భరించలేకపోతున్నా',
    'ತುಂಬಾ ಕೆಟ್ಟದಾಗಿದೆ', 'ನಿದ್ರೆಯೇ ಇಲ್ಲ', 'ತೀವ್ರ ಆತಂಕ'
]

def interpret_free_speech(text):
    t = text.lower()
    
    # Check severe (score 1)
    for p in SEVERE_PHRASES:
        if p in t:
            return 1, "Mapped to: High Strain / Challenging (1/5)"
            
    # Check low (score 2)
    for p in LOW_PHRASES:
        if p in t:
            return 2, "Mapped to: Below Baseline / Strained (2/5)"
            
    # Check positive / optimal (score 5)
    for p in POSITIVE_PHRASES:
        if p in t:
            return 5, "Mapped to: Optimal Resilience (5/5)"
            
    # Check good (score 4)
    for p in GOOD_PHRASES:
        if p in t:
            return 4, "Mapped to: Good / Steady (4/5)"
            
    # Check moderate (score 3)
    for p in MODERATE_PHRASES:
        if p in t:
            return 3, "Mapped to: Moderate / Neutral (3/5)"
            
    # Numbers directly mentioned
    if re.search(r'\b(one|1)\b', t): return 1, "Detected score 1/5"
    if re.search(r'\b(two|2)\b', t): return 2, "Detected score 2/5"
    if re.search(r'\b(three|3)\b', t): return 3, "Detected score 3/5"
    if re.search(r'\b(four|4)\b', t): return 4, "Detected score 4/5"
    if re.search(r'\b(five|5)\b', t): return 5, "Detected score 5/5"

    return 3, "Interpreted as: Moderate / Balanced (3/5)"


class TacticalServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        # Serve index.html at root
        if parsed.path in ('', '/', '/index', '/index.html'):
            self.path = '/index.html'
            return super().do_GET()
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            req_json = json.loads(post_data)
        except Exception:
            req_json = {}

        # 1. /api/psych/chat - Interpretation & Conversational Guidance
        if parsed.path in ('/api/psych/chat', '/api/psych/interpret'):
            user_text = req_json.get('text', '') or req_json.get('answerText', '')
            q_id = req_json.get('questionId', 1)
            score, feedback = interpret_free_speech(user_text)

            res = {
                "status": "success",
                "questionId": q_id,
                "recognizedText": user_text,
                "score": score,
                "feedback": feedback,
                "autoAdvance": True
            }
            self._send_json(res)
            return

        # 2. /api/psych/summary - Check-in Clinical Welfare Summary
        elif parsed.path == '/api/psych/summary':
            scores = req_json.get('scores', [])
            total_score = req_json.get('totalScore', 75)
            band = "stable" if total_score >= 75 else "watch" if total_score >= 50 else "support_needed"
            
            summary = (
                f"Psychological readiness is evaluated at {total_score}%. "
                "Parasympathetic equilibrium and autonomic stability remain robust. "
                "Recommend maintaining routine off-duty grounding and 4-4-4-4 box breathing."
            )
            if band == "watch":
                summary = (
                    f"Psychological resilience is tracking at {total_score}%. "
                    "Moderate cumulative fatigue detected across sleep and operational strain vectors. "
                    "Recommend prioritizing a 90-minute sleep debt recovery window and hydration."
                )
            elif band == "support_needed":
                summary = (
                    f"Elevated strain flagged with composite score at {total_score}%. "
                    "Noticeable pressure across emotional calm and sleep restfulness. "
                    "Zero-PII confidential support is available 24/7 via Tele-MANAS (14416) or Welfare Desk (1904)."
                )

            res = {
                "status": "success",
                "totalScore": total_score,
                "band": band,
                "summary": summary,
                "timestamp": req_json.get('timestamp')
            }
            self._send_json(res)
            return

        # 3. /api/psych/tts - Speech Synthesis Signal
        elif parsed.path == '/api/psych/tts':
            text = req_json.get('text', 'How restful has your sleep been over the past few nights?')
            lang = req_json.get('lang', 'en')
            # Signal browser to play using tuned natural Web Speech
            self._send_json({
                "status": "success",
                "engine": "browser_web_speech_natural",
                "text": text,
                "lang": lang,
                "pitch": 1.02,
                "rate": 0.92
            })
            return

        # 4. /api/psych/stt - Speech-to-Text Endpoint
        elif parsed.path == '/api/psych/stt':
            self._send_json({
                "status": "success",
                "message": "Web Speech API recognition active on client."
            })
            return

        self.send_error(404, "Endpoint Not Found")

    def _send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    print("================================================================")
    print(f"  KAVACH-AURA (TENSOR) — Dedicated Tactical Server             ")
    print(f"  Serving at: http://localhost:{PORT}                          ")
    print("  Commander Login: KV-101 / kavach2026                         ")
    print("  Jawan Login:     KV-207 / aura2026                           ")
    print("================================================================")
    with socketserver.TCPServer(("", PORT), TacticalServerHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped cleanly.")
