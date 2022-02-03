import { toId } from '../toId';

describe('toId', () => {
  it('should remove spaces', () => {
    expect(toId('one spaced string')).toEqual('onespacedstring');
  });
  it('should remove non alphanumeric characters', () => {
    expect(toId('a(b)-123-c %')).toEqual('ab123c');
  });
  it('should handle empty strings', () => {
    expect(toId('')).toEqual('');
  });
});
