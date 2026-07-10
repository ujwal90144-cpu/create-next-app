const fs = require('fs');
const csv = require('csv-parser');

const rawRecords = [];
const skippedRecords = [];
const validRecords = [];

fs.createReadStream('../large_mock_crm_leads.csv')
  .pipe(csv())
  .on('data', (data) => rawRecords.push(data))
  .on('end', () => {
    for (const row of rawRecords) {
      const rowString = JSON.stringify(row).toLowerCase();
      const cleanRowString = rowString.replace(/\s+/g, '');
      
      const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rowString);
      const hasPhone = /[0-9]{7,}/.test(rowString);

      if (!hasEmail && !hasPhone) {
        skippedRecords.push(row);
      } else {
        validRecords.push(row);
      }
    }

    console.log(`Total: ${rawRecords.length}`);
    console.log(`Valid: ${validRecords.length}`);
    console.log(`Skipped: ${skippedRecords.length}`);
  });
