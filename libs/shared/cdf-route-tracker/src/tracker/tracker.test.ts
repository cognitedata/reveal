import { Metrics } from '@cognite/metrics';
import tracker, { getCluster } from '.';

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  subscribeToAuthState: (_: string, callback: () => void) => {
    return setTimeout(() => {
      callback();
    }, 1);
  },
  getUserInformation: () =>
    Promise.resolve({
      id: 'test@test.com',
    }),
}));

const wait = async (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe('Tracker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get cluster from search bar', () => {
    expect(getCluster()).toEqual(undefined);

    expect(getCluster('')).toEqual(undefined);

    expect(getCluster('einvalid search=fields')).toEqual(undefined);

    expect(getCluster('env=greenfield&test=true&search=fields')).toEqual(
      undefined
    );

    expect(
      getCluster(
        '?env=greenfield&cluster=greenfield.cognitedata.com&test=false&search=fields'
      )
    ).toEqual('greenfield.cognitedata.com');
    expect(
      getCluster('?env=omv&cluster=omv.cognitedata.com&test=true&search=fields')
    ).toEqual('omv.cognitedata.com');
    expect(
      getCluster(
        '?env=statnett&cluster=statnett.cognitedata.com&test=true&search=fields'
      )
    ).toEqual('statnett.cognitedata.com');
    expect(
      getCluster(
        '?env=clustertwo&cluster=clustertwo.cognitedata.com&test=true&search=fields'
      )
    ).toEqual('clustertwo.cognitedata.com');

    expect(
      getCluster(
        '?test=true&search=fields&env=functions&cluster=functions.cognitedata.com'
      )
    ).toEqual('functions.cognitedata.com');

    expect(
      getCluster('?cluster=frikk&test=true&search=fields&cluster=functions')
    ).toEqual('frikk');
  });

  it('should opt in when not on development', async () => {
    delete window.location;
    window.location = {
      hostname: 'https://fusion.cognite.com',
      pathname: '/fusion/explore',
    } as Location;
    const spy = jest.spyOn(Metrics, 'optOut');
    const optInSpy = jest.spyOn(Metrics, 'optIn');

    const t = tracker();
    t.track('Hello');
    await wait(20);

    expect(spy).not.toHaveBeenCalled();
    expect(optInSpy).toHaveBeenCalled();
  });
});
