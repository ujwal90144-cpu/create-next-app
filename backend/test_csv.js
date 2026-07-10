const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('../large_mock_crm_leads.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results[0]);
    console.log(results[1]);
  });
