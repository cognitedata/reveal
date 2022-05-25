# Domain

This is where we keep all our domain logic

## Folder structure explained

```
domain
└── wells
  └── nds
    └── dataLayer <-- internal type
      ├── \_\_fixtures
      |
      | ├── actions <-- react-query - calls service->network
      | | └── xxxMutate.ts
      |
      | // has no logic, just calls a network function
      | // returns an internal type
      | ├── queries <-- react-query
      | | └── xxxQuery.ts
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
    | ├── network <-- axios - must return external API type
    | | └── getxxx.ts
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
