# site/ — きょんの入口ページ

きょん（@kyownruby）の活動をまとめた1ページの入口サイト。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（テキスト・リンクはすべてここ） |
| `style.css` | 配色・レイアウト・アニメーション |
| `script.js` | 桜の花びらの生成（ランダム配置） |
| `assets/` | 画像置き場（アイコン・キャラ画像を入れる） |

## テキストの差し替え方

`index.html` 内を「**★仮**」で検索すると、差し替え箇所が全部見つかる：

1. 肩書き（ヒーロー・2〜3行）
2. About（3〜4行）
3. のーとびより β の説明（1行）
4. Daylin の説明（1行）
5. フッターの一言

## 画像の差し替え方

1. `site/assets/` フォルダに画像を置く
2. `index.html` 内のコメント（`<!-- キャラ画像を入れる場合 -->`）に従って `<img>` タグを追加する
   - ヒーローアイコン: `.hero-icon` 内の `<span>` を `<img src="assets/icon.png" alt="">` に差し替え
   - キャラアイコン: 各 `.char-icon` の中に `<img src="assets/mia.png" alt="ミア">` などを追加

## Cloudflare Pages でのデプロイ手順

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 連携で `kyownruby/kyown-home` リポジトリを選択
3. ビルド設定：
   - **Framework preset**: None
   - **Build command**: （空欄のまま）
   - **Build output directory**: `site`
4. **Save and Deploy** を押すと `https://<プロジェクト名>.pages.dev` で公開される
5. 以降は `main` ブランチに push するたびに自動で再デプロイされる
