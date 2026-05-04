@echo off
echo Installing FastAPI requirements...
pip install -r src/lib/fastapi/requirements.txt

echo Starting AutoClip Inference Engine (FastAPI) on port 8000...
cd src\lib\fastapi
python main.py
pause
