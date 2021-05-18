# @cognite/storage

LocalStorage and cookie helpers

## Installation

```sh
yarn add @cognite/storage
```
## Usage

Initialize this somewhere (optional) <- this will prefix all keys saved

```js
import { storage } from '@cognite/storage';

storage.init({ project: 'my-tenant', appName: 'my-app-name' });
```

### Set

```js
storage.saveToLocalStorage('test', 'customValue');
```

### Get
```js
const value = storage.getFromLocalStorage<string>('test');
```
