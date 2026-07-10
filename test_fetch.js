async function test() {
  const res1 = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBkmAFHy0KtO1wfuCKFuDRDTUqhawUFdpg", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
  });
  console.log("FAKE KEY:", res1.status, await res1.text());

  const res2 = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
  });
  console.log("NO KEY:", res2.status, await res2.text());
}
test();
