const fs = require('fs');

const NUM_RECORDS = 100000;
const FILE_NAME = 'large_mock_crm_leads.csv';

const statuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'SALE_DONE', 'BAD_LEAD', ''];
const sources = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', 'unknown_source', ''];

const writeStream = fs.createWriteStream(FILE_NAME);
writeStream.write('"Lead Name","Contact Info","Mobile Number","Location","Lead Status","Campaign","Follow-up Comments","Created At"\n');

function writeData() {
  let i = NUM_RECORDS;
  
  function write() {
    let ok = true;
    do {
      i--;
      
      const hasEmail = Math.random() > 0.2; // 80% have email
      const hasPhone = Math.random() > 0.3; // 70% have phone
      const isJunk = !hasEmail && !hasPhone; // ~6% junk
      
      const email = hasEmail ? `user_${i}@example.com` : '';
      const phone = hasPhone ? `+1 ${Math.floor(1000000000 + Math.random() * 9000000000)}` : '';
      const name = `Test User ${i}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const date = new Date(Date.now() - Math.random() * 10000000000).toISOString();
      const comment = isJunk ? 'No contact info' : 'Automated test lead';
      
      const row = `"${name}","${email}","${phone}","City ${i % 100}, USA","${status}","${source}","${comment}","${date}"\n`;
      
      if (i === 0) {
        writeStream.write(row);
        console.log(`Successfully generated ${NUM_RECORDS} rows in ${FILE_NAME}`);
      } else {
        ok = writeStream.write(row);
      }
    } while (i > 0 && ok);
    
    if (i > 0) {
      writeStream.once('drain', write);
    }
  }
  
  write();
}

writeData();
