import os
import sys
import whisper
import json
import math

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

def transcribe_to_ass(audio_path, ass_path, model_name="tiny"):
    print(f"Loading model '{model_name}'...")
    model = whisper.load_model(model_name)
    
    print("Transcribing with word-level timestamps...")
    # word_timestamps=True provides word-level timing
    result = model.transcribe(audio_path, fp16=False, word_timestamps=True)
    
    # Yellow in ASS (B-G-R)
    HIGHLIGHT_COLOR = "&H00FFFF" 
    WHITE_COLOR = "&HFFFFFF"

    with open(ass_path, "w", encoding="utf-8") as ass_file:
        ass_file.write(get_ass_header())
        
        for segment in result['segments']:
            words = segment.get('words', [])
            if not words:
                continue
            
            # Group words into chunks of max 3 words
            chunk_size = 3
            for i in range(0, len(words), chunk_size):
                chunk = words[i:i + chunk_size]
                chunk_start = format_ass_time(chunk[0]['start'])
                chunk_end = format_ass_time(chunk[-1]['end'])
                
                # For each chunk, we create several events (one for each word highlight)
                for active_word_idx in range(len(chunk)):
                    start_t = format_ass_time(chunk[active_word_idx]['start'])
                    # If it's not the last word in chunk, end at next word's start
                    # Otherwise end at chunk's end
                    if active_word_idx < len(chunk) - 1:
                        end_t = format_ass_time(chunk[active_word_idx + 1]['start'])
                    else:
                        end_t = chunk_end
                    
                    # Construct the line with highlighting
                    line_parts = []
                    for j, w in enumerate(chunk):
                        clean_word = w['word'].strip()
                        if j == active_word_idx:
                            # Highlighted word (Yellow)
                            line_parts.append(f"{{\\1c{HIGHLIGHT_COLOR}}}{clean_word}{{\\1c{WHITE_COLOR}}}")
                        else:
                            # Normal word (White)
                            line_parts.append(clean_word)
                    
                    text = " ".join(line_parts)
                    ass_file.write(f"Dialogue: 0,{start_t},{end_t},Default,,0,0,0,,{text}\n")
    
    print(f"Completed! Interactive ASS saved to {ass_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python transcribe_local.py <audio_path> <ass_path> [model_name]")
        sys.exit(1)
        
    audio_file = sys.argv[1]
    output_file = sys.argv[2]
    model_name = sys.argv[3] if len(sys.argv) > 3 else "tiny"
    
    # Logic to handle .ass or .srt extension (backward compatibility)
    if output_file.endswith(".ass"):
        transcribe_to_ass(audio_file, output_file, model_name)
    else:
        # Fallback to the old SRT logic if needed, but we focus on ASS now
        print("Please provide a .ass path for interactive subtitles.")
        sys.exit(1)
