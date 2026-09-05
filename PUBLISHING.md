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

1. 公開するバージョンを決め、作業ブランチで `npm version` を実行します。次の例は `2.0.0-beta.1` が未公開の場合です。

   ```sh
   npm version 2.0.0-beta.1 --no-git-tag-version
   npm ci
   npm run check
   ```

2. 更新された `package.json` と `package-lock.json` をコミットし、PRでmainへマージします。この段階ではタグを作りません。
3. GitHubの **Releases → Draft a new release** で、バージョンに `v` を付けた新規タグ（例: `v2.0.0-beta.1`）をmainから作成します。プレリリースなら **Set as a pre-release** を選び、**Publish release** を実行します。
4. **Actions → Publish to npm** の成功と、npm上のバージョン・provenanceを確認します。

タグ名は `v${package.jsonのversion}` と完全一致が必要です。npmのdist-tagはバージョンに `-` があれば `beta`、なければ `latest` です。GitHubのpre-releaseチェックだけでは切り替わりません。

```sh
npm view react-fukidashi dist-tags --json
npm view react-fukidashi@2.0.0-beta.1 version
npm install react-fukidashi@beta
```

## 旧ワークフローで失敗したリリース

既存の `v2.0.0-beta.0` はトークン認証のワークフローを含むコミットを指しています。移行PRのマージ後に古い実行をRe-runしても、元のコミットのワークフローが使われるためOIDCへ切り替わりません。

移行後のmainでバージョンを更新し、新しいタグとReleaseから公開してください。既存タグの削除・付け替えや、公開済みバージョンの上書きは行いません。上記の `2.0.0-beta.1` はそのための例です。

OIDC移行後の実行でnpm側の登録値だけを修正した場合は、その実行をRe-runできます。ただし同じバージョンがすでに公開されていないことを確認してください。

## 移行後

OIDCでの公開成功を確認してから、npmの **Settings → Publishing access** を **Require two-factor authentication and disallow tokens** に変更します。この設定は従来のトークン公開を禁止しますが、Trusted Publishingは引き続き使えます。

GitHubの **Settings → Secrets and variables → Actions** から、このリポジトリの不要になった `NPM_TOKEN` を削除します。npmのAccess Tokensでも、他のパッケージやワークフローが使っていないことを確認してから旧トークンを失効させてください。

認証エラー時は、Trusted Publisherの登録値、`npm publish` の許可、実行したタグに新ワークフローが含まれるかを確認します。`npm whoami` はOIDC認証の確認には使えません。公開処理中だけ認証が行われるため、PRのCI成功やdry-runだけでは認証成功を検証できません。

## References

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm version](https://docs.npmjs.com/cli/v11/commands/npm-version/)
- [GitHub Actionsの再実行](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
