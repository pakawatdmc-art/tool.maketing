/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

function updateJson(filePath, updates) {
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  for (const [key, value] of Object.entries(updates)) {
    json[key] = { ...(json[key] || {}), ...value };
  }
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  console.log(`Updated ${filePath}`);
}

const enUpdates = {
  Sidebar: {
    authenticator: "2FA Authenticator",
    cookie: "Cookie Tools",
    pomodoro: "Pomodoro Timer",
    edit_text: "Edit Text",
    uid_year: "UID → Created Year",
    split_string: "Split String",
    merge_lines: "Merge Lines",
    duplicate: "Remove Duplicates",
    reverse_word: "Reverse Text",
    filter_string: "Filter Strings",
    html_extractor: "HTML Extractor",
    json: "JSON Formatter"
  },
  Tool: {
    numberLines: "Number Lines",
    prefixSuffix: "Add Prefix & Suffix (per line)",
    prefix: "Prefix",
    suffix: "Suffix",
    apply: "Apply",
    findReplace: "Find & Replace",
    find: "Find",
    replaceWith: "Replace with",
    replaceBtn: "Replace"
  },
  PomodoroTool: {
    work: "Work",
    shortBreak: "Short Break",
    longBreak: "Long Break",
    sessions: "Sessions",
    nextLongBreak: "Next long break in",
    breakNotifTitle: "Time for a break! 🎉",
    breakNotifBody: "Great job! Take a well-deserved rest.",
    workNotifTitle: "Back to work! 💪",
    workNotifBody: "Let's get back to being productive!"
  }
};

const thUpdates = {
  Sidebar: {
    authenticator: "ยืนยันตัวตน 2FA",
    cookie: "เครื่องมือ Cookie",
    pomodoro: "นาฬิกา Pomodoro",
    edit_text: "แก้ไขข้อความ",
    uid_year: "UID → ปีที่สร้าง",
    split_string: "แยกข้อความ",
    merge_lines: "รวมบรรทัด",
    duplicate: "ลบข้อมูลซ้ำ",
    reverse_word: "กลับข้อความ",
    filter_string: "กรองข้อความ",
    html_extractor: "ดึงข้อมูล HTML",
    json: "จัดรูปแบบ JSON"
  },
  Tool: {
    numberLines: "ใส่เลขบรรทัด",
    prefixSuffix: "เพิ่ม Prefix & Suffix (ต่อบรรทัด)",
    prefix: "ข้อความนำหน้า",
    suffix: "ข้อความต่อท้าย",
    apply: "ใช้งาน",
    findReplace: "ค้นหาและแทนที่",
    find: "ค้นหา",
    replaceWith: "แทนที่ด้วย",
    replaceBtn: "แทนที่"
  },
  PomodoroTool: {
    work: "ทำงาน",
    shortBreak: "พักสั้น",
    longBreak: "พักยาว",
    sessions: "เซสชัน",
    nextLongBreak: "อีกกี่รอบจะพักยาว",
    breakNotifTitle: "ถึงเวลาพักแล้ว! 🎉",
    breakNotifBody: "ทำได้ดีมาก! พักผ่อนสักครู่เถอะ",
    workNotifTitle: "กลับมาทำงานต่อ! 💪",
    workNotifBody: "มาลุยกันต่อเลย!"
  }
};

updateJson('messages/en.json', enUpdates);
updateJson('messages/th.json', thUpdates);
