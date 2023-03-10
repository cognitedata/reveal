# Domain

This is where we keep all our domain logic

## Folder structure explained

```
domain
└── timeseries
    └── internal <-- internal type
        ├── \_\_fixtures <- should not import types from sdk/external request - only for transofmred internal
        |
        | ├── actions <-- react-query - calls service->network
        | | └── xxxMutate.ts
        |
        | #
        | # has no logic, just calls a network function
        | # returns an internal type (this is the reason it is in 'internal' not 'service')
        | #
        | ├── queries <-- react-query, should return internal type!
        | | └── xxxQuery.ts
        | #
        | # any logic needed to change the above queries should be in these hooks
        | #
        | ├── hooks <-- these often are special versions of the above queries
        | | └── xxxSelector.ts
        |
        ├── transformers
        | └── normalize.ts <- called inside the query
        | └── getxxx.ts <- change one field to different format
        ├── adapters (can be moved to transformers)
        | └── adaptXXXtoTableView.ts <- change/add new fields in bulk
        |
        └── types.ts <-- internal type
    |── service <-- external API type
    | ├── \_\_fixtures - should only import types from sdk/external request
    | ├── \_\_mocks
    |
    | ├── network <-- axios/sdk - must return external API type
    | | └── getxxx.ts
    | | └── createxxx.ts
    | | └── deletexxx.ts
    |
    | ├── utils <---- generic stuff used by network etc.
    | | └── getxxx.ts
    | | └── usexxx.ts
    |
    | └── types.ts <-- external API type
  |── types.ts <-- external API type
  |── constants.ts

|
| // etc:
|
├── timeseries
    |── service
    |── dataLayer
├── threshold
    |── service
    |── dataLayer
```

| Folder             | Description                                                  |
| :----------------- | :----------------------------------------------------------- |
| \_\_fixtures       | generator functions to create objects of a type for testing  |
| \internal_fixtures | only to have fixture data for internal types                 |
| \service_fixtures  | only to have fixture data for external requests              |
| \_\_mocks          | network level mocks, one file for each endpoint/request type |
