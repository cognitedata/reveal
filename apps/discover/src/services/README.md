# Services

The 'services' folder should be the only place we trigger network calls from

All endpoints should be fully typed for the body and response.

There are few special naming cases here to be aware of:

- documents <- discover-api
- documentSearch <- from the CDF SDK
- well <- discover-api
- wellSearch <- from the WDL SDK

## Extra structure

Inside each service folder we should have the following:

| Folder        | Description |
| :---          | :----       |
| \_\_fixtures  | generator functions to create objects of this type for testing |
| \_\_mocks     | network level mocks, one file for each endpoint/request type |
| \_\_tests\_\_ | hopefully you know what goes in here! |
