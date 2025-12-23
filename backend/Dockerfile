# 1. Python 3.11
FROM python:3.11-slim

# 2. 작업 디렉토리
WORKDIR /app

# 3. requirements.txt는 backend 폴더에 있음
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 4. backend 코드 복사
COPY backend /app/backend
COPY index.html /app/index.html

# 5. FastAPI 실행
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]