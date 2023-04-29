# Contributor Manual

👏 We welcome contributions of any size and skill level. As an open source project, we believe in giving back to our
contributors and are happy to help with guidance on pull requests (PRs), technical writing, and turning any feature idea
into a reality.

> 💡 **Tip for new contributors**:
> Take a look
> at [https://github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions)
> for helpful information on contributing.

## Quick Guide

### Prerequisite

Due to the fact that this is an integration for [🚀Astro](https://astro.build) we have to make sure, we do not
prerequisite newer versions of `node` nor `pnpm` then [🚀Astro](https://astro.build) does (refer
to https://github.com/withastro/astro/blob/main/package.json) otherwise, your build will fail:

```shell
node: ">=16.12.0"
pnpm: "^7.9.5"
```

### Setting up your local repository

[🚀Astro](https://astro.build) uses `pnpm` workspaces, so we do also.

You should **always run `pnpm install` from the top-level project directory.** running `pnpm install` in the top-level
project root will install dependencies for our project, and every package in the repo.

```shell
git clone ssh://git@github.com:<YOUR-ACCOUNT>/<YOUR-REPOSITORY>.git && cd <YOUR-REPOSITORY>
pnpm install
pnpm run build
```

To automatically handle merge conflicts in `pnpm-lock.yaml`, you should run the following commands locally.

```shell
pnpm add -g @pnpm/merge-driver
pnpx npm-merge-driver install --driver-name pnpm-merge-driver --driver "pnpm-merge-driver %A %O %B %P" --files pnpm-lock.yaml
```

### Development

```shell
# starts a file-watching, live-reloading dev script for active development
pnpm run dev
# build the entire project, one time.
pnpm run build
```

### Running tests ?????????????????????????????

```shell
# run this in the top-level project root to run all tests
pnpm run test
# run only a few tests in the `astro` package, great for working on a single feature
# (example - `pnpm run test:match "cli"` runs `cli.test.js`)
pnpm run test:match "$STRING_MATCH"
# run tests on another package
# (example - `pnpm --filter @astrojs/rss run test` runs `packages/astro-rss/test/rss.test.js`)
pnpm --filter $STRING_MATCH run test
```

### Other useful commands

```shell
# auto-format the entire project
# (optional - a GitHub Action formats every commit after a PR is merged)
pnpm run format
```

```shell
# lint the project
# (optional - our linter creates helpful warnings, but not errors.)
pnpm run lint
```

### Making a pull request (PR)

When making a pull request (PR), be sure to add a changeset when something has changed. Non-packages (`demos/*`) do not
need changesets.

```shell
pnpm exec changeset
```

## Code structure

Server-side rendering (SSR) can be complicated. There are 3 contexts in which code executes:

- **[Astro](https://astro.build) and [Vite](https://vitejs.dev/) configuration**: this code lives
  in `src/AstroStaticCMSPlugin/`.
- **During the [Rollup](https://rollupjs.org/) bundling/development stage**: this code lives
  in `src/StaticCMSEditorUIRoute/`.
- **In the browser preview pane of [Static CMS](https://staticcms.org)**: this code lives
  in `src/StaticCMSPreviewTemplate/`.

Understanding in which environment code runs, and at which stage in the process, can help clarify thinking what this
integration is doing.

It also helps with debugging, for instance, if you’re working within `src/AstroStaticCMSPlugin/`, you know that your
code isn’t executing within [Rollup](https://rollupjs.org/) bundling stage for live preview. If you want to change the
default preview template start developing in `src/StaticCMSPreviewTemplate/`. Make sure it's a self-contained page.

We use [Rollup](https://rollupjs.org/) to build the different contexts.

## Branches

### 🧑‍💻 `main` (development)

Active `@grewety/astro-static-cms` development happens on the [`main`](https://github.com/withastro/astro/tree/main)
branch. `main` always reflects the latest code.

> 💡 **Note**:
> During certain periods, we put `main` into a [**prerelease**][prerelease] state. Read more about [releasing 
> @grewety/astro-static-cms](#releasing).

### 🎁 `latest` (released)

The **stable** release of `@grewety/astro-static-cms` can always be found on
the [`latest`](https://github.com/withastro/astro/tree/latest) branch. `latest` is automatically updated every time we
publish a stable (not prerelease) version of `@grewety/astro-static-cms`.

## Releasing

> 💡 **Note**:
> Only [🥇Core Members](GOVERNANCE.md#core-member---gold-kudo) can release new versions of 
> `@grewety/astro-static-cms`.

The repository is set up with automatic releases, using the changeset GitHub action & bot.

To release a new version of `@grewety/astro-static-cms`, find the `Version Packages` pull request (PR), read it over, and
merge it.

### Releasing pull request (PR) preview snapshots

The release tool `changeset` (from [@changesets/cli](https://www.npmjs.com/package/@changesets/cli)) has a feature for
releasing "snapshot" releases from a pull request (PR) or custom branch.
These are `npm` package publishes that live temporarily, so that you can give users a way to test a pull request (PR)
before merging. This can be a great way to get early user feedback while still in the pull request (PR) review process.

To run `changeset version` locally, you'll need to create a [GitHub personal access token][gitaccesstoken] and set 
it as a `GITHUB_TOKEN` environment variable.

To release a snapshot, run the following locally:

> 💡 **Notes**:
> - `YYY` should be a keyword to identify this release, e.g. `berlin`. For
    example: `--snapshot berlin` & `--tag next--berlin`
> - Use `npm/npx` instead of `pnpm`, since npm handles registry login, authentication and publishing.
> - Adding `GITHUB_TOKEN` in the command adds that token to your shell history! Set a short expiration.

```shell
# 1: Tag the new release versions
GITHUB_TOKEN=XXX npx changeset version --snapshot YYY
# 2: Review the diff, and make sure that you're not releasing more than you need to.
git checkout -- examples/
# 3: Release
npm run release --tag next--YYY
# 4: If you're satisfied, you can now throw out all local changes
git reset --hard
```

By default, every package with a changeset will be released. If you only want to target a smaller subset of packages for
release, you can consider clearing out the `.changesets` directory to replace all existing changesets with a single
changeset of only the packages that you want to release. Just be sure not to commit or push this to `main`, since it
will destroy existing changesets that you will still want to eventually release.

> 💡 Full documentation: https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md

### Releasing `astro-static-cms@next` (aka "prerelease mode")

Sometimes, the repository will enter into "prerelease mode". In prerelease mode, our normal release process will
publish `npm` versions under the `next` tag, instead of the default `latest` tag. We do this from time-to-time to test
large features before sharing them with the larger audience.

While in "prerelease mode", follow the normal release process to release `astro-static-cms@next` instead
of `astro-static-cms@latest`. To release `astro-static-cms@latest` instead,
see [Releasing `astro-static-cms@latest` while in prerelease mode](#releasing-astro-static-cmslatest-while-in-prerelease-mode).

> 💡 Full documentation: https://github.com/changesets/changesets/blob/main/docs/prereleases.md

#### Entering prerelease mode

If you have gotten permission from the core contributors, you can enter into prerelease mode by following the following
steps:

1. Run: `pnpm exec changeset pre enter next` in the project root.
2. Create a new pull request (PR) from the changes created by this command.
3. Review, approve, and more the pull request (PR) to enter prerelease mode.
4. If successful, The "Version Packages" pull request (PR) (if one exists) will now say "Version Packages (next)".

#### Exiting prerelease mode

Exiting prerelease mode should happen once an experimental release is ready to go
from `npm install @grewety/astro-static-cms@next` to `npm install @grewety/astro-static-cms`. Only a core contributor run
these steps. These steps should be run before.

- Run: `pnpm exec changeset pre exit` in the project root.
- Create a new pull request (PR) from the changes created by this command.
- Review, approve, and more the pull request (PR) to enter prerelease mode.
- If successful, The "Version Packages (next)" pull request (PR) (if one exists) will now say "Version Packages".

### Releasing `astro-static-cms@latest` while in prerelease mode

When in prerelease mode, the automatic pull request (PR) release process will no longer
release `astro-static-cms@latest`, and will instead release `astro-static-cms@next`. That means that releasing
to `latest` becomes a manual process. To release latest manually while in prerelease mode:

> 💡 **Note**: In the code snippets below, replace `0.X.Z` with your version (ex: `0.18.2`, `release/0.18.2`, etc.).

1. Create a new `release/0.X.Z` branch, if none exists.
2. Point `release/0.X.Z` to the latest commit for the `v0.X.Z` version.
3. `git cherry-pick` commits from `main`, as needed.
4. Make sure that all changesets for the new release are included. You can create some manually (
   via `pnpm exec changeset`) if needed.
5. Run `pnpm exec changeset version` to create your new release.
6. Run `pnpm exec release` to publish your new release.
7. Run `git push && git push --tags` to push your new release to GitHub.
8. Run `git push release/0.X:latest` to push your release branch to `latest`.
9. Go to https://github.com/withastro/astro/releases/new and create a new release. Copy the new changelog entry
   from https://github.com/withastro/astro/blob/latest/packages/astro/CHANGELOG.md.

---
👏 Inspired by https://github.com/withastro/astro/blob/main/CONTRIBUTING.md.

[gitaccesstoken]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

[prerelease]: https://github.com/changesets/changesets/blob/main/docs/prereleases.md#prereleases
