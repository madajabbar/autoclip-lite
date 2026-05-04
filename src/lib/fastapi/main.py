import os
import whisper
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="AutoClip Whisper Inference Engine")

# Global variable to hold the loaded model
model = None
MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")

def format_ass_time(seconds: float):
    td = float(seconds)
    hours = int(td // 3600)
    minutes = int((td % 3600) // 60)
    secs = int(td % 60)
    centiseconds = int(round((td % 1) * 100))
    if centiseconds == 100:
        secs += 1
        centiseconds = 0
    return f"{hours:d}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"

def get_ass_header(font_name="Arial Black", font_size=72, primary_color="&H00FFFFFF", back_color="&H00000000"):
    return f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},{primary_color},&H0000FFFF,&H00000000,{back_color},-1,0,0,0,100,100,0,0,3,4,0,2,20,20,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

@app.on_event("startup")
def load_model():
    global model
    print(f"🔄 Loading Whisper model '{MODEL_NAME}' into memory...")
    model = whisper.load_model(MODEL_NAME)
    print("✅ Whisper Model loaded successfully!")

class TranscribeRequest(BaseModel):
    audio_path: str
    ass_path: str

@app.post("/transcribe")
def transcribe_audio(req: TranscribeRequest):
    global model
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    
    if not os.path.exists(req.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    print(f"🎙️ Transcribing: {req.audio_path}")
    
    try:
        # Transcribe with word-level timestamps
        result = model.transcribe(req.audio_path, fp16=False, word_timestamps=True)
        
        HIGHLIGHT_COLOR = "&H00FFFF" 
        WHITE_COLOR = "&HFFFFFF"

        with open(req.ass_path, "w", encoding="utf-8") as ass_file:
            ass_file.write(get_ass_header())
            
            for segment in result.get('segments', []):
                words = segment.get('words', [])
                if not words:
                    continue
                
                chunk_size = 3
                for i in range(0, len(words), chunk_size):
                    chunk = words[i:i + chunk_size]
                    chunk_start = format_ass_time(chunk[0]['start'])
                    chunk_end = format_ass_time(chunk[-1]['end'])
                    
                    for active_word_idx in range(len(chunk)):
                        start_t = format_ass_time(chunk[active_word_idx]['start'])
                        if active_word_idx < len(chunk) - 1:
                            end_t = format_ass_time(chunk[active_word_idx + 1]['start'])
                        else:
                            end_t = chunk_end
                        
                        line_parts = []
                        for j, w in enumerate(chunk):
                            clean_word = w['word'].strip()
                            if j == active_word_idx:
                                line_parts.append(f"{{\\1c{HIGHLIGHT_COLOR}}}{clean_word}{{\\1c{WHITE_COLOR}}}")
                            else:
                                line_parts.append(clean_word)
                        
                        text = " ".join(line_parts)
                        ass_file.write(f"Dialogue: 0,{start_t},{end_t},Default,,0,0,0,,{text}\n")
        
        print(f"✅ Saved ASS to: {req.ass_path}")
        return {"success": True, "message": "Transcription complete", "ass_path": req.ass_path}
    
    except Exception as e:
        print(f"❌ Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
