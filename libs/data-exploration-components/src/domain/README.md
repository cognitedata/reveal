# Domain

This is where we keep all our domain logic

## Folder structure explained

```bash
domain
└── events
  └── "internal" # internal type
    ├── __fixtures # should not import types from sdk/external request - only for transofmred internal
    |
    | ├── actions # react-query - calls service->network
    | | └── xyzMutate.ts
    |
    | #
    | # has no logic, just calls a network function
    | # returns an internal type (this is the reason it is in 'internal' not 'service')
    | #
    | ├── queries # react-query, should return internal type!
    | | └── xyzQuery.ts
    | #
    | # any logic needed to change the above queries should be in these hooks
    | #
    | ├── hooks # these often are special versions of the above queries
    | | └── xyzSelector.ts
    |
    ├── transformers # mapping/transforming internal data to the api level
    | └── normalize.ts # called inside the query
    | └── getXYZ.ts # change one field to different format
    ├── adapters
    | └── adaptXYZtoTableView.ts # change/add new fields in bulk
    |
    └── types.ts # internal type
  └── "service" # external API type
    ├── __fixtures # should only import types from sdk/external request
    ├── __mocks
    |
    ├── network # axios/sdk - must return external API type
    | └── getXYZ.ts
    | └── createXYZ.ts
    | └── deleteXYZ.ts
    |
    ├── queries # react-query, should return internal type!
    | └── useXYZQuery.ts
    |
    ├── transformers # mapping/transforming api level data to internal data (e.g., store) -- utilize the internal types for this!
    |
    ├── utils # generic stuff used by network etc.
    | └── getXYZ.ts
    | └── useXYZ.ts
    |
    └── types.ts # external API type
|── types.ts # Global types
|── constants.ts
|── builders.ts

```

| Folder             | Description                                                  |
| :----------------- | :----------------------------------------------------------- |
| \_\_fixtures       | generator functions to create objects of a type for testing  |
| \internal_fixtures | only to have fixture data for internal types                 |
| \service_fixtures  | only to have fixture data for external requests              |
| \_\_mocks          | network level mocks, one file for each endpoint/request type |
