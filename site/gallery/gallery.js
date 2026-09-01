// ギャラリーページ共通スクリプト
// 1) メイソンリーの行スパン再計算 … HTMLにはビルド時のスパン（列幅240px想定）が
//    入っているが、実際の列幅は画面サイズで変わるため、実測して補正する
// 2) ライトボックス … サムネクリックで原寸画像を表示（Esc・背景クリックで閉じる）
(function () {
  "use strict";

  var ROW = 8; // style.css の grid-auto-rows と合わせる
  var GAP = 16; // style.css の gap と合わせる

  var grid = document.querySelector(".gallery-list");
  var items = grid ? Array.prototype.slice.call(grid.querySelectorAll(".gallery-item")) : [];

  function relayout() {
    items.forEach(function (item) {
      var w = parseInt(item.dataset.w, 10);
      var h = parseInt(item.dataset.h, 10);
      if (!w || !h) return;
      var colWidth = item.getBoundingClientRect().width;
      if (!colWidth) return;
      var span = Math.ceil((colWidth * (h / w) + GAP) / (ROW + GAP));
      item.style.gridRow = "span " + span;
    });
  }

  if (grid) {
    relayout();
    if ("ResizeObserver" in window) {
      new ResizeObserver(relayout).observe(grid);
    } else {
      window.addEventListener("resize", relayout);
    }
  }

  // ---------- ライトボックス ----------

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  var lightboxImg = lightbox.querySelector("img");

  function open(href, alt) {
    lightboxImg.src = href;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
  }

  function close() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.classList.remove("lightbox-open");
  }

  items.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      var thumb = item.querySelector("img");
      open(item.href, thumb ? thumb.alt : "");
    });
  });

  // 背景（画像の外側）クリックで閉じる。画像自体のクリックでは閉じない
  lightbox.addEventListener("click", function (e) {
    if (e.target !== lightboxImg) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) close();
  });
})();
