const HEADERS = [
  'Дата', 'Имя', 'Присутствие', 'Алкоголь', 'Цвет вина', 'Сухость',
  'Крепкий напиток', 'Трансфер', 'Меню', 'Аллергии', 'Карандаш-бутылка',
];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || '',
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
