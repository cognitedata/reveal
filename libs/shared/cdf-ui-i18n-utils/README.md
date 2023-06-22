# cdf-hub-i18n-utils-cli

## Install

The cli comes together with the `@cognite/cdf-i18n-utils` package.

```sh
$ yarn add @cognite/cdf-i18n-utils
```

## Usage

```sh
$ cdf-i18n-utils-cli --help
```

Help output:

```
cdf-i18n-utils-cli <command>

Commands:
  cdf-i18n-utils-cli pull-keys-from-remote [projectId] [namespace] [productionVersion] [path]         downloads translations from remote (overrides local files)
  cdf-i18n-utils-cli save-missing-keys-to-remote [projectId] [namespace] [stagingVersion] [path]      saves missing keys to remote staging version (does not update the existing values in locize)
  cdf-i18n-utils-cli remove-deleted-keys-from-remote [projectId] [namespace] [stagingVersion] [path]  removes deleted keys from remote staging version
  cdf-i18n-utils-cli sort-local-keys [path] [sourceLanguage]                                          sorts local files
  cdf-i18n-utils-cli.js remove-unused-keys [path] [sourceLanguage] [folders] [extensions]             remove unused keys

Options:
  --help     Show help                                                                                                                                                                         [boolean]
  --verbose  Run with verbose logging                                                                                                                                                          [boolean]
```

## Available commands

- [pull-keys-from-remote](#pull-keys-from-remote)
- [save-missing-keys-to-remote](#save-missing-keys-to-remote)
- [remove-deleted-keys-from-remote](#remove-deleted-keys-from-remote)
- [sort-local-keys](#sort-local-keys)

### pull-keys-from-remote

```sh
$ cdf-i18n-utils-cli pull-keys-from-remote --help
```

Help output:

```
cdf-i18n-utils-cli pull-keys-from-remote [projectId] [namespace] [productionVersion] [path]

downloads translations from remote (overrides local files)

Options:
      --help               Show help                                                                                                                                                           [boolean]
      --verbose            Run with verbose logging                                                                                                                                            [boolean]
  -i, --projectId          The project id to use for operations                                                                               [string] [default: "0f0363e6-4ef6-49cf-8f1b-e0d993b4b828"]
  -n, --namespace          The namespace to target for translations                                                                                                                  [string] [required]
      --productionVersion  The production version to pull translations                                                                                                  [string] [default: "production"]
  -p, --path               The path to download translations                                                                                        [string] [default: "./src/common/i18n/translations"]
```

### save-missing-keys-to-remote

```sh
$ cdf-i18n-utils-cli save-missing-keys-to-remote --help
```

Help output:

```
cdf-i18n-utils-cli save-missing-keys-to-remote [projectId] [namespace] [stagingVersion] [path]

saves missing keys to remote staging version (does not update the existing values in locize)

Options:
      --help            Show help                                                                                                                                                              [boolean]
      --verbose         Run with verbose logging                                                                                                                                               [boolean]
  -i, --projectId       The project id to use for operations                                                                                  [string] [default: "0f0363e6-4ef6-49cf-8f1b-e0d993b4b828"]
  -n, --namespace       The namespace to target for translations                                                                                                                     [string] [required]
      --stagingVersion  The staging version to use for operations                                                                                                           [string] [default: "latest"]
  -p, --path            The path to read local translations                                                                                         [string] [default: "./src/common/i18n/translations"]
```

### remove-deleted-keys-from-remote

```sh
$ cdf-i18n-utils-cli remove-deleted-keys-from-remote --help
```

Help output:

```
cdf-i18n-utils-cli remove-deleted-keys-from-remote [projectId] [namespace] [stagingVersion] [path]

removes deleted keys from remote staging version

Options:
      --help            Show help                                                                                                                                                              [boolean]
      --verbose         Run with verbose logging                                                                                                                                               [boolean]
  -i, --projectId       The project id to use for operations                                                                                  [string] [default: "0f0363e6-4ef6-49cf-8f1b-e0d993b4b828"]
  -n, --namespace       The namespace to target for translations                                                                                                                     [string] [required]
      --stagingVersion  The staging version to use for operations                                                                                                           [string] [default: "latest"]
  -p, --path            The path to read local translations                                                                                         [string] [default: "./src/common/i18n/translations"]
```

### sort-local-keys

```sh
$ cdf-i18n-utils-cli sort-local-keys --help
```

Help output:

```
cdf-i18n-utils-cli sort-local-keys [path] [sourceLanguage]

sorts local files

Options:
      --help            Show help                                                                                                                                                              [boolean]
      --verbose         Run with verbose logging                                                                                                                                               [boolean]
  -p, --path            The path to read local translations                                                                                         [string] [default: "./src/common/i18n/translations"]
      --sourceLanguage  The source language to sort files                                                                                                                       [string] [default: "en"]
```

### remove-unused-keys

```sh
$ cdf-i18n-utils-cli remove-unused-keys --help
```

Help output:

```
cdf-i18n-utils-cli.js remove-unused-keys [path] [sourceLanguage] [folders] [extensions]

remove unused keys

Options:
      --help            Show help                                                                                                                                                       [boolean]
      --verbose         Run with verbose logging                                                                                                                                        [boolean]
  -p, --path            The path to read local translations                                                                                  [string] [default: "./src/common/i18n/translations"]
      --sourceLanguage  The source language to sort files                                                                                                                [string] [default: "en"]
      --folders         comma separated list of folders to search                                                                                                     [string] [default: "./src"]
      --extensions      comma separated list of allowed extensions                                                                                                 [string] [default: ".ts,.tsx"]
```

## Environment Variables

As an alternative to command options, you can use environment variables with the `LOCIZE` prefix. For example, instead of passing `--projectId` option, you can set an environment variable with the name `LOCIZE_PROJECT_ID`.
