## [0.6.0] - 9 Aug, 2022
### Added
- `lowercase` and `uppercase` post processors

## [0.5.0] - 9 Aug, 2022
### Added
- `sort-local-keys` command

## [0.4.0] - 2 Aug, 2022
### Removed
- `@cognite/react-feature-flags` from dependency list
- `useLanguage` hook
- `flagProviderProps` prop from `I18nWrapper`

### Updated
- `deploy-storybook` job to `publish-package`

## [0.3.0] - 25 Jul, 2022
### Added
- Utility types: `ExtendedTranslationKeys`, `MakeSingular`, `PluralKey` and `PluralKeySuffix`
- GitHub workflow to publish the package to npm

### Changed
- `useTypedTranslation` to use `ExtendedTranslationKeys` for plural keys.
