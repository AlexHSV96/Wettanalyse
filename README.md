# ⚽ WM 2026 Wett-Analyzer

Ein intelligenter Wett-Analyzer für Fußballspiele mit KI-gestützten Tipps und Quoten-Vergleich.

## 🎯 Features

- ✅ **Live-Spieldaten** von Football-Data.org
- ✅ **Intelligente Wetttipp-Analyse** mit Konfidenz-Scores
- ✅ **Kombinationswetten-Generator** für höhere Gewinne
- ✅ **Value-Bet Erkennung** für profitable Wetten
- ✅ **Bankroll-Management** Empfehlungen
- ✅ **Mehrere Wettbewerbe** (WM 2026, Bundesliga, Premier League, etc.)

## 📋 Requirements

- Node.js 14+ ([Download](https://nodejs.org))
- npm (kommt mit Node.js)
- API-Keys:
  - [Football-Data.org](https://www.football-data.org) (kostenlos)
  - [The Odds API](https://the-odds-api.com) (kostenlos, 500/Monat)

## 🚀 Installation

### 1. Repository klonen oder Dateien runterladen

```bash
git clone https://github.com/deinusername/wm-analyzer.git
cd wm-analyzer
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. .env Datei erstellen

```bash
# Kopiere .env.example zu .env
cp .env.example .env

# Öffne .env und trage deine API-Keys ein:
# FOOTBALL_DATA_KEY=dein_key_hier
# ODDS_API_KEY=dein_key_hier
```

### 4. Server starten

```bash
npm start
# oder
node server.js
```

Der Server läuft dann auf `http://localhost:3000`

### 5. Frontend öffnen

Öffne `wm-analyzer-with-backend.html` im Browser und verbinde dich mit `http://localhost:3000`

## 📡 Deployment mit Vercel

### Vorbereitung

1. Repository zu GitHub pushen
2. Vercel Account erstellen: [vercel.com](https://vercel.com)
3. Mit GitHub verbinden

### Environment Variables setzen

Bevor du auf "Deploy" klickst, gib ein:

```
FOOTBALL_DATA_KEY=dein_key_hier
ODDS_API_KEY=dein_key_hier
PORT=3000
```

### Deploy!

Deine App läuft dann unter: `https://wm-analyzer.vercel.app`

## 📁 Dateistruktur

```
wm-analyzer/
├── server.js                        # Node.js Backend
├── wm-analyzer-with-backend.html    # Frontend
├── package.json                     # Dependencies
├── .env.example                     # Template für Keys
├── .env                            # Deine privaten Keys (nicht committen!)
├── .gitignore                      # Was Git ignoriert
├── README.md                       # Diese Datei
└── SETUP.md                        # Detaillierte Setup-Anleitung
```

## 🔐 Sicherheit

### API-Keys schützen

- ❌ **NIEMALS** Keys direkt in Code eingeben
- ✅ Nutze `.env` Datei für lokale Entwicklung
- ✅ Bei Vercel: Environment Variables verwenden
- ✅ `.gitignore` verhindert, dass `.env` zu GitHub gepusht wird

### .env Datei

Die `.env` Datei:
- Wird von `.gitignore` geschützt
- Bleibt lokal auf deinem PC
- Wird bei Vercel als Environment Variable eingegeben
- Ist nie öffentlich sichtbar

## 📚 API Dokumentation

### GET /api/matches?competition=WC

Lädt Spiele eines Wettbewerbs

**Parameter:**
- `competition`: Wettbewerbs-Code (WC, PL, BL1, SA, PD)

**Antwort:**
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

Analysiert deine ausgewählten Wetten

**Request:**
```json
{
  "matches": [...],
  "bets": {
    "1": "home",
    "2": "away"
  }
}
```

**Antwort:**
```json
{
  "success": true,
  "tips": [...],
  "combos": [...]
}
```

## 🎓 Anleitung & Guides

- **[SETUP.md](./SETUP.md)** - Detaillierte Installation
- **[GITHUB_ANLEITUNG.html](./GITHUB_ANLEITUNG.html)** - GitHub Upload
- **[ENV_ERKLAERT.html](./ENV_ERKLAERT.html)** - .env Datei erklärt
- **[DEPLOYMENT_GUIDE.html](./DEPLOYMENT_GUIDE.html)** - Online stellen

## 🛠️ Entwicklung

### Abhängigkeiten

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "axios": "^1.4.0",
  "dotenv": "^16.3.1"
}
```

### Development Mode mit nodemon

```bash
npm install -D nodemon
nodemon server.js
```

## 🐛 Troubleshooting

### "Port 3000 ist bereits in Verwendung"

```bash
# Nutze einen anderen Port
PORT=3001 node server.js
```

### "Cannot find module 'express'"

```bash
# Dependencies installieren
npm install
```

### "API Key ungültig"

1. Überprüfe deine `.env` Datei
2. Verify die API-Keys auf den Websites
3. Startest du den Server neu?

### "Verbindungsfehler im Browser"

1. Server läuft? (`node server.js`)
2. Richtige URL? (`http://localhost:3000`)
3. Firewall blockiert Port 3000?

## 📞 Support

- 📖 Dokumentation: Siehe oben
- 🐛 Issues: Erstelle ein GitHub Issue
- 💬 Diskussionen: GitHub Discussions

## 📄 Lizenz

MIT License - Frei nutzbar!

## 🙏 Danke

- [Football-Data.org](https://www.football-data.org) - Spieldaten
- [The Odds API](https://the-odds-api.com) - Wettquoten
- [Express.js](https://expressjs.com) - Web Framework

---

**Viel Spaß mit deinem WM Analyzer! ⚽🚀**
