# 1. 파이썬 3.11 이미지 사용 [cite: 1]
FROM python:3.11-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 필요한 파일 복사 및 라이브러리 설치 
# 빌드 컨텍스트(루트)에 있는 requirements.txt를 복사합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 

# 4. 전체 코드 복사 (main.py와 backend 폴더 전체 포함)
COPY . .

# 5. FastAPI 서버 실행 (반드시 쌍따옴표와 쉼표를 확인하세요) 
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]