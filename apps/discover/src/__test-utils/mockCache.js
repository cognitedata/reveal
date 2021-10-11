export class CacheMock {
  constructor() {
    this.store = {};
  }

  match = () => Promise.reject();
}

export function configureCacheMock() {
  global.caches = new CacheMock();
}
