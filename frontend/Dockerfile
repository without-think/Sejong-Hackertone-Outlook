# --- 단계 1: 빌드 단계 (Build Stage) ---
FROM node:20-alpine AS build-stage

WORKDIR /app

# 의존성 설치 (캐시 최적화)
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# --- 단계 2: 실행 단계 (Production Stage) ---
# 빌드 결과물(dist)만 Nginx 서버로 옮겨 배포합니다.
FROM nginx:stable-alpine

# Nginx 기본 설정 대신 커스텀 설정이 필요하다면 추가할 수 있습니다.
# 여기서는 빌드된 정적 파일을 Nginx 경로로 복사합니다.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx 80포트 노출
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]