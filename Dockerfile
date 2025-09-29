# Backend
FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .

# Frontend build
FROM node:20 AS frontend
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Final stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend /app /app/backend
COPY --from=frontend /app/dist /app/frontend
RUN pip install flask flask_sqlalchemy flask_cors
EXPOSE 5000
CMD ["python", "backend/app.py"]
