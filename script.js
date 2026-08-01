// Дата свадьбы для обратного отсчёта
const TARGET_DATE = '2027-08-14T16:00:00';

// TODO: вставить URL веб-приложения Google Apps Script после деплоя
const SHEETS_ENDPOINT = '';

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

// Отправка анкеты
const form = document.getElementById('guest-form');
const errorEl = document.getElementById('f-error');
const submitBtn = document.getElementById('f-submit');
const thanksEl = document.getElementById('thanks');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('f-name').value.trim();
  if (!name || !state.attend) {
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const payload = {
    name,
    attend: state.attend,
    alcoholType: state.alcoholType,
    wineColor: state.wineColor,
    wineSweet: state.wineSweet,
    spirit: state.spirit,
    transfer: state.transfer,
    menuChoice: state.menuChoice,
    allergies: document.getElementById('f-allergies').value.trim(),
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
    form.hidden = true;
    thanksEl.hidden = false;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить анкету';
    errorEl.textContent = 'Не удалось отправить анкету, попробуйте ещё раз.';
    errorEl.hidden = false;
  }
});
