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

3. **Récupérer le projet et construire l'image**
   ```bash
   git clone https://github.com/<votre-organisation>/registre.git
   cd registre
   sudo docker build -t sci-lemmarket .
   sudo docker run -d --name sci-lemmarket --restart unless-stopped -p 5000:5000 sci-lemmarket
   ```

4. **Configurer Apache comme proxy inverse**
   ```bash
   sudo a2enmod proxy proxy_http headers
   sudo tee /etc/apache2/sites-available/sci-lemmarket.conf >/dev/null <<'EOF'
   <VirtualHost *:80>
       ServerName votre-domaine.tld

       ProxyPreserveHost On
       ProxyPass / http://127.0.0.1:5000/
       ProxyPassReverse / http://127.0.0.1:5000/

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
