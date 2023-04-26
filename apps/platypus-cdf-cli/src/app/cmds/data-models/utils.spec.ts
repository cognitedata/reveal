import { autoIncrementVersion } from './utils';

describe('autoIncrementVersion', () => {
  it('simple version - 1, 12, 1.3', () => {
    expect(autoIncrementVersion('1')).toEqual('2');
    expect(autoIncrementVersion('12')).toEqual('13');
    expect(autoIncrementVersion('1.3')).toEqual('2.3');
  });
  it('dashed version - some-1, some-12, some-1.3, some--3', () => {
    expect(autoIncrementVersion('some-1')).toEqual('some-2');
    expect(autoIncrementVersion('some-12')).toEqual('some-13');
    expect(autoIncrementVersion('some-1.3')).toEqual('some-2.3');
    expect(autoIncrementVersion('some--3')).toEqual('some--4');
  });
  it('texts (others) - some1, some--12--3b, cool', () => {
    expect(autoIncrementVersion('some1')).toEqual('some1-1');
    expect(autoIncrementVersion('some--12--3b')).toEqual('some--12--3b-1');
    expect(autoIncrementVersion('cool')).toEqual('cool-1');
  });
});
