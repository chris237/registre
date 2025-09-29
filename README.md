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
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```
Accéder à http://localhost:3000

> L'application frontend interroge l'API via l'URL définie dans la variable `VITE_API_URL`. En production la valeur par défaut `/api` est utilisée, ce qui permet de passer par le proxy Apache défini dans `registre.conf`.

---

## 🐳 Docker

Le projet est livré avec deux images Docker :

- **backend** : application Flask qui écoute sur `5000`
- **frontend** : build statique servi par nginx sur `3000`

Pour tout lancer en local :

```bash
docker compose up --build
```

Les services sont reliés entre eux en réseau interne, les ports sont exposés sur `127.0.0.1` uniquement :

- http://127.0.0.1:5000/api → backend Flask
- http://127.0.0.1:3000 → frontend (pré-configuré pour consommer `/api`)

---

## ☁️ Déployer sur un serveur Ubuntu avec Apache et Docker

1. **Mettre à jour le serveur et installer les dépendances de base**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y apache2 curl ca-certificates gnupg lsb-release
   ```

2. **Installer Docker et Docker Compose Plugin**
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo usermod -aG docker $USER
   ```
   > Déconnectez-vous/reconnectez-vous pour que le groupe `docker` soit pris en compte.

3. **Récupérer le projet et construire les conteneurs**
   ```bash
   git clone https://github.com/<votre-organisation>/registre.git
   cd registre
   sudo docker compose up -d --build
   ```

4. **Configurer Apache comme proxy inverse**
   ```bash
   sudo a2enmod proxy proxy_http headers
   sudo tee /etc/apache2/sites-available/sci-lemmarket.conf >/dev/null <<'EOF'
   <VirtualHost *:80>
       ServerName votre-domaine.tld

       ProxyPreserveHost On
       ProxyPass /api http://127.0.0.1:5000/api
       ProxyPassReverse /api http://127.0.0.1:5000/api

       ProxyPass / http://127.0.0.1:3000/
       ProxyPassReverse / http://127.0.0.1:3000/

       RequestHeader set X-Forwarded-Proto "http"
       RequestHeader set X-Forwarded-Port "80"
   </VirtualHost>
   EOF
   sudo a2ensite sci-lemmarket.conf
   sudo systemctl reload apache2
   ```

5. *(Optionnel mais recommandé)* **Activer HTTPS via Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-apache
   sudo certbot --apache -d votre-domaine.tld
   ```

Après ces étapes, l'application est accessible via Apache sur votre domaine, tandis que Docker maintient le backend Flask en fonctionnement.
