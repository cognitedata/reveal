if (!window.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  const nodeCrypto = require('crypto');

  // @ts-expect-error - read only
  window.crypto = {
    getRandomValues(buffer: unknown) {
      return nodeCrypto.randomFillSync(buffer);
    },
  };
}

export default 'dummy-export';
