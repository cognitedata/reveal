# Applications

[![codecov](https://codecov.io/gh/cognitedata/react-demo-app/branch/master/graph/badge.svg?token=uzusBZyM8s)](https://codecov.io/gh/cognitedata/react-demo-app)

This monorepository provides centralized management of Cognite's applications and reusable packages.

## Setup for local development

This repo uses [Bazel](https://bazel.build/) as a build tool. To get that set up:

1. Install Bazel through [Bazelisk](https://github.com/bazelbuild/bazelisk). This ensures that you always use the version of Bazel specified in `.bazelversion`.
2. Install Bazel watcher (ibazel) globally:
   ```sh
   yarn global add @bazel/ibazel
   ```

## How do I run my application locally?

All the api middleware have a set of scripts defined in their `package.json`.
In order to run a application you need to:

1. `cd` to that application directory
2. run `yarn start`, which will install all the required dependencies for the application and run it

## How do I add a dependency to my application?

This monorepository has a top-level `node_modules` and a top-level `yarn.lock`.
That means that if you want to add a dependency to your application you need to install it at the root level, then you can import it in the normal way in your application or package.
Whenever you've added a dependency and started using it, you need to run `yarn update-helpers` from the directory of your application. This will ensure Bazel appends this dependency to your application dependency tree.

## Creating a new application

To create a new application:

1. Clone this repo
2. Copy the `react-demo-app` folder

This will spit out all of the boilerplate that you need to have a production-capable [React]-based application at Cognite. It demonstrates best practices, such as:

- Lint setup to use
- Jenkinsfile steps
- TypeScript usage
- Storybook usage
- Testcafe
- Folder / component layout
- Authentication workflow

3. Find and replace all the occurences of `*demo*` string to appropriate values

## Importing existing application

1. In this repository set remote to be pointed to the repository you want to import

```sh
git remote add repo-to-import ~/repo-to-import
```

2. Pull changes from the newly established remote

```sh
git pull repo-to-import master --allow-unrelated-histories
```

3. Remove remote

```sh
git remote rm repo-to-import
```

[Here](https://medium.com/@ayushya/move-directory-from-one-repository-to-another-preserving-git-history-d210fa049d4b) is a good article.

## Deploying the app

Please see the [deployment guide] for more information how to actually get this app into production.
(It should be pretty easy!)

## Help

If you have any questions, please join us in [#frontend] and ask away!

[react]: https://reactjs.org/
[deployment guide]: https://cognitedata.atlassian.net/wiki/spaces/FAS/pages/1003225162/How+to+deploy+on+Frontend+App+Server+FAS
[#frontend]: https://cognitedata.slack.com/archives/C6KNJCEEA
[create repo page]: https://github.com/organizations/cognitedata/repositories/new
