# SCI LemMarket - SQLite + Flask Edition (complet)

## 🚀 Lancer en local

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Accéder à http://localhost:3000

---

## 🐳 Docker

```bash
docker build -t sci-lemmarket .
docker run -p 5000:5000 sci-lemmarket
```

Le backend Flask tourne sur `http://localhost:5000` et gère tous les registres :
- Mandats
- Transactions
- Suivi
- Recherche
- Gestion Locative
