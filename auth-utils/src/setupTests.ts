if (!window.crypto) {
  // eslint-disable-next-line global-require
  const nodeCrypto = require('crypto');

  // @ts-expect-error - read only
  window.crypto = {
    getRandomValues(buffer: unknown) {
      return nodeCrypto.randomFillSync(buffer);
    },
  };
}
