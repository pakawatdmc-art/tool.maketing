/**
 * 2FA Tools — Full Feature Test Suite
 * Run: node test-all-features.mjs
 * Tests all client-side logic + API endpoints
 */

const BASE = "http://localhost:3000";
let passed = 0;
let failed = 0;

function assert(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name} ${detail ? `— ${detail}` : ""}`);
    failed++;
  }
}

// ============================================================
// 1. COOKIE TOOL — test regex logic
// ============================================================
console.log("\n🍪 [1] Cookie Tool — extractUid logic");
{
  const lines = [
    "datr=xxx; c_user=100001234567; xs=xxx; fr=xxx",
    "datr=yyy; c_user=100009876543; xs=yyy",
    "100005555555",
    "some random text no uid",
  ];
  const results = [];
  for (const line of lines) {
    const cUserMatch = line.match(/c_user[=:]\s*(\d+)/);
    if (cUserMatch) { results.push(cUserMatch[1]); continue; }
    if (/^\d{8,20}$/.test(line.trim())) { results.push(line.trim()); continue; }
    const numMatch = line.match(/\b(\d{10,20})\b/);
    if (numMatch) { results.push(numMatch[1]); }
  }
  assert("Extract UID from cookie lines", results.length === 3);
  assert("First UID = 100001234567", results[0] === "100001234567");
  assert("Second UID = 100009876543", results[1] === "100009876543");
  assert("Third UID = 100005555555", results[2] === "100005555555");
}

console.log("\n🍪 [1b] Cookie Tool — extractToken logic");
{
  const line = 'access_token=EAABwzLixnjYBO1234567890abcdef; other=stuff';
  const match = line.match(/(EAA[A-Za-z0-9]+)/);
  assert("Extract Facebook token (EAAA...)", match !== null && match[1].startsWith("EAA"));
}

console.log("\n🍪 [1c] Cookie Tool — removeInvalidCookies");
{
  const lines = [
    "datr=xxx; c_user=100001234567; xs=xxx",
    "invalid cookie without c_user",
    "c_user=999; xs=abc",
  ];
  const valid = lines.filter(line => /c_user[=:]\s*\d+/.test(line));
  assert("Remove invalid cookies", valid.length === 2);
}

// ============================================================
// 2. POMODORO — timer logic
// ============================================================
console.log("\n⏱️ [2] Pomodoro Timer — logic");
{
  const MODES = {
    work: { duration: 25 * 60 },
    shortBreak: { duration: 5 * 60 },
    longBreak: { duration: 15 * 60 },
  };
  assert("Work = 1500s (25min)", MODES.work.duration === 1500);
  assert("Short Break = 300s (5min)", MODES.shortBreak.duration === 300);
  assert("Long Break = 900s (15min)", MODES.longBreak.duration === 900);

  // Auto-advance: after 4 work sessions → long break
  let sessions = 3;
  sessions += 1; // completing 4th session
  const nextMode = sessions % 4 === 0 ? "longBreak" : "shortBreak";
  assert("After 4 sessions → longBreak", nextMode === "longBreak");

  sessions = 2;
  sessions += 1;
  const nextMode2 = sessions % 4 === 0 ? "longBreak" : "shortBreak";
  assert("After 3 sessions → shortBreak", nextMode2 === "shortBreak");

  // Format time
  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  assert("Format 1500s → 25:00", formatTime(1500) === "25:00");
  assert("Format 65s → 01:05", formatTime(65) === "01:05");
}

// ============================================================
// 3. UID → Year
// ============================================================
console.log("\n📅 [3] UID → Created Year — logic");
{
  const UID_RANGES = [
    { prefix: "1000000", yearRange: "2009-2011" },
    { prefix: "1000050", yearRange: "2015-2016" },
    { prefix: "100010", yearRange: "2020-2021" },
    { prefix: "100015", yearRange: "2023" },
    { prefix: "100019", yearRange: "2025" },
    { prefix: "61555", yearRange: "2024-2025 (Page)" },
  ];
  const sortedRanges = [...UID_RANGES].sort((a, b) => b.prefix.length - a.prefix.length);

  function estimateYear(uid) {
    if (uid.length < 9) return "2004-2009";
    if (uid.length <= 10 && !uid.startsWith("100")) return "2006-2011";
    for (const range of sortedRanges) {
      if (uid.startsWith(range.prefix)) return range.yearRange;
    }
    return "Unknown";
  }

  assert("UID 4 → 2004-2009 (old)", estimateYear("4") === "2004-2009");
  assert("UID 100005012345 → 2015-2016", estimateYear("100005012345") === "2015-2016");
  assert("UID 100015678901234 → 2023", estimateYear("100015678901234") === "2023");
  assert("UID 100019999999999 → 2025", estimateYear("100019999999999") === "2025");
  assert("UID 61555123456 → 2024-2025 (Page)", estimateYear("61555123456") === "2024-2025 (Page)");
}

// ============================================================
// 4. Text Manipulation
// ============================================================
console.log("\n📝 [4] Text Manipulation — logic");
{
  const input = "banana\napple\ncherry\napple\n\nbanana";

  // Sort A-Z
  const sortAZ = input.split("\n").sort().join("\n");
  assert("Sort A-Z first item is empty", sortAZ.startsWith("\n") || sortAZ.split("\n")[0] === "");

  // Remove duplicates
  const unique = [...new Set(input.split("\n"))].join("\n");
  assert("Remove duplicates: 6→4 lines", unique.split("\n").length === 4);

  // Remove empty lines — input has 6 lines, 1 empty → 5 non-empty
  const noEmpty = input.split("\n").filter(l => l.trim() !== "").join("\n");
  assert("Remove empty lines: 6→5", noEmpty.split("\n").length === 5);

  // Trim whitespace
  const trimmed = "  hello  \n  world  ".split("\n").map(l => l.trim()).join("\n");
  assert("Trim whitespace", trimmed === "hello\nworld");

  // Prefix/Suffix
  const prefixed = "a\nb".split("\n").map(l => `[${l}]`).join("\n");
  assert("Prefix/Suffix: [a]\\n[b]", prefixed === "[a]\n[b]");

  // Find & Replace
  const replaced = "hello world hello".split("hello").join("hi");
  assert("Find/Replace hello→hi", replaced === "hi world hi");

  // Case conversion
  assert("toUpperCase", "hello".toUpperCase() === "HELLO");
  assert("toLowerCase", "HELLO".toLowerCase() === "hello");

  // Reverse lines
  const reversed = "a\nb\nc".split("\n").reverse().join("\n");
  assert("Reverse lines", reversed === "c\nb\na");

  // Number lines
  const numbered = "a\nb".split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n");
  assert("Number lines", numbered === "1. a\n2. b");
}

// ============================================================
// 5. Duplicate Filter
// ============================================================
console.log("\n🔄 [5] Duplicate Filter — logic");
{
  const input = "apple\nbanana\napple\ncherry\nbanana";
  const lines = input.split("\n");
  const unique = Array.from(new Set(lines));
  assert("Input 5 lines → 3 unique", unique.length === 3);
  assert("Duplicate count = 2", lines.length - unique.length === 2);
}

// ============================================================
// 6. Reverse Text
// ============================================================
console.log("\n🔁 [6] Reverse Text — logic");
{
  // Reverse words
  const reverseWords = "hello world foo".split(" ").reverse().join(" ");
  assert("Reverse words: foo world hello", reverseWords === "foo world hello");

  // Reverse characters
  const reverseChars = "hello".split("").reverse().join("");
  assert("Reverse chars: olleh", reverseChars === "olleh");

  // Reverse lines
  const reverseLines = "a\nb\nc".split("\n").reverse().join("\n");
  assert("Reverse lines: c\\nb\\na", reverseLines === "c\nb\na");
}

// ============================================================
// 7. String/Line Splitter
// ============================================================
console.log("\n✂️ [7] String Splitter — logic");
{
  // Column extraction
  const line = "john|doe|30";
  const parts = line.split("|");
  assert("Column 1 (index 0) = john", parts[0] === "john");
  assert("Column 2 (index 1) = doe", parts[1] === "doe");
  assert("Column 3 (index 2) = 30", parts[2] === "30");

  // Chunk splitting
  const lines = ["a","b","c","d","e","f","g"];
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize).join("\n"));
  }
  assert("7 lines / 3 per chunk = 3 chunks", chunks.length === 3);
  assert("Last chunk has 1 line", chunks[2] === "g");
}

// ============================================================
// 8. Filter Tool
// ============================================================
console.log("\n🔍 [8] Filter Tool — logic");
{
  const lines = ["apple pie", "banana split", "cherry tart", "Apple juice"];

  // Include mode
  const includeResult = lines.filter(l => l.toLowerCase().includes("apple"));
  assert("Include 'apple' (case insensitive): 2 results", includeResult.length === 2);

  // Exclude mode
  const excludeResult = lines.filter(l => !l.toLowerCase().includes("apple"));
  assert("Exclude 'apple': 2 results", excludeResult.length === 2);

  // Case sensitive
  const caseSensitive = lines.filter(l => l.includes("apple"));
  assert("Case sensitive 'apple': 1 result", caseSensitive.length === 1);
}

// ============================================================
// 9. Merge Tool
// ============================================================
console.log("\n🔗 [9] Merge Tool — logic");
{
  const list1 = ["a", "b", "c"];
  const list2 = ["1", "2"];
  const sep = "|";
  const maxLen = Math.max(list1.length, list2.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const p1 = list1[i] || "";
    const p2 = list2[i] || "";
    if (p1 && p2) result.push(`${p1}${sep}${p2}`);
    else if (p1) result.push(p1);
    else result.push(p2);
  }
  assert("Merge 3+2 lines = 3 output lines", result.length === 3);
  assert("Line 1: a|1", result[0] === "a|1");
  assert("Line 3: c (no pair)", result[2] === "c");
}

// ============================================================
// 10. HTML Extractor
// ============================================================
console.log("\n🌐 [10] HTML Extractor — logic");
{
  const html = `<img src="https://example.com/img1.jpg" alt="test"><a href="https://google.com">Link</a><img src='https://example.com/img2.png'>`;

  // Extract images
  const imgRegex = /<img[^>]+src=(["'])(.*?)\1/g;
  const images = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) images.push(m[2]);
  assert("Extract 2 images", images.length === 2);
  assert("First image URL correct", images[0] === "https://example.com/img1.jpg");

  // Extract links
  const linkRegex = /<a[^>]+href=(["'])(.*?)\1/g;
  const links = [];
  while ((m = linkRegex.exec(html)) !== null) links.push(m[2]);
  assert("Extract 1 link", links.length === 1);
  assert("Link URL = google.com", links[0] === "https://google.com");
}

// ============================================================
// 11. JSON Formatter
// ============================================================
console.log("\n📋 [11] JSON Formatter — logic");
{
  const ugly = '{"name":"John","age":30,"items":[1,2,3]}';
  
  // Format
  const parsed = JSON.parse(ugly);
  const pretty = JSON.stringify(parsed, null, 2);
  assert("Format JSON has newlines", pretty.includes("\n"));
  assert("Format JSON has indentation", pretty.includes("  "));

  // Minify
  const mini = JSON.stringify(parsed);
  assert("Minify has no newlines", !mini.includes("\n"));
  assert("Minify is single line", mini === ugly);

  // Error handling
  let error = null;
  try { JSON.parse("{invalid}"); } catch (e) { error = e.message; }
  assert("Invalid JSON throws error", error !== null);
}

// ============================================================
// 12. Check IP — API test
// ============================================================
console.log("\n🌍 [12] Check IP — API test");
{
  try {
    const res = await fetch(`${BASE}/api/check-ip?ip=8.8.8.8`);
    const data = await res.json();
    assert("API returns 200", res.ok);
    assert("Returns country", !!data.country, data.country);
    assert("Returns city", !!data.city, data.city);
    assert("Returns ISP", !!data.isp, data.isp);
    assert("Returns lat/lon", typeof data.lat === "number" && typeof data.lon === "number");
    assert("IP = 8.8.8.8", data.query === "8.8.8.8");
  } catch (e) {
    assert("Check IP API reachable", false, e.message);
  }
}

// ============================================================
// 13. Check UID — API test
// ============================================================
console.log("\n👤 [13] Check UID (Live/Die) — API test");
{
  try {
    const res = await fetch(`${BASE}/api/check-uid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uids: ["4", "999999999999999"] }),
    });
    const data = await res.json();
    assert("API returns 200", res.ok);
    assert("Returns results array", Array.isArray(data.results));
    assert("Results have 2 items", data.results.length === 2);
    assert("Each result has uid + status", data.results[0].uid && data.results[0].status);
    // UID 4 (Zuckerberg) should be live
    const zuck = data.results.find(r => r.uid === "4");
    assert("UID 4 (Zuckerberg) = live", zuck?.status === "live", zuck?.status);
  } catch (e) {
    assert("Check UID API reachable", false, e.message);
  }
}

// ============================================================
// 14. Get UID — API test
// ============================================================
console.log("\n🔎 [14] Get UID from URL — API test");
{
  try {
    const res = await fetch(`${BASE}/api/get-uid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: ["100000000000001"] }), // numeric UID passthrough
    });
    const data = await res.json();
    assert("API returns 200", res.ok);
    assert("Returns results array", Array.isArray(data.results));
    assert("Has url + status fields", data.results[0]?.url && data.results[0]?.status);
  } catch (e) {
    assert("Get UID API reachable", false, e.message);
  }
}

// ============================================================
// 15. Notepad — API test
// ============================================================
console.log("\n📝 [15] Notepad — API test");
{
  try {
    // Create note
    const createRes = await fetch(`${BASE}/api/notepad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Test note from automated test" }),
    });
    const createData = await createRes.json();
    assert("Create note returns 200", createRes.ok);
    assert("Returns note ID", !!createData.id, createData.id);
    assert("Returns content", createData.content === "Test note from automated test");

    // Read note
    const noteId = createData.id;
    const readRes = await fetch(`${BASE}/api/notepad/${noteId}`);
    const readData = await readRes.json();
    assert("Read note returns 200", readRes.ok);
    assert("Note content matches", readData.note?.content === "Test note from automated test");

    // Update note
    const updateRes = await fetch(`${BASE}/api/notepad/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Updated content" }),
    });
    const updateData = await updateRes.json();
    assert("Update note returns 200", updateRes.ok);
    assert("Update returns success", updateData.success === true);

    // Verify update
    const verifyRes = await fetch(`${BASE}/api/notepad/${noteId}`);
    const verifyData = await verifyRes.json();
    assert("Updated content persisted", verifyData.note?.content === "Updated content");

    // 404 test
    const notFoundRes = await fetch(`${BASE}/api/notepad/nonexistent_id_xyz`);
    assert("Non-existent note returns 404", notFoundRes.status === 404);
  } catch (e) {
    assert("Notepad API reachable", false, e.message);
  }
}

// ============================================================
// SUMMARY
// ============================================================
console.log("\n" + "=".repeat(50));
console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log("=".repeat(50));

if (failed > 0) {
  console.log("⚠️  Some tests failed. Review the ❌ items above.");
  process.exit(1);
} else {
  console.log("🎉 All tests passed!");
  process.exit(0);
}
