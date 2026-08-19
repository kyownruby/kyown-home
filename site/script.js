// 桜の花びらを生成する
// - 同時に存在する枚数は少なめ（7枚）
// - 大きさ・速度・開始位置・タイミングは1枚ごとにランダム
// - prefers-reduced-motion のときは生成しない（CSS側でも非表示にしている）
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var container = document.querySelector(".sakura");
  if (!container) {
    return;
  }

  var PETAL_COUNT = 7; // 5〜8枚程度に抑える（増やしすぎると重い＆読みにくい）
  var COLORS = ["#FBEAF0", "#F4C0D1", "#ED93B1"];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var petal = document.createElement("span");
    petal.className = "petal";

    var sway = document.createElement("span");
    sway.className = "petal-sway";

    var shape = document.createElement("span");
    shape.className = "petal-shape";

    petal.style.setProperty("--petal-left", rand(0, 100) + "vw");
    petal.style.setProperty("--petal-size", rand(10, 18) + "px");
    petal.style.setProperty("--petal-color", COLORS[Math.floor(Math.random() * COLORS.length)]);
    // 1枚あたり10〜20秒かけて画面を縦断する
    petal.style.setProperty("--fall-duration", rand(10, 20) + "s");
    // 負のdelayで、ページを開いた時点から画面のあちこちに散らばせる
    petal.style.setProperty("--fall-delay", -rand(0, 20) + "s");
    petal.style.setProperty("--sway-duration", rand(3, 6) + "s");
    petal.style.setProperty("--sway-amount", rand(20, 60) + "px");
    petal.style.setProperty("--spin-duration", rand(4, 9) + "s");

    sway.appendChild(shape);
    petal.appendChild(sway);
    container.appendChild(petal);
  }
})();
