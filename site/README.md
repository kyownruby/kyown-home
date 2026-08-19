# site/ — きょんの入口ページ

きょん（@kyownruby）の活動をまとめた1ページの入口サイト。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（テキスト・リンクはすべてここ） |
| `style.css` | 配色・レイアウト・アニメーション |
| `script.js` | 桜の花びらの生成（ランダム配置） |
| `assets/icon/` | 画像置き場（トップ画像 `top.webp` ＋ キャラアイコン4人分） |

## テキストの差し替え方

`index.html` 内の以下のコメント直後の行を書き換える：

| コメント | 場所 |
| --- | --- |
| `<!-- 肩書き（2〜3行） -->` | ヒーロー |
| `<!-- About（3〜4行） -->` | about |
| `<!-- フッターの一言 -->` | フッター |

ツールの説明文は tools セクションの `<p class="card-sub">` を直接書き換える。

## 画像

### キャラアイコン（反映済み）

`site/assets/icon/` の画像を characters セクションで使用中：

| ファイル | 使用箇所 |
| --- | --- |
| `kyown_icon.png` | きょん（1行目・横幅いっぱい） |
| `mia_icon.png` | ミア |
| `rain_icon.png` | レイン |
| `shiori_icon.png` | しおり |

差し替えるときは、同じファイル名で上書きするだけでOK。
正方形の画像を想定（丸く切り抜かれて表示される）。

### トップ画像（反映済み）

ヒーロー最上部の横長バナーに `site/assets/icon/top.webp` を使用中。

- 画面の**端から端まで**広がる横長バナー（角丸なし）
- 基本は **16:9**。ただし画面が横に広いときは高さの上限（`58svh`）が効いて、
  上下が少しトリミングされる（名前や肩書きが画面外に落ちないようにするため）
- `object-fit: cover` なので、**横長（16:9前後）の画像**がいちばんきれいに収まる
- トリミング位置は `object-position: center 42%` でやや上寄り（顔が残るように）
- 差し替えるときは `top.webp` を同名で上書きするだけでOK。
  別のファイル名にしたい場合は `index.html` 内を
  「**★トップ画像の差し替え位置★**」で検索して `src` を書き換える

## Cloudflare Pages でのデプロイ手順

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 連携で `kyownruby/kyown-home` リポジトリを選択
3. ビルド設定：
   - **Framework preset**: None
   - **Build command**: （空欄のまま）
   - **Build output directory**: `site`
4. **Save and Deploy** を押すと `https://<プロジェクト名>.pages.dev` で公開される
5. 以降は `main` ブランチに push するたびに自動で再デプロイされる
