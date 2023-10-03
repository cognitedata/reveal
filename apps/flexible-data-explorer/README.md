# Flexible Data Explorer (FDX)

Ownership: [team-explorers](https://cognitedata.slack.com/archives/C041Y4SJXC6) -
[CDF Program - End User Experience (UX++)](https://cognitedata.atlassian.net/wiki/spaces/PD/pages/3984130104/CDF+Program+-+End+User+Experience+UX)

## Running application locally

1. Start local development server for the business applications shell:
   ```
   nx serve business-shell
   ```
   ...or, start the application directly:
   ```
   nx serve flexible-data-explorer
   ```
2. Navigate to [localhost:3000](https://localhost:3000)

## Testing

```
nx test flexible-data-explorer
```

## Linting

```
nx lint flexible-data-explorer
```

## Internationalization with Locize

Follow the guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3924164983/Internationalization+infrastructure#Implementation-Guidelines) (also read upon the outdated, but relevant, guide [here](https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3519545557/Internationalization+with+Locize+in+Fusion)).

> TL;DR: all _static_ strings that are rendered in the application has to be wrapped with translation.
>
> ```ts
> import { useNavigation } from '../../hooks/useNavigation';
>
> const { t } = useTranslation();
>
> const Component = () => <p>{t('GENERAL_HELLO')}</p>;
> ```

**NOTE:** The source of truth is the english translation file (found in 'src/i18n/en/flexible-data-explorer.json'). All translation keys have to adhere to key-value pair in that file.

## Troubleshooting

### I get redirected to the Microsoft login page and/or stuck in a login-loop

1. Keep the inspect window (for developer's) open under the 'Application' -> 'Storage' tab (make sure the checkbox for **including third-party cookies** is checked).
2. Open `https://localhost:3000` and quickly press on the 'Clear site data' button.
3. You will automatically be redirected to `https://apps.cognite.com/signin`, press the 'Clear site data' button, again.
4. Proceed with the login steps.

Keep having issues? Reach out the team in
[#cdf-ui-devs](https://cognitedata.slack.com/archives/C012L1VCTTL) on Slack.
