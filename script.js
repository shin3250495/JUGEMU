let startDate = null; // 出勤時刻
let endDate = null;   // 退勤時刻

// 現在時刻を取得
function getCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// 出勤
function setStartTime() {
  startDate = new Date();
  document.getElementById("startTime").value = getCurrentTime();
}

// 退勤
function setEndTime() {
  endDate = new Date();
  document.getElementById("endTime").value = getCurrentTime();
  updateWorkTime();
}

// 稼働時間計算
function updateWorkTime() {
  if (!startDate || !endDate) return;

  let diffMs = endDate - startDate;
  if (diffMs < 0) diffMs += 24*60*60*1000; // 日跨ぎ対応

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("workHours").value = diffHours;
  document.getElementById("workMinutes").value = diffMinutes;
}

// 計算ボタン
document.getElementById("calcButton").addEventListener("click", calculateSalary);

// 給料計算関数
function calculateSalary() {
    // 時給 × 稼働時間
    const hourlyWage = Number(document.getElementById("hourlyWage").value);
    const workHours = Number(document.getElementById("workHours").value);
    const workMinutes = Number(document.getElementById("workMinutes").value);

    const workTime = workHours + workMinutes / 60;
    const wageTotal = hourlyWage * workTime;

    // ドリンク
    const d100 = Number(document.getElementById("drink100").value);
    const d200 = Number(document.getElementById("drink200").value);
    const d300 = Number(document.getElementById("drink300").value);
    const d400 = Number(document.getElementById("drink400").value);
    const d500 = Number(document.getElementById("drink500").value);

    const drinkTotal =
        (d100 * 100) +
        (d200 * 200) +
        (d300 * 300) +
        (d400 * 400) +
        (d500 * 500);

    // 営業バック（売上 × 0.15）
    const salesAmount = Number(document.getElementById("salesAmount").value);
    const salesBack = salesAmount * 0.15;
    document.getElementById("salesBack").value = Math.floor(salesBack);

    // 引かれ物
    const saving = Number(document.getElementById("saving").value);
    const penalty = Number(document.getElementById("penalty").value);
    const deduct = saving + penalty;

    // 合計
    const total = wageTotal + drinkTotal + salesBack - deduct;
    document.getElementById("totalAmount").value = Math.floor(total);
}