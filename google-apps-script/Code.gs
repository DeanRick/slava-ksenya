const FORM_TOKEN = 'deaae49b574ebac9cc2e27cb99b6a7a1c76348263cbde8dc';

const HEADERS = [
  'Дата', 'Имя', 'Телефон', 'Присутствие', 'Алкоголь', 'Цвет вина', 'Сухость',
  'Крепкий напиток', 'Трансфер', 'Меню', 'Аллергии', 'Карандаш-бутылка',
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.token !== FORM_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'forbidden' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

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
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
