Here are the general principals of structure:

.
├── src  
│ ├── components # Generic components
│ ├── pages # Domain components
| ├── modules # REDUX Ducks modules
| | ├── MODULE NAME
| | | ├── reducer.ts #### Reducer for this module
| | | ├── types.ts #### Model of the state and the action types
| | | ├── selector.ts #### Access the state of this module
| | | ├── actions.ts #### Connects services and dispatches
| | | ├── helpers.ts #### Other generic logic for this module
| ├── services # React query network requests
| ├── dataLayers # Adapters etc for the presentation system
