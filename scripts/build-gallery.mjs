// build-gallery.mjs — gallery の自動振り分け＆ページ生成スクリプト
//
// 使い方：
//   1. site/assets/gallery/_upload/ に「キャラ名_タイトル.拡張子」形式で画像を置く
//      （例：mia_おひるね.png → assets/gallery/mia/ へ振り分け）
//   2. リポジトリのルートで `npm run gallery` を実行
//
// やること：
//   - _upload の画像をプレフィックスでキャラフォルダへ振り分け（原寸は無圧縮コピー）
//   - 幅800pxのWebPサムネイルを thumb/ に生成
//   - 各キャラフォルダの gallery.json を追記型で更新（date の新しい順）
//   - gallery.json をもとに site/gallery/○○.html（メイソンリー表示）を再生成
//   - 処理済みの画像は _upload から削除（プレフィックス不一致は警告して残す）

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const GALLERY_ASSETS = path.join(SITE, "assets", "gallery");
const UPLOAD_DIR = path.join(GALLERY_ASSETS, "_upload");
const PAGES_DIR = path.join(SITE, "gallery");

const CHARS = [
  { slug: "kyown", name: "きょん" },
  { slug: "mia", name: "ミア" },
  { slug: "rain", name: "レイン" },
  { slug: "shiori", name: "しおり" },
];

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const THUMB_WIDTH = 800;

// ---------- 1. _upload の走査と振り分け ----------

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

async function processUploads() {
  const added = Object.fromEntries(CHARS.map((c) => [c.slug, 0]));
  const entries = fs.existsSync(UPLOAD_DIR)
    ? fs.readdirSync(UPLOAD_DIR, { withFileTypes: true })
    : [];

  for (const dirent of entries) {
    if (!dirent.isFile()) continue;
    const file = dirent.name;
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue; // 画像以外（メモ用ファイルなど）はそのまま残す

    const char = CHARS.find((c) => file.startsWith(c.slug + "_"));
    if (!char) {
      console.warn(`⚠️  振り分け先が分からないので残しました: ${file}`);
      console.warn(`    （ファイル名は kyown_ / mia_ / rain_ / shiori_ で始めてね）`);
      continue;
    }

    const srcPath = path.join(UPLOAD_DIR, file);
    const charDir = path.join(GALLERY_ASSETS, char.slug);
    const thumbDir = path.join(charDir, "thumb");
    fs.mkdirSync(thumbDir, { recursive: true });

    // 画像の実サイズを読み取る
    const meta = await sharp(srcPath).metadata();
    const w = meta.width;
    const h = meta.height;

    // 原寸：無圧縮でそのままコピー（ライトボックス表示用）
    fs.copyFileSync(srcPath, path.join(charDir, file));

    // サムネイル：幅800pxのWebP（元がそれより小さければ拡大しない）
    const thumbName = path.basename(file, ext) + ".webp";
    await sharp(srcPath)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(thumbDir, thumbName));

    // gallery.json を追記型で更新（同名ファイルの再アップは上書き）
    const jsonPath = path.join(charDir, "gallery.json");
    const list = loadJson(jsonPath);
    const title = path.basename(file, ext).slice(char.slug.length + 1);
    const date = fs.statSync(srcPath).mtime.toISOString().slice(0, 10);
    const entry = {
      full: `assets/gallery/${char.slug}/${file}`,
      thumb: `assets/gallery/${char.slug}/thumb/${thumbName}`,
      title,
      w,
      h,
      date,
    };
    const idx = list.findIndex((e) => e.full === entry.full);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)); // 新しい順
    fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2) + "\n");

    // 処理が終わった画像は _upload から削除
    fs.unlinkSync(srcPath);
    added[char.slug]++;
  }
  return added;
}

// ---------- 2. ギャラリーページの生成 ----------

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// メイソンリーの行スパン（初期値・列幅240px想定）。
// 実際の列幅に合わせた再計算はページ側の gallery.js が行う
const ROW = 8; // grid-auto-rows と合わせる
const GAP = 16; // gap と合わせる
function spanFor(w, h, colWidth = 240) {
  return Math.ceil((colWidth * (h / w) + GAP) / (ROW + GAP));
}

function renderCards(list, charName) {
  if (list.length === 0) {
    return `        <p class="gallery-empty">準備中…もう少し待っててね 🌸</p>`;
  }
  return list
    .map((e) => {
      const alt = escapeHtml(`${charName}「${e.title}」`);
      return `          <a class="gallery-item" href="../${e.full}" style="grid-row: span ${spanFor(e.w, e.h)};" data-w="${e.w}" data-h="${e.h}">
            <img src="../${e.thumb}" alt="${alt}" width="${e.w}" height="${e.h}" loading="lazy" decoding="async">
          </a>`;
    })
    .join("\n");
}

function renderPage(char, list) {
  const grid =
    list.length === 0
      ? renderCards(list, char.name)
      : `        <div class="gallery-list">\n${renderCards(list, char.name)}\n        </div>`;
  return `<!DOCTYPE html>
<!-- このファイルは scripts/build-gallery.mjs が自動生成する。直接編集しない（npm run gallery で再生成） -->
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${char.name}のギャラリー | kyownruby</title>
  <meta name="description" content="${char.name}のイラストギャラリー。">

  <link rel="icon" href="../favicon.ico" sizes="32x32">
  <link rel="icon" href="../assets/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="../assets/favicon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body>

  <!-- ランタンの灯り＋星の瞬き（トップページの縮小版・CSSのみ） -->
  <div class="night-sky" aria-hidden="true">
    <span class="lantern" style="left: -70px;  top: 8%;  width: 240px; height: 240px; --fd: 7.3s; --fdelay: 0s;"></span>
    <span class="lantern" style="right: -80px; top: 45%; width: 280px; height: 280px; --fd: 9.1s; --fdelay: -3.4s;"></span>
    <span class="lantern" style="left: -60px;  top: 78%; width: 220px; height: 220px; --fd: 6.2s; --fdelay: -1.8s;"></span>
    <span class="star" style="left: 12%; top: 6%;  --td: 3.1s; --tdelay: 0s;"></span>
    <span class="star" style="left: 34%; top: 12%; --td: 2.4s; --tdelay: -0.9s;"></span>
    <span class="star" style="left: 55%; top: 5%;  --td: 3.8s; --tdelay: -2.2s;"></span>
    <span class="star" style="left: 72%; top: 14%; --td: 2.8s; --tdelay: -1.4s;"></span>
    <span class="star" style="left: 89%; top: 8%;  --td: 3.4s; --tdelay: -0.5s;"></span>
  </div>

  <!-- 桜の花びら（JSで生成・pointer-events: none） -->
  <div class="sakura" aria-hidden="true"></div>

  <div class="page">

    <!-- ヘッダー：トップへ戻る＋キャラ名の見出し -->
    <header class="section gallery-header">
      <a class="back-link" href="../index.html">← トップへ戻る</a>
      <h1 class="gallery-title">${char.name}</h1>
    </header>

    <main>
      <section class="section gallery-section">
${grid}
      </section>
    </main>

  </div>

  <!-- ライトボックス（クリックで原寸表示。Esc・背景クリックで閉じる） -->
  <div class="lightbox" id="lightbox" hidden>
    <img alt="">
  </div>

  <script src="../script.js"></script>
  <script src="gallery.js"></script>
</body>
</html>
`;
}

function buildPages() {
  for (const char of CHARS) {
    const list = loadJson(path.join(GALLERY_ASSETS, char.slug, "gallery.json"));
    fs.writeFileSync(path.join(PAGES_DIR, `${char.slug}.html`), renderPage(char, list));
  }
}

// ---------- 実行 ----------

const added = await processUploads();
buildPages();

const total = Object.values(added).reduce((a, b) => a + b, 0);
console.log(`\n✅ 追加 ${total} 枚（ページはgallery.jsonから毎回再生成）`);
for (const char of CHARS) {
  const count = loadJson(path.join(GALLERY_ASSETS, char.slug, "gallery.json")).length;
  console.log(`   ${char.name.padEnd(3, "　")} +${added[char.slug]} （合計 ${count} 枚）`);
}
