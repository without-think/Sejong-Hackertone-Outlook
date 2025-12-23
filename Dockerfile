# 1. 파이썬 3.11 이미지 사용
FROM python:3.11-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 필요한 파일 복사 및 라이브러리 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. 전체 코드 복사
COPY . .

# 5. FastAPI 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]