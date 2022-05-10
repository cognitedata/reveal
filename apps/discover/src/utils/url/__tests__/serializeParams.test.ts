import { serializeParams } from '../serializeParams';

describe('serializeParams', () => {
  it('should serialize params', () => {
    expect(serializeParams({})).toEqual('');
    expect(
      serializeParams({
        key1: 'value-1',
        key2: 'value-2',
      })
    ).toEqual('key1=value-1&key2=value-2');
  });
});
