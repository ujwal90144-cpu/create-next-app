const row = {
  "Lead Name": "Test User 99999",
  "Contact Info": "user_99999@example.com",
  "Mobile Number": "+1 1665698514",
  "Location": "City 99, USA",
  "Lead Status": "GOOD_LEAD_FOLLOW_UP",
  "Campaign": "eden_park",
  "Follow-up Comments": "Automated test lead",
  "Created At": "2026-05-16T11:06:05.622Z"
};

const rowString = JSON.stringify(row).toLowerCase();
const cleanRowString = rowString.replace(/\s+/g, '');

const oldHasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rowString);
const oldHasPhone = /[0-9]{7,}/.test(rowString);

const newHasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/.test(cleanRowString);
const newHasPhone = /[0-9]{6,}/.test(cleanRowString);

console.log('Old Regex: Email', oldHasEmail, 'Phone', oldHasPhone);
console.log('New Regex: Email', newHasEmail, 'Phone', newHasPhone);
