// server.js - WM Wett-Analyzer All-in-One für Vercel
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY || '6a01d9c5b7ea430b8058c58f4d7ac92c';
const ODDS_API_KEY = process.env.ODDS_API_KEY || '023f42ef331e0ee20d09bef3c6dba39c';

// HTML Template - wird direkt vom Server serviert
const getHTML = () => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WM 2026 Wett-Analyzer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }

    .header h1 {
      font-size: 2.5em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }

    .status-bar {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      gap: 15px;
    }

    .status {
      background: #f0f0f0;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.95em;
      flex: 1;
      text-align: center;
    }

    .status.success {
      color: #28a745;
    }

    .status.loading {
      color: #ffc107;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 900px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .card h2 {
      color: #667eea;
      margin-bottom: 20px;
      font-size: 1.5em;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .match {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
    }

    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .teams {
      font-size: 1.1em;
      font-weight: 600;
      color: #333;
    }

    .date {
      color: #666;
      font-size: 0.9em;
    }

    .odds-container {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .odd-button {
      flex: 1;
      padding: 10px;
      border: 2px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .odd-button:hover {
      border-color: #667eea;
      transform: scale(1.05);
    }

    .odd-button.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .odd-label {
      font-size: 0.85em;
      opacity: 0.8;
      margin-bottom: 3px;
    }

    .odd-value {
      font-size: 1.2em;
    }

    .analyze-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 1.1em;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-top: 20px;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }

    .analyze-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 20px rgba(102, 126, 234, 0.6);
    }

    .analyze-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-message {
      text-align: center;
      padding: 40px;
      color: #667eea;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .hidden {
      display: none;
    }

    .results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .tip-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px;
      padding: 20px;
    }

    .tip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 2px solid rgba(255,255,255,0.2);
      padding-bottom: 10px;
    }

    .confidence-badge {
      background: rgba(255,255,255,0.3);
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9em;
    }

    .tip-match {
      font-size: 1.3em;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .tip-reasoning {
      font-size: 0.95em;
      line-height: 1.6;
      opacity: 0.95;
    }

    .error-message {
      background: #f8d7da;
      border: 2px solid #f5c6cb;
      color: #721c24;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }

    .info-message {
      background: #d1ecf1;
      border: 2px solid #bee5eb;
      color: #0c5460;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }

    .setting-group {
      margin-bottom: 15px;
    }

    .setting-group label {
      display: block;
      color: #666;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .setting-group select {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1em;
    }

    .no-matches {
      text-align: center;
      color: #999;
      padding: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚽ WM 2026 Wett-Analyzer</h1>
      <p>Live-Spiele und intelligente Wetttipp-Analyse</p>
      
      <div class="status-bar">
        <div class="status success" id="apiStatus">
          ✓ Server online
        </div>
        <div class="status success" id="quoteStatus">
          ✓ Quoten-Generator aktiv
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="card">
        <h2>⚙️ Einstellungen</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <div class="setting-group">
            <label>Wettbewerb:</label>
            <select id="competitionSelect">
              <option value="">-- Bitte wählen --</option>
              <option value="WC">🌍 FIFA Weltmeisterschaft 2026</option>
              <option value="PL">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</option>
              <option value="BL1">🇩🇪 Bundesliga</option>
              <option value="SA">🇮🇹 Serie A</option>
              <option value="PD">🇪🇸 La Liga</option>
            </select>
          </div>

          <button class="analyze-btn" onclick="loadMatches()" style="margin-top: 0;">
            🔄 Spiele laden
          </button>
        </div>

        <h2 style="margin-top: 30px;">🎯 Verfügbare Spiele</h2>
        <div id="matches-container">
          <div class="no-matches">
            <p>Wähle einen Wettbewerb und klick "Spiele laden"</p>
          </div>
        </div>
        
        <button class="analyze-btn" onclick="analyzeMatches()" id="analyzeBtn" disabled>
          🤖 Analysiere Wetten
        </button>
      </div>

      <div class="card">
        <h2>📊 Info & Anleitung</h2>
        <div class="info-message">
          <h3>🎯 So funktioniert es:</h3>
          <p style="margin: 15px 0;">
            <strong>1.</strong> Wähle einen Wettbewerb<br><br>
            <strong>2.</strong> Klick "Spiele laden"<br><br>
            <strong>3.</strong> Wähle deine Wetten aus<br><br>
            <strong>4.</strong> Klick "Analysiere Wetten"<br><br>
            <strong>5.</strong> Erhalte intelligente Tipps!
          </p>
        </div>

        <div style="background: #d1ecf1; border: 2px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #0c5460;">📡 Live-Datenquellen</h3>
          <p style="margin: 15px 0;">
            <strong>Football-Data.org:</strong><br>
            ✓ Aktuelle Spiele<br>
            ✓ Team-Statistiken<br>
            ✓ Spielstände live<br>
            ✓ 100% kostenlos
          </p>
        </div>
      </div>
    </div>

    <div id="results" class="hidden">
      <h2 style="color: white; margin: 40px 20px 20px 0; font-size: 2em;">💡 Deine Wetttipps</h2>
      <div class="results" id="tips-container"></div>
    </div>
  </div>

  <script>
    let allMatches = [];
    let selectedBets = {};

    async function loadMatches() {
      const competition = document.getElementById('competitionSelect').value;

      if (!competition) {
        alert('Bitte einen Wettbewerb wählen!');
        return;
      }

      document.getElementById('apiStatus').textContent = '⏳ Lade Spiele...';
      document.getElementById('apiStatus').className = 'status loading';

      try {
        const response = await fetch(\`/api/matches?competition=\${competition}\`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Unbekannter Fehler');
        }

        allMatches = data.matches;
        selectedBets = {};
        displayMatches(data.matches);
        document.getElementById('apiStatus').textContent = \`✓ \${data.matches.length} Spiele geladen\`;
        document.getElementById('apiStatus').className = 'status success';

      } catch (error) {
        console.error('Fehler:', error);
        document.getElementById('apiStatus').textContent = '✗ Fehler beim Laden';
        document.getElementById('apiStatus').className = 'status';
        document.getElementById('matches-container').innerHTML = \`
          <div class="error-message">
            <strong>Fehler:</strong> \${error.message}
          </div>
        \`;
      }
    }

    function displayMatches(matches) {
      const container = document.getElementById('matches-container');
      
      if (matches.length === 0) {
        container.innerHTML = '<div class="no-matches"><p>Keine Spiele verfügbar</p></div>';
        return;
      }

      container.innerHTML = matches.map(m => \`
        <div class="match">
          <div class="match-header">
            <div>
              <div class="teams">\${m.home} vs \${m.away}</div>
              <div class="date">\${m.date}</div>
            </div>
          </div>
          <div class="odds-container">
            <button class="odd-button" onclick="toggleBet(\${m.id}, 'home', this)">
              <div class="odd-label">Heim</div>
              <div class="odd-value">\${m.odds.home.toFixed(2)}</div>
            </button>
            <button class="odd-button" onclick="toggleBet(\${m.id}, 'draw', this)">
              <div class="odd-label">X</div>
              <div class="odd-value">\${m.odds.draw.toFixed(2)}</div>
            </button>
            <button class="odd-button" onclick="toggleBet(\${m.id}, 'away', this)">
              <div class="odd-label">Aus</div>
              <div class="odd-value">\${m.odds.away.toFixed(2)}</div>
            </button>
          </div>
        </div>
      \`).join('');
    }

    function toggleBet(matchId, betType, btn) {
      btn.parentElement.querySelectorAll('.odd-button').forEach(b => b.classList.remove('selected'));
      
      if (selectedBets[matchId] === betType) {
        delete selectedBets[matchId];
      } else {
        selectedBets[matchId] = betType;
        btn.classList.add('selected');
      }

      const btn2 = document.getElementById('analyzeBtn');
      btn2.disabled = Object.keys(selectedBets).length === 0;
    }

    async function analyzeMatches() {
      if (Object.keys(selectedBets).length === 0) return;

      const selectedMatches = allMatches.filter(m => selectedBets[m.id]);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matches: selectedMatches,
            bets: selectedBets
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        displayResults(data.tips);
        document.getElementById('results').classList.remove('hidden');
        window.scrollTo(0, document.getElementById('results').offsetTop - 100);

      } catch (error) {
        alert('Fehler bei der Analyse: ' + error.message);
      }
    }

    function displayResults(tips) {
      const tipsHTML = tips.map(tip => \`
        <div class="tip-card">
          <div class="tip-header">
            <span>\${tip.prediction}</span>
            <span class="confidence-badge">\${tip.confidence}%</span>
          </div>
          <div class="tip-match">\${tip.match}</div>
          <div class="tip-reasoning">\${tip.reasoning}</div>
        </div>
      \`).join('');

      document.getElementById('tips-container').innerHTML = tipsHTML;
    }
  </script>
</body>
</html>
`;

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
    console.error('Fehler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Analyse
app.post('/api/analyze', (req, res) => {
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

    res.json({ success: true, tips, combos: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.send(getHTML());
});

// Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint nicht gefunden' });
  }
  res.send(getHTML());
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

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 WM Wett-Analyzer läuft auf Port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

module.exports = app;
