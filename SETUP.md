# 🎯 WM Wett-Analyzer - Setup Anleitung

## Was brauchst du?

- **Node.js** (https://nodejs.org) - Version 14+
- **deine API-Keys** (hast du bereits!)
- Ein Texteditor oder IDE

---

## 🚀 Schritt-für-Schritt Setup

### 1. Ordner erstellen
```bash
mkdir wm-analyzer
cd wm-analyzer
```

### 2. Dateien kopieren
- `package.json` → in deinen Ordner
- `server.js` → in deinen Ordner
- `.env.example` → in deinen Ordner und umbenennen zu `.env`
- `wm-analyzer-with-backend.html` → in deinen Ordner

### 3. .env Datei vorbereiten
```bash
# Benenne .env.example zu .env um
cp .env.example .env

# Öffne .env und überprüfe deine API-Keys:
FOOTBALL_DATA_KEY=6a01d9c5b7ea430b8058c58f4d7ac92c
ODDS_API_KEY=023f42ef331e0ee20d09bef3c6dba39c
PORT=3000
```

### 4. Dependencies installieren
```bash
npm install
```

Das installiert:
- **express** - Server Framework
- **cors** - Für Frontend ↔ Backend Kommunikation
- **axios** - Für API Requests
- **dotenv** - Für Umgebungsvariablen

### 5. Server starten
```bash
node server.js
```

Output sollte sein:
```
🚀 WM Wett-Analyzer Server läuft auf Port 3000
📍 API verfügbar unter http://localhost:3000

Endpoints:
  GET  /api/matches?competition=WC
  GET  /api/odds?sport=soccer_wc
  POST /api/analyze
```

### 6. Frontend öffnen
- Öffne `wm-analyzer-with-backend.html` im Browser
- Stelle sicher dass "http://localhost:3000" eingetragen ist
- Wähle einen Wettbewerb
- Klick "Spiele laden"

---

## 🎯 So funktioniert es:

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  wm-analyzer-with-backend.html (Frontend)          │
│  - Zeigt Spiele                                     │
│  - Nimmt Wetten entgegen                            │
│  - Displays Ergebnisse                              │
└────────────────┬────────────────────────────────────┘
                 │ HTTP Requests
                 │ (CORS)
                 ↓
┌─────────────────────────────────────────────────────┐
│                 PORT 3000 (Node.js)                 │
│  server.js (Backend)                               │
│  - Verwaltet API-Keys sicher                        │
│  - Lädt Spiele von Football-Data.org               │
│  - Generiert Quoten                                 │
│  - Analysiert Wetten                                │
└────────────────┬────────────────────────────────────┘
                 │ API Requests
                 ↓
┌─────────────────────────────────────────────────────┐
│              EXTERNE APIs                           │
│  - Football-Data.org (Spieldaten)                  │
│  - The Odds API (Wettquoten)                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### "PORT 3000 ist bereits in Verwendung"
```bash
# Oder einen anderen Port verwenden:
PORT=3001 node server.js
```

### "Cannot find module 'express'"
```bash
# Dependencies nicht installiert:
npm install
```

### "API Key ungültig"
- Überprüfe deine `.env` Datei
- API-Keys sollten korrekt sein

### "Verbindungsfehler im Browser"
- Server läuft? Check!
- Ist Port 3000 richtig in der HTML?
- Firewall blockiert den Port?

---

## 🚀 Production Setup

Für echte Nutzung:

### 1. .env nicht pushen!
```bash
# .gitignore
.env
node_modules/
```

### 2. Server mit PM2 starten (bleibt laufen)
```bash
npm install -g pm2
pm2 start server.js --name "wm-analyzer"
pm2 save
pm2 startup
```

### 3. HTTPS aktivieren (wichtig!)
```bash
# Mit Let's Encrypt SSL Zertifikat
```

### 4. Frontend deployen
```bash
# Z.B. auf Vercel, Netlify oder eigener Server
```

---

## 📚 API-Endpoints

### GET /api/matches?competition=WC
Lädt Spiele eines Wettbewerbs

Antwort:
```json
{
  "success": true,
  "matches": [
    {
      "id": 1,
      "home": "Deutschland",
      "away": "Spanien",
      "date": "15.06.2026 18:00",
      "status": "SCHEDULED",
      "odds": {
        "home": 2.40,
        "draw": 3.20,
        "away": 3.00
      }
    }
  ]
}
```

### POST /api/analyze
Analysiert deine Wetten

Request:
```json
{
  "matches": [...],
  "bets": {
    "1": "home",
    "2": "away"
  }
}
```

Antwort:
```json
{
  "success": true,
  "tips": [...],
  "combos": [...]
}
```

---

## 🎓 Weiterlernen

- **Express.js Doku**: https://expressjs.com/
- **Football-Data.org API**: https://www.football-data.org/documentation
- **The Odds API Doku**: https://the-odds-api.com/liveapi/guides/v4

---

## 🆘 Hilfe

Wenn etwas nicht funktioniert:

1. Überprüf die `.env` Datei
2. Schau in den Server-Logs
3. Teste die APIs einzeln mit Postman
4. Überprüf deine Internet-Verbindung

---

**Viel Erfolg! 🚀⚽**
