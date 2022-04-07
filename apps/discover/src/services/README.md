The 'services' folder should be the only place we trigger network calls from

All endpoints should be fully typed for the body and response.

There are few special cases here to be aware of:

- documents <- discover-api
- documentSearch <- from the CDF SDK
- well <- discover-api
- wellSearch <- from the WDL SDK
