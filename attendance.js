const userSelect = document.getElementById("userSelect");
const todayInput = document.getElementById("today");

// 今日の日付をセット
todayInput.value = new Date().toISOString().split("T")[0];

// ----------------- ユーザー表示更新 -----------------
function updateUserDisplay() {
  const name = userSelect.value;
  const date = todayInput.value;
  const data = JSON.parse(localStorage.getItem("attendance") || "{}");

  const record = data[name]?.find(r => r.date === date);

  if (record) {
    document.getElementById("startTime").value = record.start || "";
    document.getElementById("endTime").value = record.end || "";
    document.getElementById("workHours").value = record.hours || "";
    document.getElementById("workMinutes").value = record.minutes || "";
  } else {
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    document.getElementById("workHours").value = "";
    document.getElementById("workMinutes").value = "";
  }
}

// ----------------- 出勤 -----------------
function setStart() {
  const name = userSelect.value;
  if (name === "--") return;

  const now = new Date();
  const time = now.toTimeString().substring(0, 5);
  document.getElementById("startTime").value = time;

  saveAttendanceAuto(name, time, document.getElementById("endTime").value);
  document.getElementById("status").textContent = `${name} が出勤しました (${time})`;
}

// ----------------- 退勤 -----------------
function setEnd() {
  const name = userSelect.value;
  if (name === "--") return;

  const now = new Date();
  const time = now.toTimeString().substring(0, 5);
  document.getElementById("endTime").value = time;

  saveAttendanceAuto(name, document.getElementById("startTime").value, time);
  document.getElementById("status").textContent = `${name} が退勤しました (${time})`;
}

// ----------------- 勤務保存 -----------------
function saveAttendanceAuto(name, start, end) {
  const date = todayInput.value;
  let hours = 0, minutes = 0;

  if (start && end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60; // 日跨ぎ対応
    const diff = endMin - startMin;

    hours = Math.floor(diff / 60);
    minutes = diff % 60;

    document.getElementById("workHours").value = hours;
    document.getElementById("workMinutes").value = minutes;
  }

  let data = JSON.parse(localStorage.getItem("attendance") || "{}");
  if (!data[name]) data[name] = [];

  const todayRecord = data[name].find(r => r.date === date);
  if (todayRecord) {
    todayRecord.start = start;
    todayRecord.end = end;
    todayRecord.hours = hours;
    todayRecord.minutes = minutes;
  } else {
    data[name].push({ date, start, end, hours, minutes });
  }

  localStorage.setItem("attendance", JSON.stringify(data));
  updateUserDisplay();
}

// ----------------- 勤務表表示 -----------------
function showTable() {
  const month = document.getElementById("selectMonth").value;
  if (!month) { alert("月を選択してください"); return; }
  const [year, mon] = month.split("-");
  const data = JSON.parse(localStorage.getItem("attendance") || "{}");
  let html = "";

  for (const name in data) {
    const records = data[name].filter(r => r.date.startsWith(`${year}-${mon}`));
    if (records.length === 0) continue;

    html += `<h3>${name}</h3><table border="1" cellpadding="5"><tr>
                 <th>日付</th><th>出勤</th><th>退勤</th><th>稼働時間</th></tr>`;

    records.forEach(r => {
      let h = r.hours, m = r.minutes;
      const rem = m % 15;
      if (rem >= 8) m += 15 - rem;
      else m -= rem;
      if (m >= 60) { h += 1; m -= 60; }
      html += `<tr>
                        <td>${r.date}</td>
                        <td>${r.start}</td>
                        <td>${r.end}</td>
                        <td>${h}時間 ${m}分</td>
                     </tr>`;
    });

    html += "</table>";
  }

  if (html === "") html = "<p>この月の勤務データはありません。</p>";
  document.getElementById("tableArea").innerHTML = html;
}

// ----------------- 深夜勤務サンプル -----------------
function loadNightSampleData() {
  const sample = {
    "Aさん": [{ date: "2025-02-01", start: "22:50", end: "02:07", hours: 3, minutes: 17 }],
    "Bさん": [{ date: "2025-02-02", start: "23:15", end: "05:20", hours: 6, minutes: 5 }],
    "Cさん": [{ date: "2025-02-03", start: "23:45", end: "04:52", hours: 5, minutes: 7 }]
  };

  let data = JSON.parse(localStorage.getItem("attendance") || "{}");

  for (const name in sample) {
    if (!data[name]) data[name] = [];
    sample[name].forEach(s => {
      const exists = data[name].some(r => r.date === s.date && r.start === s.start && r.end === s.end);
      if (!exists) data[name].push(s);
    });
  }

  localStorage.setItem("attendance", JSON.stringify(data));
  updateUserDisplay();
  alert("深夜勤務サンプルを追加しました！");
}

// ----------------- イベント -----------------
window.addEventListener("load", () => updateUserDisplay());
userSelect.addEventListener("change", updateUserDisplay);
todayInput.addEventListener("change", updateUserDisplay);