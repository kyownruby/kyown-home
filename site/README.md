# site/ — きょんの入口ページ

きょん（@kyownruby）の活動をまとめた1ページの入口サイト。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（テキスト・リンクはすべてここ） |
| `style.css` | 配色・レイアウト・アニメーション |
| `script.js` | 桜の花びらの生成（ランダム配置） |
| `assets/top.png` | OGP画像（1200×630・SNSシェア用） |
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

- 幅は**各セクションの中身と同じ 812px**（links などのカードと左右がぴったり揃う）
- 高さは**画像の比率のまま**。`object-fit` を使っていないので**トリミングは一切されない**
- 角丸12px（カードと同じ）
- 差し替え時の注意：`index.html` の `<img>` に付いている `width` / `height` 属性は、
  読み込み前に表示スペースを確保するためのもの。**比率の違う画像に差し替えるときは、
  この2つの数値も新しい画像の実寸に合わせて書き換える**（表示自体は書き換えなくても崩れない）
- 差し替えるときは `top.webp` を同名で上書きするだけでOK。
  別のファイル名にしたい場合は `index.html` 内を
  「**★トップ画像の差し替え位置★**」で検索して `src` を書き換える

## OGP（SNSでシェアされたときのカード）

`index.html` の `<head>` に OGP / Twitter Card のメタタグを設定済み。

| 項目 | 値 |
| --- | --- |
| タイトル | きょん(るびぃ) \| kyownruby |
| 説明 | note・イラスト・自作ツールはこちらから。 |
| 画像 | `https://kyownruby.pages.dev/assets/top.png` |
| URL | `https://kyownruby.pages.dev/` |
| カード形式 | `summary_large_image`（大きい画像付き） |

### OGP画像（`assets/top.png`）について

- `assets/icon/top.webp` を **1200×630px**（OGP標準サイズ）に中央寄せで切り出したもの
- **WebPを表示できないSNSがあるため、あえてPNGにしている**
- トップ画像を差し替えたら、この画像も作り直すこと：

```bash
python3 -c "
from PIL import Image
im = Image.open('site/assets/icon/top.webp').convert('RGB')
sw, sh = im.size
scale = max(1200/sw, 630/sh)
nw, nh = round(sw*scale), round(sh*scale)
r = im.resize((nw, nh), Image.LANCZOS)
r.crop(((nw-1200)//2, (nh-630)//2, (nw-1200)//2+1200, (nh-630)//2+630)).save('site/assets/top.png', 'PNG', optimize=True)
"
```

### 注意

- `og:image` は**絶対URL**（`https://` から始まる形）でないとSNS側が読み取れない
- 独自ドメインに変更した場合は、`og:image` / `og:url` / `twitter:image` の3か所のURLも書き換える
- 反映されないときはSNS側のキャッシュが原因。
  X は [Card Validator](https://cards-dev.twitter.com/validator)、
  Facebook は [Sharing Debugger](https://developers.facebook.com/tools/debug/) で再取得できる

## Cloudflare Pages でのデプロイ手順

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 連携で `kyownruby/kyown-home` リポジトリを選択
3. ビルド設定：
   - **Framework preset**: None
   - **Build command**: （空欄のまま）
   - **Build output directory**: `site`
4. **Save and Deploy** を押すと `https://<プロジェクト名>.pages.dev` で公開される
5. 以降は `main` ブランチに push するたびに自動で再デプロイされる
