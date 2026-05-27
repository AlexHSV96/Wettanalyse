// server.js - WM Wett-Analyzer Backend für Vercel
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve statische Dateien
app.use(express.static(path.join(__dirname)));

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY || '6a01d9c5b7ea430b8058c58f4d7ac92c';
const ODDS_API_KEY = process.env.ODDS_API_KEY || '023f42ef331e0ee20d09bef3c6dba39c';

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WM Wett-Analyzer läuft!' });
});

// API: Spiele laden
app.get('/api/matches', async (req, res) => {
  try {
    const { competition } = req.query;

    if (!competition) {
      return res.status(400).json({ error: 'Competition erforderlich' });
    }

    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/${competition}/matches?status=SCHEDULED,LIVE,FINISHED`,
      {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY },
        timeout: 10000
      }
    );

    const matches = response.data.matches
      .filter(m => m.homeTeam && m.awayTeam)
      .slice(0, 10)
      .map(m => ({
        id: m.id,
        home: m.homeTeam.name,
        away: m.awayTeam.name,
        date: new Date(m.utcDate).toLocaleString('de-DE'),
        status: m.status,
        score: m.score?.fullTime ? `${m.score.fullTime.home}:${m.score.fullTime.away}` : null,
        odds: generateOdds(m.homeTeam.name, m.awayTeam.name)
      }));

    res.json({ success: true, matches });
  } catch (error) {
    console.error('Fehler beim Laden der Matches:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// API: Quoten laden
app.get('/api/odds', async (req, res) => {
  try {
    const { sport } = req.query;

    if (!sport) {
      return res.status(400).json({ error: 'Sport erforderlich' });
    }

    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h`,
      { timeout: 10000 }
    );

    res.json({ success: true, odds: response.data.data });
  } catch (error) {
    console.error('Fehler beim Laden der Quoten:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API: Analyse
app.post('/api/analyze', async (req, res) => {
  try {
    const { matches, bets } = req.body;

    const tips = [];

    for (const match of matches) {
      const betType = bets[match.id];
      if (!betType) continue;

      const analysis = analyzeBet(match, betType);
      tips.push({
        match: `${match.home} vs ${match.away}`,
        prediction: getPredictionText(betType),
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        isValueBet: analysis.isValueBet,
        odds: match.odds[betType]
      });
    }

    const combos = generateCombinations(tips);

    res.json({ success: true, tips, combos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve HTML für Root
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'wm-analyzer-with-backend.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).json({ 
      error: 'HTML Datei nicht gefunden',
      looking_for: htmlPath,
      current_dir: __dirname
    });
  }
});

// Fallback für alle anderen Routes → HTML
app.get('*', (req, res) => {
  // Ignoriere API und statische Dateien
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint nicht gefunden' });
  }
  
  const htmlPath = path.join(__dirname, 'wm-analyzer-with-backend.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).json({ 
      error: 'HTML Datei nicht gefunden',
      path: req.path
    });
  }
});

// Hilfsfunktionen
function generateOdds(homeTeam, awayTeam) {
  let homeOdds = 2.0;
  let drawOdds = 3.0;
  let awayOdds = 2.0;

  const topTeams = ['Manchester', 'Bayern', 'PSG', 'Real', 'Liverpool', 'Arsenal', 'Juventus', 'Barcelona', 'France', 'Germany', 'Argentina', 'Brazil'];
  
  const homeIsTopTeam = topTeams.some(t => homeTeam.includes(t));
  const awayIsTopTeam = topTeams.some(t => awayTeam.includes(t));

  if (homeIsTopTeam && !awayIsTopTeam) {
    homeOdds = 1.85;
    drawOdds = 3.20;
    awayOdds = 4.50;
  } else if (!homeIsTopTeam && awayIsTopTeam) {
    homeOdds = 4.50;
    drawOdds = 3.20;
    awayOdds = 1.85;
  }

  return {
    home: parseFloat(homeOdds.toFixed(2)),
    draw: parseFloat(drawOdds.toFixed(2)),
    away: parseFloat(awayOdds.toFixed(2))
  };
}

function analyzeBet(match, betType) {
  let baseConfidence = 50;
  const odds = match.odds[betType];

  baseConfidence = Math.round(100 / odds);
  baseConfidence = Math.min(95, Math.max(50, baseConfidence));

  const impliedProb = 1 / odds;
  const expectedValue = (baseConfidence / 100) / impliedProb;
  const isValueBet = expectedValue > 1.05;

  let reasoning = '';
  if (betType === 'home') {
    reasoning = `${match.home} Heimvorteil. Quote ${odds.toFixed(2)} ist ${isValueBet ? 'attraktiv' : 'fair'}.`;
  } else if (betType === 'away') {
    reasoning = `${match.away} starke Form. Quote ${odds.toFixed(2)} bietet gutes Value.`;
  } else {
    reasoning = `Ausgeglichenes Spiel. Quote ${odds.toFixed(2)} für Unentschieden.`;
  }

  return {
    confidence: baseConfidence,
    reasoning,
    isValueBet,
    expectedValue: expectedValue.toFixed(2)
  };
}

function getPredictionText(type) {
  const texts = {
    home: '🏆 Heimsieg',
    draw: '🤝 Unentschieden',
    away: '⚡ Auswärtssieg'
  };
  return texts[type];
}

function generateCombinations(tips) {
  const combos = [];

  if (tips.length >= 2) {
    const combo2 = tips.slice(0, 2);
    const odds2 = combo2.reduce((acc, t) => acc * t.odds, 1).toFixed(2);
    const conf2 = Math.round(combo2.reduce((acc, t) => acc + t.confidence, 0) / combo2.length);
    
    combos.push({
      bets: combo2.map(t => `${t.match}: ${t.prediction}`),
      odds: odds2,
      confidence: conf2,
      expectedReturn: `Bei 100€: ${(100 * odds2).toFixed(0)}€`
    });
  }

  if (tips.length >= 3) {
    const combo3 = tips.slice(0, 3);
    const odds3 = combo3.reduce((acc, t) => acc * t.odds, 1).toFixed(2);
    const conf3 = Math.round(combo3.reduce((acc, t) => acc + t.confidence, 0) / combo3.length);
    
    combos.push({
      bets: combo3.map(t => `${t.match}: ${t.prediction}`),
      odds: odds3,
      confidence: conf3,
      expectedReturn: `Bei 100€: ${(100 * odds3).toFixed(0)}€`
    });
  }

  return combos;
}

// Server starten
const server = app.listen(PORT, () => {
  console.log(`🚀 WM Wett-Analyzer Server läuft auf Port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`\n✓ API Endpoints verfügbar`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('Server wird heruntergefahren...');
  server.close();
});
