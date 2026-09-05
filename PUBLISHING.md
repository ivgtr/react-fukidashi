# Publishing

GitHub Releaseを公開すると、[publish.yml](.github/workflows/publish.yml) がnpmへ公開します。認証にはTrusted Publishing（OIDC）を使い、`NPM_TOKEN` は使用しません。PRのマージやタグのpushだけでは公開されません。

## Setup

npmにパッケージの管理権限があるアカウントでログインし、`react-fukidashi` の **Settings → Trusted publishing → Add trusted publisher** から次を登録します。

```text
Publisher: GitHub Actions
Organization or user: ivgtr
Repository: react-fukidashi
Workflow filename: publish.yml
Environment name: 空欄
Allowed actions: npm publish を許可
```

Workflow filenameは `.github/workflows/publish.yml` ではなく `publish.yml` です。GitHub Environmentは使わないため、Environment nameは `npm` などを入力せず空欄にします。

`npm stage publish` だけでなく、直接公開する `npm publish` を許可してください。このワークフローはステージング承認方式を使いません。入力値は大文字・小文字も一致させます。

GitHub側に新しいSecretやEnvironmentを作る必要はありません。ワークフローはGitHub-hosted runnerとNode 24を使い、公開ジョブだけに `id-token: write` を付与しています。npm 11.5.1未満では公開前に停止します。公開用ジョブでは依存キャッシュを使わず、`npm ci` から検証・ビルドします。

## Release

ローカル環境は不要です。**先にファイル内のバージョンを更新してmainへマージし、その後に新しいタグとReleaseを作成します。** Releaseのタグ名やタイトルを変えても、ファイルのバージョンは自動更新されません。

次は正式版 `2.0.0` を公開する例です。以降の公開では、npmで未公開かつGitタグも未使用のバージョンに読み替えてください。

1. GitHubの **Code** 画面でmainから作業ブランチを作り、次の3か所をすべて `2.0.0` に揃えます。依存パッケージのバージョンは変更しません。
   - `package.json` の `version`
   - `package-lock.json` 冒頭の `version`
   - `package-lock.json` の `packages[""].version`
2. PRを作成し、React 18/19の検証・配布物導入とChromium/Firefox/WebKitの全CI成功を確認してmainへマージします。バージョン更新済みのPRをマージした場合、この編集は不要です。
3. mainの `package.json` が `2.0.0` になったことを確認してから、**Releases → Draft a new release** を開きます。**新規タグ `v2.0.0`、Target `main`** を選びます。既存のベータ版タグは選びません。
4. 正式版なので **Set as a pre-release** はオフにして、**Publish release** を実行します。ビルド・検証・npm公開はActionsが行います。
5. **Actions → Publish to npm** の成功と、npm上のバージョン・provenanceを確認します。

タグ名は `v${package.jsonのversion}` と完全一致が必要です。lockfileの2か所も一致を検査します。不一致のまま公開したり、公開時だけファイルを自動で書き換えたりはしません。npmのdist-tagはバージョンに `-` があれば `beta`、なければ `latest` です。GitHubのpre-releaseチェックだけでは切り替わりません。

ローカルで作業する場合は、手順1の編集を次のコマンドでも行えます。`--no-git-tag-version` により、ここではコミットやタグを作成しません。

```sh
npm version 2.0.0 --no-git-tag-version
npm ci
npm run check
npm run test:consumer
```

公開後は、npmのパッケージページ、または次のコマンドで確認できます。

```sh
npm view react-fukidashi dist-tags --json
npm view react-fukidashi@2.0.0 version
npm install react-fukidashi
```

## 失敗したリリースの再試行

`v2.0.0-beta.0` はトークン認証の旧ワークフローを含むコミットを指しています。`v2.0.0-beta.1` はOIDC移行後のコミットですが、ファイル内のバージョンが `2.0.0-beta.0` のままだったため、タグ一致チェックで停止しました。

**古い実行をRe-runしても、元のコミット・タグが使われます。** mainを修正しても既存タグの内容は変わりません。この不一致は `v2.0.0-beta.2` で修正して公開済みです。以降もコードの修正が必要な場合は、修正・バージョン更新を含むPRをマージしてから新しいタグを作成してください。既存タグの削除・付け替えや、公開済みバージョンの上書きは行いません。

タグ不一致のログには、実際のReleaseタグ、`package.json` のバージョン、期待するタグ名が表示されます。公開対象コミットを選び間違えていないかも確認してください。

OIDC移行後の実行でnpm側の登録値だけを修正した場合は、その実行をRe-runできます。ただし同じバージョンがすでに公開されていないことを確認してください。PRのCI成功は、npmへの認証成功を意味しません。

## 移行後

OIDCでの公開成功を確認してから、npmの **Settings → Publishing access** を **Require two-factor authentication and disallow tokens** に変更します。この設定は従来のトークン公開を禁止しますが、Trusted Publishingは引き続き使えます。

GitHubの **Settings → Secrets and variables → Actions** から、このリポジトリの不要になった `NPM_TOKEN` を削除します。npmのAccess Tokensでも、他のパッケージやワークフローが使っていないことを確認してから旧トークンを失効させてください。

認証エラー時は、Trusted Publisherの登録値、`npm publish` の許可、実行したタグに新ワークフローが含まれるかを確認します。`npm whoami` はOIDC認証の確認には使えません。公開処理中だけ認証が行われるため、PRのCI成功やdry-runだけでは認証成功を検証できません。

## References

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm version](https://docs.npmjs.com/cli/v11/commands/npm-version/)
- [GitHub Actionsの再実行](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
