// Team image mapping
const teamImageMap = {
  "Chiefs": "chiefs.png",
  "Ravens": "ravens.png",
  "Eagles": "eagles.png",
  "Packers": "packers.png",
  "Falcons": "falcons.png",
  "Steelers": "steelers.png",
  "Bills": "bills.png",
  "Cardinals": "cardinals.png",
  "Bears": "bears.png",
  "Titans": "titans.png",
  "Bengals": "bengals.png",
  "Patriots": "patriots.png",
  "Colts": "colts.png",
  "Texans": "texans.png",
  "Dolphins": "dolphins.png",
  "Jaguars": "jaguars.png",
  "Saints": "saints.png",
  "Panthers": "panthers.png",
  "Giants": "giants.png",
  "Vikings": "vikings.png",
  "Chargers": "chargers.png",
  "Raiders": "raiders.png",
  "Seahawks": "seahawks.png",
  "Broncos": "broncos.png",
  "Browns": "browns.png",
  "Cowboys": "cowboys.png",
  "Buccaneers": "buccaneers.png",
  "Commanders": "commanders.png",
  "Rams": "rams.png",
  "Lions": "lions.png",
  "Jets": "jets.png",
  "49ers": "niners.png"
};

const playoffRoundHeaders = {
  19: 'wildcard.png',
  20: 'divisional.png',
  21: {
    afc: 'afc.png',
    nfc: 'nfc.png'
  },
  22: 'sblix.png'
};

function normalizeTeamClass(teamName) {
  return teamName === "49ers" ? "niners" : teamName.toLowerCase().replace(/[^a-z]/g, '');
}

function getTeamImage(teamName) {
  return teamImageMap[teamName] || normalizeTeamClass(teamName) + ".png";
}

function getConference(teamName) {
  const afcTeams = [
    "Chiefs", "Ravens", "Bills", "Bengals", 
    "Colts", "Texans", "Dolphins", "Patriots", 
    "Jets", "Steelers", "Titans", "Raiders", 
    "Chargers", "Broncos", "Browns", "Jaguars"
  ];
  return afcTeams.includes(teamName) ? 'afc' : 'nfc';
}

fetch('scores-2022.json')
  .then(response => response.json())
  .then(data => {
    const gamesByWeek = data.reduce((acc, game) => {
      const week = game.RoundNumber;
      if (!acc[week]) acc[week] = [];
      acc[week].push(game);
      return acc;
    }, {});

    const allWeeks = Object.keys(gamesByWeek).map(Number).sort((a, b) => a - b);
    const allTeams = Object.keys(teamImageMap);
    const container = document.getElementById('scoresgrid');
    container.innerHTML = '';

    const regularWeeks = allWeeks.filter(w => w <= 18);
    const playoffWeeks = allWeeks.filter(w => w > 18);

    const teamRecords = {};
    allTeams.forEach(team => {
      teamRecords[team] = { wins: 0, losses: 0, ties: 0 };
    });

    // Regular Season
    regularWeeks.forEach(weekNum => {
      const weekGames = gamesByWeek[weekNum] || [];
      const weekHeader = document.createElement('p');
      weekHeader.className = 'week';
      weekHeader.textContent = `WEEK ${weekNum}`;
      container.appendChild(weekHeader);

      weekGames.forEach(game => appendGame(container, game, teamRecords));

      const teamsPlayed = new Set();
      weekGames.forEach(game => {
        teamsPlayed.add(game.HomeTeam.split(" ").pop());
        teamsPlayed.add(game.AwayTeam.split(" ").pop());
      });

      allTeams.forEach(team => {
        const shortName = team === "49ers" ? "49ers" : team;
        if (!teamsPlayed.has(shortName)) {
          const byeDiv = document.createElement('div');
          byeDiv.className = `content-section scores ${normalizeTeamClass(team)} bye`;
          byeDiv.style.display = 'none';
          byeDiv.style.justifyContent = 'center';
          byeDiv.textContent = 'BYE';
          container.appendChild(byeDiv);
        }
      });
    });

    // Playoffs
    const playoffsHeader = document.createElement('p');
    playoffsHeader.className = 'week';
    playoffsHeader.textContent = '2022-23 NFL PLAYOFFS';
    container.appendChild(playoffsHeader);

    playoffWeeks.forEach(weekNum => {
      if (weekNum === 21) {
        const nfcGames = gamesByWeek[weekNum].filter(g => 
          getConference(g.HomeTeam.split(" ").pop()) === 'nfc' &&
          getConference(g.AwayTeam.split(" ").pop()) === 'nfc'
        );
        const afcGames = gamesByWeek[weekNum].filter(g => 
          getConference(g.HomeTeam.split(" ").pop()) === 'afc' &&
          getConference(g.AwayTeam.split(" ").pop()) === 'afc'
        );

        const nfcHeader = document.createElement('p');
        nfcHeader.className = 'week';
        nfcHeader.innerHTML = `<img src="img/${playoffRoundHeaders[21].nfc}" alt="NFC Championship">`;
        container.appendChild(nfcHeader);
        nfcGames.forEach(game => appendGame(container, game, teamRecords));

        const afcHeader = document.createElement('p');
        afcHeader.className = 'week';
        afcHeader.innerHTML = `<img src="img/${playoffRoundHeaders[21].afc}" alt="AFC Championship">`;
        container.appendChild(afcHeader);
        afcGames.forEach(game => appendGame(container, game, teamRecords));
      } else {
        const headerImg = playoffRoundHeaders[weekNum];
        const weekHeader = document.createElement('p');
        weekHeader.className = 'week';
        if (typeof headerImg === 'string') {
          weekHeader.innerHTML = `<img src="img/${headerImg}" alt="Playoff Round">`;
        } else {
          weekHeader.textContent = `WEEK ${weekNum}`;
        }
        container.appendChild(weekHeader);
        gamesByWeek[weekNum].forEach(game => appendGame(container, game, teamRecords));
      }
    });
  })
  .catch(error => {
    console.error('Error loading scores JSON:', error);
  });

function appendGame(container, game, teamRecords) {
  const awayTeam = game.AwayTeam.split(" ").pop();
  const homeTeam = game.HomeTeam.split(" ").pop();

  const awayTeamClass = normalizeTeamClass(awayTeam);
  const homeTeamClass = normalizeTeamClass(homeTeam);

  const awayImg = `img/${getTeamImage(awayTeam)}`;
  const homeImg = `img/${getTeamImage(homeTeam)}`;

  let scoreText;
  const isValidScore = game.AwayTeamScore !== null && game.HomeTeamScore !== null;

  if (!isValidScore) {
    scoreText = "DNF";
  } else {
    scoreText = `${game.AwayTeamScore}-${game.HomeTeamScore}`;
    if (game.AwayTeamScore > game.HomeTeamScore) {
      teamRecords[awayTeam].wins++;
      teamRecords[homeTeam].losses++;
    } else if (game.HomeTeamScore > game.AwayTeamScore) {
      teamRecords[homeTeam].wins++;
      teamRecords[awayTeam].losses++;
    } else {
      teamRecords[homeTeam].ties++;
      teamRecords[awayTeam].ties++;
    }
  }

  const awayRecord = teamRecords[awayTeam];
  const homeRecord = teamRecords[homeTeam];

  const awayRecordText = `${awayRecord.wins}-${awayRecord.losses}${awayRecord.ties > 0 ? `-${awayRecord.ties}` : ''}`;
  const homeRecordText = `${homeRecord.wins}-${homeRecord.losses}${homeRecord.ties > 0 ? `-${homeRecord.ties}` : ''}`;

  const gameDiv = document.createElement('div');
  gameDiv.className = `content-section scores ${awayTeamClass} ${homeTeamClass}`;
  gameDiv.style.display = 'flex';
  gameDiv.style.flexDirection = 'column';
  gameDiv.style.alignItems = 'center';

  const logosDiv = document.createElement('div');
  logosDiv.style.display = 'flex';
  logosDiv.style.alignItems = 'center';
  logosDiv.innerHTML = `
    <div style="text-align: center; margin-right: 10px;">
      <img src="${awayImg}" alt="${awayTeam} logo"><br>
      <div class="record">${awayRecordText}</div>
    </div>
    <div style="padding-bottom: 0.5rem;">${scoreText}</div>
    <div style="text-align: center; margin-left: 10px;">
      <img src="${homeImg}" alt="${homeTeam} logo"><br>
      <div class="record">${homeRecordText}</div>
    </div>
  `;

  gameDiv.appendChild(logosDiv);
  container.appendChild(gameDiv);
}

function showSection(team) {
  const container = document.getElementById('scoresgrid');
  const allGames = document.querySelectorAll('.scores');
  const matchingGames = document.querySelectorAll(`.scores.${team}`);

  allGames.forEach(el => {
    el.style.display = 'none';
  });

  matchingGames.forEach(el => {
    el.style.display = 'flex';
  });

  if (matchingGames.length === 1) {
    container.classList.add('single-game');
  } else {
    container.classList.remove('single-game');
  }
}

function showAll() {
  const container = document.getElementById('scoresgrid');
  container.classList.remove('single-game');

  document.querySelectorAll('.scores').forEach(el => {
    if (!el.classList.contains('bye')) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

window.onload = function () {
  document.querySelectorAll('.scores').forEach(el => {
    el.style.display = 'none';
  });
};