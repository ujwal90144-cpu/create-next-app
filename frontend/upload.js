const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  const form = new FormData();
  form.append('file', fs.createReadStream('../large_mock_crm_leads.csv'));

  try {
    const response = await axios.post('http://localhost:5000/api/import', form, {
      headers: form.getHeaders(),
    });
    
    const data = response.data;
    console.log("Success:", data.success);
    console.log("Imported:", data.importedCount);
    console.log("Skipped:", data.skippedCount);
    console.log("Processing Time:", data.processingTimeMs);
    if (data.skippedRecords && data.skippedRecords.length > 0) {
      console.log("First skipped record:", JSON.stringify(data.skippedRecords[0]));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testUpload();
