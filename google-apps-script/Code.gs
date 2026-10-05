const FORM_TOKEN = 'deaae49b574ebac9cc2e27cb99b6a7a1c76348263cbde8dc';

// Secret Key из https://www.google.com/recaptcha/admin — хранится в
// Project Settings → Script Properties под ключом RECAPTCHA_SECRET,
// в код НЕ вставлять (репозиторий публичный).
const RECAPTCHA_SECRET = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');

const HEADERS = [
  'Дата', 'Имя', 'Телефон', 'Присутствие', 'Алкоголь', 'Цвет вина', 'Сухость',
  'Крепкий напиток', 'Трансфер', 'Меню', 'Аллергии', 'Карандаш-бутылка', 'Антиспам',
];

function checkRecaptcha(token) {
  if (!RECAPTCHA_SECRET || !token) return 'нет проверки';
  try {
    const response = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: RECAPTCHA_SECRET, response: token },
      muteHttpExceptions: true,
    });
    const result = JSON.parse(response.getContentText());
    if (!result.success) return 'не прошла (' + (result['error-codes'] || []).join(',') + ')';
    return 'score ' + result.score;
  } catch (err) {
    return 'ошибка проверки';
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.token !== FORM_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'forbidden' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const antispam = checkRecaptcha(data.recaptchaToken);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.phone || '',
    data.attend || '',
    data.alcoholType || '',
    data.wineColor || '',
    data.wineSweet || '',
    data.spirit || '',
    data.transfer || '',
    data.menuChoice || '',
    data.allergies || '',
    data.pencil || '',
    antispam,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
