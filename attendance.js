// 今日の日付
document.getElementById("today").value = new Date().toISOString().split("T")[0];

// 出勤者リスト
function updateWorkList() {
  const listEl = document.getElementById("workList");
  listEl.innerHTML = "";
  const working = JSON.parse(localStorage.getItem("working") || "[]");
  working.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    listEl.appendChild(li);
  });
}
updateWorkList();

// 15分基準カスタム丸め（0〜7切り捨て、8〜14切り上げ）
function roundMinutesTo15Custom(hours, minutes) {
  const remainder = minutes % 15;
  let roundedMinutes = minutes - remainder;
  if (remainder >= 8) roundedMinutes += 15;
  const totalMinutes = hours * 60 + roundedMinutes;
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}

// 勤務記録保存
function saveAttendanceAuto(name, start, end) {
  const date = document.getElementById("today").value;
  let hours = 0, minutes = 0;
  if (end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60; // 日またぎ対応
    const diff = endMin - startMin;
    const exactHours = Math.floor(diff / 60);
    const exactMinutes = diff % 60;
    document.getElementById("workHours").value = exactHours;
    document.getElementById("workMinutes").value = exactMinutes;

    const rounded = roundMinutesTo15Custom(exactHours, exactMinutes);
    hours = rounded.hours;
    minutes = rounded.minutes;
  }

  let data = JSON.parse(localStorage.getItem("attendance") || "{}");
  if (!data[name]) data[name] = [];
  const todayRecord = data[name].find(r => r.date === date);
  if (todayRecord) {
    todayRecord.start = start; todayRecord.end = end;
    todayRecord.hours = hours; todayRecord.minutes = minutes;
  } else {
    data[name].push({ date, start, end, hours, minutes });
  }
  localStorage.setItem("attendance", JSON.stringify(data));
}

// 出勤ボタン
function setStart() {
  const name = document.getElementById("userSelect").value;
  const now = new Date();
  const time = now.toTimeString().substring(0, 5);
  document.getElementById("startTime").value = time;
  let working = JSON.parse(localStorage.getItem("working") || "[]");
  if (!working.includes(name)) working.push(name);
  localStorage.setItem("working", JSON.stringify(working));
  updateWorkList();
  saveAttendanceAuto(name, time, null);
  document.getElementById("status").textContent = `${name} が出勤しました (${time})`;
}

// 退勤ボタン
function setEnd() {
  const name = document.getElementById("userSelect").value;
  const now = new Date();
  const time = now.toTimeString().substring(0, 5);
  document.getElementById("endTime").value = time;
  let working = JSON.parse(localStorage.getItem("working") || "[]");
  working = working.filter(n => n !== name);
  localStorage.setItem("working", JSON.stringify(working));
  updateWorkList();
  const start = document.getElementById("startTime").value;
  saveAttendanceAuto(name, start, time);
  document.getElementById("status").textContent = `${name} が退勤しました (${time})`;
}

// 勤務表表示
function showTable() {
  const month = document.getElementById("selectMonth").value;
  if (!month) { alert("月を選択してください"); return; }
  const [year, mon] = month.split("-");
  const data = JSON.parse(localStorage.getItem("attendance") || "{}");
  let html = "";
  for (const name in data) {
    const records = data[name].filter(r => r.date.startsWith(`${year}-${mon}`));
    if (records.length === 0) continue;
    html += `<h3>${name}</h3>`;
    html += `<table><tr><th>日付</th><th>出勤</th><th>退勤</th><th>稼働時間</th></tr>`;
    records.forEach(r => {
      html += `<tr><td>${r.date}</td><td>${r.start}</td><td>${r.end}</td>
                     <td>${r.hours}時間 ${r.minutes}分</td></tr>`;
    });
    html += `</table>`;
  }
  if (html === "") html = "<p>この月の勤務データはありません。</p>";
  document.getElementById("tableArea").innerHTML = html;
}

// 深夜勤務5パターンサンプル投入
function loadNightSampleData() {
  const sample = {
    "Aさん": [
      { date: "2025-11-01", start: "22:50", end: "02:07", hours: 3, minutes: 15 },
      { date: "2025-11-04", start: "00:05", end: "06:12", hours: 6, minutes: 0 }
    ],
    "Bさん": [
      { date: "2025-11-02", start: "23:15", end: "05:20", hours: 6, minutes: 0 },
      { date: "2025-11-05", start: "23:50", end: "00:12", hours: 0, minutes: 15 }
    ],
    "Cさん": [
      { date: "2025-11-03", start: "23:45", end: "04:52", hours: 5, minutes: 0 }
    ]
  };
  localStorage.setItem("attendance", JSON.stringify(sample));
  alert("深夜勤務5パターンを投入しました！");
}