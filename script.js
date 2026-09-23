// =========================================================
// ことりノート 共通の動き
// =========================================================

// スマホ用メニューの開け閉め
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
}

// 「ページ上部へ戻る」ボタン
const toTop = document.querySelector(".to-top");
if (toTop) {
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("show", window.scrollY > 400);
  });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// 「リンクをコピー」ボタン
const copyBtn = document.querySelector(".share .copy");
if (copyBtn) {
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(location.href).then(() => {
      copyBtn.textContent = "コピーしました!";
    });
  });
}

// 金額を「1,234円」の形にする
function yen(n) {
  return Math.round(n).toLocaleString("ja-JP") + "円";
}

// ---------- 医療費控除の計算(記事ページ用) ----------

// 「総所得金額等が200万円未満」にチェックが入ったら、入力欄を表示する
const lowIncome = document.getElementById("low-income");
const incomeRow = document.getElementById("income-row");
if (lowIncome && incomeRow) {
  lowIncome.addEventListener("change", () => {
    incomeRow.style.display = lowIncome.checked ? "flex" : "none";
  });
}

const calcBtn = document.getElementById("calc-btn");
if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    const medical = Number(document.getElementById("medical").value);
    const refund = Number(document.getElementById("refund").value) || 0;
    const rate = Number(document.getElementById("rate").value);
    const result = document.getElementById("calc-result");

    if (!medical || medical <= 0) {
      result.innerHTML = "1年間に支払った医療費を入れてね。";
      return;
    }

    // 差し引く金額:原則10万円。総所得金額等が200万円未満なら、その5%
    let threshold = 100000;
    let thresholdNote = "10万円";
    if (lowIncome && lowIncome.checked) {
      const income = Number(document.getElementById("income").value);
      if (!income || income <= 0) {
        result.innerHTML = "総所得金額等の金額を入れてね。";
        return;
      }
      threshold = income * 0.05;
      thresholdNote = `所得の5%(${yen(threshold)})`;
    }

    // 控除額 = 医療費 − 戻ったお金 − 差し引く金額(上限200万円)
    let deduction = medical - refund - threshold;
    let overLimit = false;
    if (deduction > 2000000) {
      deduction = 2000000;
      overLimit = true;
    }

    if (deduction <= 0) {
      result.innerHTML =
        "今回は医療費控除の対象にならないようです。<br>" +
        `<small>(医療費 ${yen(medical)} − 戻ったお金 ${yen(refund)} が、${thresholdNote}以下のため)</small><br>` +
        "<small>ほかの家族の医療費や、通院の交通費を入れ忘れていないか確認してみてね。</small>";
      return;
    }

    const back = deduction * (rate / 100);   // 戻る所得税の目安
    const resident = deduction * 0.1;        // 翌年の住民税が安くなる目安

    result.innerHTML =
      "医療費控除の額は…<br>" +
      `<span class="big">${yen(deduction)}</span>` +
      (overLimit ? "<br><small>(上限の200万円で計算しました)</small>" : "") +
      "<hr style='border:none;border-top:1px dashed #f0dfe2;margin:12px 0;'>" +
      `戻ってくる所得税の目安:<b>${yen(back)}</b><br>` +
      `翌年の住民税が安くなる目安:<b>${yen(resident)}</b><br>` +
      `<small>(医療費 ${yen(medical)} − 戻ったお金 ${yen(refund)} − ${thresholdNote})</small>`;
  });
}
