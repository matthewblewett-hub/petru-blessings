/* ─── APP LOGIC ─────────────────────────────────────────────── */

const START_DATE = new Date('2026-06-07T00:00:00'); // Petru's 56th birthday
let currentDay = 1; // 1-indexed

// ── Helpers ──────────────────────────────────────────────────────
function getDayForToday() {
  const now = new Date();
  const diff = Math.floor((now - START_DATE) / 86400000);
  if (diff < 0) return 1;          // before birthday → show Day 1
  if (diff >= 365) return 365;     // after the year → show last
  return diff + 1;
}

function getDateForDay(dayNum) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + (dayNum - 1));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function parseVerse(v) {
  // Split "Reference – 'Quote text.'"
  const m = v.match(/^(.+?)\s*[–—-]\s*['"'](.+)['"']\.?$/);
  if (m) return { ref: m[1].trim(), text: m[2].trim() };
  return { ref: '', text: v };
}

// ── Build one card DOM ─────────────────────────────────────────
function buildCard(data) {
  const { day, photo, message, verse, love } = data;
  const v = parseVerse(verse);
  const dateStr = getDateForDay(day);
  const todayDayNum = getDayForToday();

  const card = document.createElement('div');
  card.className = 'blessing-card' + (day === todayDayNum ? ' today-card' : '');
  card.id = `card-${day}`;
  card.innerHTML = `
    <div class="card-photo-wrap" data-photo="${photo}" title="Tap to enlarge">
      <img src="${photo}" alt="Day ${day} photo" loading="lazy" decoding="async">
      <div class="card-photo-gradient"></div>
      <span class="card-day-badge">Day ${day}</span>
      <span class="card-date-badge">${dateStr}</span>
    </div>
    <div class="card-body">

      <!-- Bible Verse -->
      <div class="verse-block">
        <div class="section-label">
          <div class="section-icon verse-icon">📖</div>
          <span>Today's Scripture</span>
        </div>
        <p class="verse-text">"${v.text}"</p>
        ${v.ref ? `<p class="verse-ref">— ${v.ref}</p>` : ''}
      </div>

      <!-- Message from Matt -->
      <div class="message-block">
        <div class="section-label">
          <div class="section-icon msg-icon">✍️</div>
          <span>A Blessing from Matt</span>
        </div>
        <p class="message-text">${message}</p>
        ${data.source ? `<p class="message-source">— from <em>${data.source}</em></p>` : ''}
      </div>

      <!-- I Love You Because -->
      <div class="love-block">
        <p class="love-label">I love you because…</p>
        <p class="love-text">${love}</p>
      </div>

    </div>
  `;

  // Photo zoom
  card.querySelector('.card-photo-wrap').addEventListener('click', () => {
    openPhotoViewer(photo);
  });

  return card;
}

// ── Render current card ────────────────────────────────────────
function showDay(dayNum, direction) {
  const track = document.getElementById('card-track');
  const existing = track.querySelector('.blessing-card.active');
  const data = DAYS[dayNum - 1];

  const newCard = buildCard(data);
  newCard.classList.add('active');

  if (existing) {
    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass  = direction === 'next' ? 'slide-in-left'  : 'slide-in-right';
    existing.classList.add(outClass);
    newCard.classList.add(inClass);
    existing.addEventListener('animationend', () => existing.remove(), { once: true });
    track.appendChild(newCard);
  } else {
    track.appendChild(newCard);
  }

  currentDay = dayNum;
  updateNav();
}

function updateNav() {
  const todayNum = getDayForToday();
  document.getElementById('day-counter').textContent = `Day ${currentDay} of 365`;
  document.getElementById('prev-btn').disabled = (currentDay <= 1);
  document.getElementById('next-btn').disabled = (currentDay >= 365);

  // Today pill
  const pill = document.getElementById('today-pill');
  const pillText = document.getElementById('today-pill-text');
  if (currentDay === todayNum) {
    pillText.textContent = `Day ${todayNum} · Today 🎂`;
    pill.style.display = 'flex';
  } else {
    pillText.textContent = `Today is Day ${todayNum}`;
    pill.style.display = 'flex';
  }

  document.getElementById('day-counter').textContent = `Day ${currentDay} of 365`;
}

// ── Navigation ─────────────────────────────────────────────────
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentDay > 1) showDay(currentDay - 1, 'prev');
});
document.getElementById('next-btn').addEventListener('click', () => {
  if (currentDay < 365) showDay(currentDay + 1, 'next');
});
document.getElementById('go-today-btn').addEventListener('click', () => {
  showDay(getDayForToday(), currentDay < getDayForToday() ? 'next' : 'prev');
});

// Keyboard arrows
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && currentDay > 1)   showDay(currentDay - 1, 'prev');
  if (e.key === 'ArrowRight' && currentDay < 365) showDay(currentDay + 1, 'next');
});

// Touch swipe
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 60) {
    if (dx < 0 && currentDay < 365) showDay(currentDay + 1, 'next');
    if (dx > 0 && currentDay > 1)   showDay(currentDay - 1, 'prev');
  }
}, { passive: true });

// ── All-days panel ─────────────────────────────────────────────
const todayDayNum = getDayForToday();

function buildPanelList(filter) {
  const list = document.getElementById('panel-list');
  list.innerHTML = '';
  const term = (filter || '').toLowerCase();

  DAYS.forEach(d => {
    const dateStr = getDateForDay(d.day);
    const searchable = `day ${d.day} ${d.love} ${dateStr}`.toLowerCase();
    if (term && !searchable.includes(term)) return;

    const item = document.createElement('div');
    item.className = 'panel-item' + (d.day === todayDayNum ? ' today-item' : '');
    item.innerHTML = `
      <span class="panel-item-num">${d.day}</span>
      <div class="panel-item-detail">
        <div class="panel-item-date">${dateStr}</div>
        <div class="panel-item-love">${d.love}</div>
      </div>
      ${d.day === todayDayNum ? '<span class="panel-today-tag">TODAY</span>' : ''}
    `;
    item.addEventListener('click', () => {
      showDay(d.day, d.day >= currentDay ? 'next' : 'prev');
      closePanel();
    });
    list.appendChild(item);
  });
}

function openPanel() {
  document.getElementById('days-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
  buildPanelList('');
  // Scroll to today
  setTimeout(() => {
    const todayEl = document.querySelector('.panel-item.today-item');
    if (todayEl) todayEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 200);
}

function closePanel() {
  document.getElementById('days-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}

document.getElementById('menu-btn').addEventListener('click', openPanel);
document.getElementById('close-panel-btn').addEventListener('click', closePanel);
document.getElementById('panel-overlay').addEventListener('click', closePanel);
document.getElementById('search-input').addEventListener('input', e => {
  buildPanelList(e.target.value);
});

// ── Photo viewer ───────────────────────────────────────────────
function openPhotoViewer(src) {
  const viewer = document.getElementById('photo-viewer');
  document.getElementById('photo-viewer-img').src = src;
  viewer.classList.add('open');
}
document.getElementById('close-photo-btn').addEventListener('click', () => {
  document.getElementById('photo-viewer').classList.remove('open');
});
document.getElementById('photo-viewer').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    document.getElementById('photo-viewer').classList.remove('open');
  }
});

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const startDay = getDayForToday();
  showDay(startDay, 'next');
});
