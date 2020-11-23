import { isStaging, isStagingOrLocalhost, isLocalhost } from '../env';

describe('env', () => {
  it('isStaging - empty', () => {
    expect(isStaging('')).toEqual(false);
  });
  it('isStaging - ok', () => {
    expect(isStaging('staging.test.cogniteapp.com')).toEqual(true);
  });
  it('isStagingOrLocalhost - empty', () => {
    expect(isStagingOrLocalhost('https://')).toEqual(false);
  });
  it('isStagingOrLocalhost - ok local', () => {
    expect(isStagingOrLocalhost('localhost:3000')).toEqual(true);
  });
  it('isStagingOrLocalhost - ok staging', () => {
    expect(
      isStagingOrLocalhost('https://staging.something.cogniteapp.com')
    ).toEqual(true);
  });
  it('isLocalhost - ok', () => {
    expect(isLocalhost('localhost:3000')).toEqual(true);
  });
});
