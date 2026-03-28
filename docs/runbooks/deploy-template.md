# Deployment Runbook — {{PROJECT_NAME}}

> Dieses Runbook wird vom DevOps-Skill in Phase 5 generiert.
> Platzhalter (`{{...}}`) werden mit echten Projekt-Werten ersetzt.
> Alle Befehle sind copy-paste-fähig — nichts passiert automatisch.

## Projekt-Info

| Key | Value |
|-----|-------|
| App-Name | `{{PROJECT_NAME}}` |
| Domain | `{{DOMAIN}}` |
| Server | `{{SERVER_IP}}` |
| App-Pfad | `/opt/apps/{{PROJECT_NAME}}/` |
| Container-Port | `{{PORT}}` |
| Repo | `{{REPO_URL}}` |

---

## Erstmalige Einrichtung (nur 1x)

### 1. SSH auf den Server

```bash
ssh admin@{{SERVER_IP}}
```

### 2. Projektverzeichnis erstellen

```bash
sudo mkdir -p /opt/apps/{{PROJECT_NAME}}
sudo chown admin:admin /opt/apps/{{PROJECT_NAME}}
cd /opt/apps/{{PROJECT_NAME}}
```

### 3. Repository klonen

```bash
git clone {{REPO_URL}} repo
cd repo
```

Oder falls kein Git auf dem Server — Build lokal erstellen und hochladen:
```bash
# Lokal (auf deinem PC):
npm run build
scp -r .next package.json package-lock.json admin@{{SERVER_IP}}:/opt/apps/{{PROJECT_NAME}}/repo/
```

### 4. Environment-Variablen erstellen

```bash
cd /opt/apps/{{PROJECT_NAME}}
cp repo/.env.example .env
nano .env
# Alle Platzhalter mit echten Werten ersetzen:
# - DATABASE_URL
# - JWT_SECRET (min. 32 Zeichen: openssl rand -base64 32)
# - NEXTAUTH_SECRET (openssl rand -base64 32)
# - NEXTAUTH_URL=https://{{DOMAIN}}
```

### 5. Docker Compose starten

```bash
cd /opt/apps/{{PROJECT_NAME}}
# docker-compose.prod.yml aus dem Repo kopieren (oder liegt schon in repo/):
cp repo/docker-compose.prod.yml docker-compose.yml

# Container bauen und starten
docker compose up -d --build

# Prüfen ob Container laufen
docker compose ps

# Logs prüfen (erste 50 Zeilen)
docker compose logs --tail=50
```

### 6. Nginx vHost einrichten

```bash
sudo nano /etc/nginx/sites-available/{{PROJECT_NAME}}.conf
```

Inhalt (aus `repo/deploy/nginx.conf` kopieren oder dieses Template nutzen):

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name {{DOMAIN}};
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name {{DOMAIN}};

  ssl_certificate     /etc/letsencrypt/live/{{DOMAIN}}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{{DOMAIN}}/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "same-origin" always;

  access_log /var/log/nginx/{{PROJECT_NAME}}.access.log;
  error_log  /var/log/nginx/{{PROJECT_NAME}}.error.log warn;

  include /etc/nginx/snippets/deny-dotfiles.conf;

  location / {
    proxy_pass http://127.0.0.1:{{PORT}};
    include /etc/nginx/snippets/proxy-std.conf;

    # WebSocket Support (falls Next.js oder Echtzeit-Features)
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

### 7. SSL-Zertifikat erstellen

```bash
# Erst Nginx OHNE SSL starten (für Certbot HTTP-Challenge):
# Temporär den SSL-Block in der Nginx-Config auskommentieren oder:
sudo certbot --nginx -d {{DOMAIN}}

# Certbot modifiziert die Config automatisch.
# Danach prüfen:
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Symlink aktivieren & Nginx neuladen

```bash
sudo ln -sf /etc/nginx/sites-available/{{PROJECT_NAME}}.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 9. Smoke-Test

```bash
# Health-Check (wenn Endpoint vorhanden)
curl -s https://{{DOMAIN}}/api/health | jq .

# Oder einfach HTTP-Status prüfen
curl -sI https://{{DOMAIN}} | head -5

# Vom lokalen PC testen
# Browser: https://{{DOMAIN}}
```

---

## Update-Deployment (bei neuem Release)

### 1. Code aktualisieren

```bash
ssh admin@{{SERVER_IP}}
cd /opt/apps/{{PROJECT_NAME}}/repo
git pull origin main
```

### 2. Container neu bauen & starten

```bash
cd /opt/apps/{{PROJECT_NAME}}
docker compose up -d --build

# Build-Log prüfen
docker compose logs --tail=30

# Container-Status
docker compose ps
```

### 3. Health-Check

```bash
curl -s https://{{DOMAIN}}/api/health | jq .
# Erwartet: {"status":"ok"} oder ähnlich
```

### 4. Rollback (wenn nötig)

```bash
cd /opt/apps/{{PROJECT_NAME}}/repo

# Letzten funktionierenden Commit finden
git log --oneline -5

# Auf letzten stabilen Stand zurück
git checkout [COMMIT_HASH]

# Container neu bauen
cd /opt/apps/{{PROJECT_NAME}}
docker compose up -d --build

# Verifizieren
curl -s https://{{DOMAIN}}/api/health | jq .
```

---

## Nützliche Befehle

### Container-Management
```bash
cd /opt/apps/{{PROJECT_NAME}}

# Status
docker compose ps

# Logs (live folgen)
docker compose logs -f

# Logs eines bestimmten Service
docker compose logs -f app

# Container neustarten (ohne Rebuild)
docker compose restart

# Alles stoppen
docker compose down

# Alles stoppen + Volumes löschen (ACHTUNG: DB-Daten weg!)
docker compose down -v
```

### Nginx
```bash
# Config testen
sudo nginx -t

# Reload (ohne Downtime)
sudo systemctl reload nginx

# Logs
tail -f /var/log/nginx/{{PROJECT_NAME}}.access.log
tail -f /var/log/nginx/{{PROJECT_NAME}}.error.log
```

### SSL-Zertifikat
```bash
# Status aller Zertifikate
sudo certbot certificates

# Manuell erneuern
sudo certbot renew

# Auto-Renewal ist per Timer aktiv:
systemctl list-timers | grep certbot
```

### Datenbank (wenn PostgreSQL im Compose)
```bash
# Backup erstellen
docker compose exec db pg_dump -U {{DB_USER}} {{DB_NAME}} > backup_$(date +%Y%m%d).sql

# Backup einspielen
cat backup_YYYYMMDD.sql | docker compose exec -T db psql -U {{DB_USER}} {{DB_NAME}}

# DB-Shell
docker compose exec db psql -U {{DB_USER}} {{DB_NAME}}
```

### Ressourcen prüfen
```bash
# Container-Ressourcen
docker stats --no-stream

# Disk-Usage
df -h /
docker system df

# Alte Images aufräumen
docker image prune -f
docker builder prune -f
```
