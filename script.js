// TypeMaster Pro - App Logic
const app = document.getElementById('app');
const darkBtn = document.getElementById('darkModeToggle');
const typeSound = document.getElementById('type-sound');
let soundOn = true;

// Dark mode toggle
darkBtn.onclick = () => {
  document.body.classList.toggle('dark-mode');
  darkBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Sound toggle utility
function toggleSound(btn) {
  soundOn = !soundOn;
  btn.textContent = soundOn ? '🔊' : '🔇';
}

// Navigation
function showMode(mode) {
  app.innerHTML = '';
  if (mode === 'word') renderWordTyping();
  else if (mode === 'paragraph') renderParagraphTyping();
}

// Home navigation
function showHome() {
  app.innerHTML = '';
  window.scrollTo(0, 0);
}

// ----- Word Typing Mode -----
const words = {
  english: {
    beginner: ["cat","dog","sun","book","fish","pen","car","star","bird","tree"],
    intermediate: ["yellow","purple","window","guitar","planet","student","orange","shadow","pencil","flower"],
    advanced: ["magnificent","psychology","rhythm","awkward","knowledge","acquaintance","bizarre","substantial","phenomenon","miscellaneous"]
  },
  hindi: {
    beginner: ["घर","नाम","पानी","आसमान","खाना","फूल","पिता","माँ","सूरज","चाँद"],
    intermediate: ["विद्यालय","पुस्तक","संगीत","रंग","परिवार","मित्र","समाचार","स्वास्थ्य","प्रकृति","शक्ति"],
    advanced: ["अविस्मरणीय","संगठित","प्रवृत्ति","सारांश","विवेचना","प्रत्युत्तर","अनुवाद","समझौता","संविधान","निरंतरता"]
  }
};

function renderWordTyping() {
  let lang = 'english', level = 'beginner', idx = 0, total = 20;
  let correct = 0, mistakes = 0, charsTyped = 0, startTime, isPaused = false, inputVal = '';
  let currentWords = [];
  let wpm = 0, accuracy = 0;
  let interval, elapsed = 0;

  function resetStats() {
    idx = 0; correct = 0; mistakes = 0; charsTyped = 0; inputVal = '';
    wpm = 0; accuracy = 0; elapsed = 0; isPaused = false;
    currentWords = Array.from({length: total}, () => {
      let arr = words[lang][level];
      return arr[Math.floor(Math.random() * arr.length)];
    });
  }

  function startGame() {
    resetStats();
    renderTypingUI();
    startTime = Date.now();
    interval = setInterval(()=>{ if (!isPaused) updateStats(); }, 1000);
  }

  function updateStats() {
    elapsed = Math.floor((Date.now() - startTime)/1000);
    wpm = Math.round((correct / elapsed) * 60) || 0;
    accuracy = Math.round((correct / (correct + mistakes + 1e-9)) * 100) || 0;
    document.getElementById('wpm').textContent = `WPM: ${wpm}`;
    document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
    document.getElementById('mistakes').textContent = `Mistakes: ${mistakes}`;
  }

  function validateInput(evt) {
    let val = evt.target.value;
    let word = currentWords[idx];
    charsTyped += val.length - inputVal.length;
    inputVal = val;
    let inputBox = evt.target;
    if (val === word) {
      inputBox.classList.remove('input-invalid');
      inputBox.classList.add('input-valid');
      if (soundOn) typeSound.play();
      setTimeout(()=>{
        idx++;
        inputBox.value = '';
        inputBox.classList.remove('input-valid');
        if (idx < total) renderTypingUI();
        else showResult();
      }, 200);
      correct++;
      updateStats();
    } else if (val && word.indexOf(val) !== 0) {
      inputBox.classList.add('input-invalid');
      mistakes++;
      if (soundOn) typeSound.play();
      updateStats();
    } else {
      inputBox.classList.remove('input-invalid');
      inputBox.classList.remove('input-valid');
    }
  }

  function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pauseWordBtn').textContent = isPaused ? 'Resume' : 'Pause';
  }

  function renderTypingUI() {
    app.innerHTML = `
      <section class="mode-container fade-in" aria-label="Word Typing Practice">
        <div class="mode-title">Word Typing</div>
        <form class="mode-form" autocomplete="off" onsubmit="return false">
          <label>
            Language:
            <select id="langSelect" aria-label="Language">
              <option value="english" ${lang==='english'?'selected':''}>English</option>
              <option value="hindi" ${lang==='hindi'?'selected':''}>Hindi</option>
            </select>
          </label>
          <label>
            Level:
            <select id="levelSelect" aria-label="Level">
              <option value="beginner" ${level==='beginner'?'selected':''}>Beginner</option>
              <option value="intermediate" ${level==='intermediate'?'selected':''}>Intermediate</option>
              <option value="advanced" ${level==='advanced'?'selected':''}>Advanced</option>
            </select>
          </label>
          <button type="button" class="neon-btn" id="startWordBtn">Start</button>
        </form>
      </section>
    `;
    document.getElementById('langSelect').onchange = e => lang = e.target.value;
    document.getElementById('levelSelect').onchange = e => level = e.target.value;
    document.getElementById('startWordBtn').onclick = startRound;
  }

  function startRound() {
    startGame();
    showWord();
  }

  function showWord() {
    app.innerHTML = `
      <section class="mode-container fade-in">
        <div class="mode-title">Word Typing (${lang}, ${level})</div>
        <div class="stats-bar">
          <span id="wpm">WPM: ${wpm}</span>
          <span id="accuracy">Accuracy: ${accuracy}%</span>
          <span id="mistakes">Mistakes: ${mistakes}</span>
        </div>
        <div class="paragraph-box" style="text-align:center;font-size:2em;">
          <span>${currentWords[idx]}</span>
        </div>
        <input class="typing-input" id="wordInput" type="text" aria-label="Type the word" autocomplete="off" autofocus/>
        <div class="mode-actions">
          <button class="neon-btn" onclick="showHome()">Home</button>
          <button class="pause-btn" id="pauseWordBtn">Pause</button>
          <button class="toggle-sound" id="wordSoundBtn" title="Toggle Typing Sound">🔊</button>
        </div>
      </section>
    `;
    document.getElementById('wordInput').addEventListener('input', validateInput);
    document.getElementById('pauseWordBtn').onclick = pauseGame;
    document.getElementById('wordSoundBtn').onclick = function() { toggleSound(this); };
    document.getElementById('wordInput').focus();
  }

  function showResult() {
    clearInterval(interval);
    updateStats();
    app.innerHTML = `
      <section class="mode-container result-screen fade-in">
        <div class="score">🏆</div>
        <div class="result-message">Great Job!</div>
        <div>WPM: ${wpm} | Accuracy: ${accuracy}% | Mistakes: ${mistakes} | Time: ${elapsed}s</div>
        <div class="mode-actions">
          <button class="neon-btn" onclick="renderWordTyping()">Retry</button>
          <button class="neon-btn" onclick="showHome()">Home</button>
        </div>
      </section>
    `;
  }

  renderTypingUI();
}

// ----- Paragraph Typing Mode -----
function renderParagraphTyping() {
  // Level, state, progress, paragraphs loaded from paragraphs.js
  let level = Number(localStorage.getItem('tmpro_level')) || 1;
  let maxLevel = 100;
  let stats = { wpm:0, accuracy:0, mistakes:0, time:0 };
  let started = false, startTime, elapsed=0, isPaused = false;
  let inputVal = '', interval, paragraph, quote = '';

  function loadParagraph() {
    paragraph = paragraphs.find(p => p.level === level);
    if (!paragraph) paragraph = paragraphs[0];
  }

  function startGame() {
    started = true;
    inputVal = '';
    stats = {wpm:0, accuracy:0, mistakes:0, time:0 };
    startTime = Date.now();
    interval = setInterval(()=>{ if (!isPaused) updateStats(); }, 1000);
    renderTypingUI();
    document.getElementById('paragraphInput').focus();
  }

  function updateStats() {
    elapsed = Math.floor((Date.now() - startTime)/1000);
    let wordsTyped = inputVal.trim().split(/\s+/).length;
    stats.wpm = Math.round((wordsTyped / elapsed) * 60) || 0;
    let correctChars = 0;
    let mistakesCount = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (inputVal[i] === paragraph.text[i]) correctChars++;
      else mistakesCount++;
    }
    stats.mistakes = mistakesCount;
    stats.accuracy = Math.round((correctChars / (inputVal.length+1e-9)) * 100) || 0;
    stats.time = elapsed;
    document.getElementById('pwpm').textContent = `WPM: ${stats.wpm}`;
    document.getElementById('paccuracy').textContent = `Accuracy: ${stats.accuracy}%`;
    document.getElementById('pmistakes').textContent = `Mistakes: ${stats.mistakes}`;
    document.getElementById('ptime').textContent = `Time: ${stats.time}s`;
  }

  function validateInput(evt) {
    inputVal = evt.target.value;
    let inputBox = evt.target;
    let isMatch = paragraph.text.indexOf(inputVal) === 0;
    if (isMatch) {
      inputBox.classList.remove('input-invalid');
      inputBox.classList.add('input-valid');
      if (soundOn) typeSound.play();
    } else {
      inputBox.classList.remove('input-valid');
      inputBox.classList.add('input-invalid');
      if (soundOn) typeSound.play();
    }
    if (inputVal === paragraph.text) {
      setTimeout(showResult, 300);
    }
  }

  function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pauseParaBtn').textContent = isPaused ? 'Resume' : 'Pause';
  }

  function renderTypingUI() {
    loadParagraph();
    app.innerHTML = `
      <section class="mode-container fade-in" aria-label="Paragraph Typing Practice">
        <div class="mode-title">Paragraph Typing <span style="font-size:0.7em;">(Level ${level})</span></div>
        <div class="stats-bar">
          <span id="pwpm">WPM: ${stats.wpm}</span>
          <span id="paccuracy">Accuracy: ${stats.accuracy}%</span>
          <span id="pmistakes">Mistakes: ${stats.mistakes}</span>
          <span id="ptime">Time: ${stats.time}s</span>
        </div>
        <div class="paragraph-box">${paragraph.text}</div>
        <textarea class="typing-input" id="paragraphInput" rows="5" aria-label="Type the paragraph" autocomplete="off"></textarea>
        <div class="mode-actions">
          <button class="neon-btn" onclick="showHome()">Home</button>
          <button class="pause-btn" id="pauseParaBtn">Pause</button>
          <button class="toggle-sound" id="paraSoundBtn" title="Toggle Typing Sound">🔊</button>
        </div>
      </section>
    `;
    document.getElementById('paragraphInput').addEventListener('input', validateInput);
    document.getElementById('pauseParaBtn').onclick = pauseGame;
    document.getElementById('paraSoundBtn').onclick = function() { toggleSound(this); };
    document.getElementById('paragraphInput').focus();
  }

  function showResult() {
    clearInterval(interval);
    updateStats();
    let motivationalMsg = "Fantastic work! Keep going!";
    let badgeHtml = '';
    let quoteHtml = '';
    if (level % 10 === 0 && level !== 100) {
      quote = motivationalQuotes[Math.floor(Math.random()*motivationalQuotes.length)];
      quoteHtml = `<div class="motivational-quote">"${quote}"</div>`;
    }
    if (level === 100) {
      badgeHtml = `<div class="badge">🏆 Champion Badge!<br>
        <a href="${window.location.href}" target="_blank">Share your achievement!</a></div>`;
      motivationalMsg = "You're a TypeMaster Pro Champion!";
    }
    app.innerHTML = `
      <section class="mode-container result-screen fade-in">
        <div class="score">Level ${level}</div>
        <div class="result-message">${motivationalMsg}</div>
        ${badgeHtml}
        <div>WPM: ${stats.wpm} | Accuracy: ${stats.accuracy}% | Mistakes: ${stats.mistakes} | Time: ${stats.time}s</div>
        ${quoteHtml}
        <div class="mode-actions">
          ${level<maxLevel ? `<button class="neon-btn" onclick="nextLevel()">Next Level</button>` : ''}
          <button class="neon-btn" onclick="restartLevel()">Repeat Level</button>
          <button class="neon-btn" onclick="showHome()">Home</button>
        </div>
      </section>
    `;
    saveProgress();
  }

  function nextLevel() {
    level = Math.min(maxLevel, level+1);
    localStorage.setItem('tmpro_level', level);
    started = false;
    renderParagraphTyping();
  }
  function restartLevel() {
    started = false;
    renderParagraphTyping();
  }
  function saveProgress() {
    localStorage.setItem('tmpro_level', level);
  }

  if (!started) {
    loadParagraph();
    app.innerHTML = `
      <section class="mode-container fade-in" aria-label="Paragraph Typing Practice">
        <div class="mode-title">Paragraph Typing <span style="font-size:0.7em;">(Level ${level})</span></div>
        <div class="paragraph-box">${paragraph.text}</div>
        <div class="mode-actions">
          <button class="neon-btn" onclick="startGame()">Start Level</button>
          <button class="neon-btn" onclick="showHome()">Home</button>
        </div>
      </section>
    `;
  } else {
    renderTypingUI();
  }
}

// Motivational Quotes
const motivationalQuotes = [
  "Keep pushing your limits!",
  "Every keystroke counts!",
  "Mistakes mean progress.",
  "You're unstoppable!",
  "Great typists are made one letter at a time.",
  "Believe in your speed.",
  "Accuracy is the key to mastery.",
  "Consistency creates champions.",
  "You are getting better every level.",
  "Type, learn, repeat!"
];

// Accessibility - keyboard navigation
document.body.addEventListener('keydown', function(e){
  if (e.key === "Escape") showHome();
});

// On load, show home screen
showHome();
