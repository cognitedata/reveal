import { getItem } from './localStorage';

describe('localStorage', () => {
  it('getItem parces string', () => {
    localStorage.setItem('currentLanguage', 'en');
    expect(getItem('currentLanguage')).toEqual('en');
  });
  it('getItem parces object', () => {
    const data = { fo: 42 };
    localStorage.setItem('currentLanguage', JSON.stringify(data));
    expect(getItem('currentLanguage')).toEqual(data);
  });
});
