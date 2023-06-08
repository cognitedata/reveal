
# Fusion Access Management UI

`NOTE: This app now uses multi branch deployment strategy. Merging PR on master deploys on staging, and merging master into release-access-management deploys on production`

# Running locally

1. Install dependencies
   `yarn`

2. Run development server
   `yarn start`

Should show output similar to this

```
You can now view @cognite/cdf-access-management in the browser.

  Local:            http://localhost:8000
  On Your Network:  http://192.168.1.157:8000
```

_Note:_ http://localhost:8000 is wrong, you need to use **https://localhost:8000**

Your bundle should now be accessible at https://localhost:8000/index.js.

Then show it in unified CDF UI by following these steps:
[How to set up CDF developer environment in your local machine](https://cognitedata.atlassian.net/wiki/spaces/SupportKB/pages/3728408609/How+to+set+up+CDF+developer+environment+in+your+local+machine)
