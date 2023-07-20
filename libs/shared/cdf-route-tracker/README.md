# cdf-route-tracker

Library used in fusion sub-apps to track and send metrics and events to Mixpanel.

# How to use the library

```TS
import { trackEvent } from '@cognite/cdf-route-tracker';

// Later in code
trackEvent(`event-name`, {
    ...metadata,
    project: getProject(),
    version: 1,
    appVersion: process.env.REACT_APP_VERSION,
    location: pathname,
    pathname: pathWithoutProjectName,
});
```
