// Дата свадьбы для обратного отсчёта
const TARGET_DATE = '2027-08-14T16:00:00';

const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxRhAaeW_EIA4-_xMBxLmzov9STznMYeELo1gVO1KOOQEsosxyTcFvsyk_2cbHoA3TGOg/exec';

function pad(n) {
  return String(n).padStart(2, '0');
}

function tickCountdown() {
  const diff = Math.max(0, new Date(TARGET_DATE).getTime() - Date.now());
  const day = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-d').textContent = String(day);
  document.getElementById('cd-h').textContent = pad(h);
  document.getElementById('cd-m').textContent = pad(m);
  document.getElementById('cd-s').textContent = pad(s);
}
tickCountdown();
setInterval(tickCountdown, 1000);

// Радио-группы анкеты
const state = {
  attend: '', transfer: '',
  alcoholType: '', wineColor: '', wineSweet: '', spirit: '',
  menuChoice: '', pencil: '',
};

const wineBlock = document.getElementById('wine-block');
const spiritBlock = document.getElementById('spirit-block');

function updateAlcoholBlocks() {
  wineBlock.hidden = state.alcoholType !== 'Вино';
  spiritBlock.hidden = state.alcoholType !== 'Крепкие напитки';
}

document.querySelectorAll('.option-group').forEach(group => {
  const key = group.dataset.group;
  const isPencilJoke = group.dataset.pencilJoke === 'true';

  group.querySelectorAll('.option-row').forEach(row => {
    row.addEventListener('click', () => {
      // Шутка из оригинального дизайна: клик по «Нет» на самом деле подтверждает участие
      const value = isPencilJoke && row.dataset.value === 'Нет' ? 'Конечно, да!' : row.dataset.value;

      state[key] = value;
      group.querySelectorAll('.option-row').forEach(r => r.classList.toggle('selected', r.dataset.value === value));

      if (key === 'alcoholType') updateAlcoholBlocks();
    });
  });
});

// Карусель палитры дресс-кода
const paletteCarousel = document.getElementById('palette-carousel');
if (paletteCarousel) {
  const paletteCards = paletteCarousel.querySelectorAll('.palette-card');
  const paletteDots = document.querySelectorAll('#palette-dots .palette-dot');

  const paletteObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = [...paletteCards].indexOf(entry.target);
        paletteDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      }
    });
  }, { root: paletteCarousel, threshold: 0.6 });

  paletteCards.forEach((card) => paletteObserver.observe(card));
}

// Отправка анкеты
const form = document.getElementById('guest-form');
const errorEl = document.getElementById('f-error');
const submitBtn = document.getElementById('f-submit');
const thanksEl = document.getElementById('thanks');

function isFormComplete(name, phone) {
  if (!name || !phone || !state.attend || !state.alcoholType || !state.transfer || !state.menuChoice || !state.pencil) {
    return false;
  }
  if (state.alcoholType === 'Вино' && (!state.wineColor || !state.wineSweet)) return false;
  if (state.alcoholType === 'Крепкие напитки' && !state.spirit) return false;
  return true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const allergies = document.getElementById('f-allergies').value.trim();

  if (!isFormComplete(name, phone)) {
    errorEl.textContent = 'Пожалуйста, заполните все пункты анкеты.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const payload = {
    name,
    phone,
    attend: state.attend,
    alcoholType: state.alcoholType,
    wineColor: state.wineColor,
    wineSweet: state.wineSweet,
    spirit: state.spirit,
    transfer: state.transfer,
    menuChoice: state.menuChoice,
    allergies,
    pencil: state.pencil,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  try {
    if (SHEETS_ENDPOINT) {
      await fetch(SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    submitBtn.textContent = 'Отправлено';
    form.hidden = true;
    thanksEl.hidden = false;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить анкету';
    errorEl.textContent = 'Не удалось отправить анкету, попробуйте ещё раз.';
    errorEl.hidden = false;
  }
});
