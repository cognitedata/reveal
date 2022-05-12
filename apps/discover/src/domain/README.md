# Domain

This is where we keep all our domain logic

## Folder structure explained

domain
├── wells
| |── service/[sub-folder]
| | ├── **fixtures
| | ├── **mocks
| | ├── actions <-- react-query
| | | └── xxxMutate.ts
| | ├── queries <-- react-query
| | | └── xxxQuery.ts
| | ├── network <-- axios
| | | └── getxxx.ts  
 | | ├── utils
| | | └── getxxx.ts
| | | └── usexxx.ts
| | └── types.ts <-- external API type
| |
| └── dataLayer/[sub-folder]
| ├── \_\_fixtures  
 | ├── adapters
| | └── normalize.ts
| └── selectors
| | └── getxxx.ts
| └── types.ts <-- internal type
|
| // etc:
|
├── favorites
|── service
|── dataLayer
├── documents
|── service
|── dataLayer
