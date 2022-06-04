# Domain

This is where we keep all our domain logic

## Folder structure explained

```
domain
└── wells
  └── nds
    └── internal <-- internal type
      ├── \_\_fixtures
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
      ├── adapters
      | └── adaptXXXtoTableView.ts <- change/add new fields in bulk
      |
      └── types.ts <-- internal type
    |── service <-- external API type
    | ├── \_\_fixtures
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
├── favorites
    |── service
    |── dataLayer
├── documents
    |── service
    |── dataLayer
```
