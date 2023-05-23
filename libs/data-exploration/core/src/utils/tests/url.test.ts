import { renderHook } from '@testing-library/react';
import { isValidUrl, useSearchParamString } from '../url';

const mockFunction = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useSearchParams: () => ['q=URLUtils.searchParams&topic=api', mockFunction],
  };
});

describe('url', () => {
  describe('isValidUrl', () => {
    test.each([
      ['http://foo.com/blah_blah', true],
      ['http://foo.com/blah_blah/', true],
      ['http://foo.com/blah_blah_(wikipedia)_(again)', true],
      ['https://www.example.com/foo/?bar=baz&inga=42&quux', true],
      ['http://userid:password@example.com:8080', true],
      ['http://userid@example.com:8080/', true],
      ['http://142.42.1.1/', true],
      ['http://142.42.1.1:8080/', true],
      ['http://foo.com/unicode_(✪)_in_parens', true],
      ['ftp://foo.bar/baz', true],
      ['http://', false],
      ['http://foo.bar?q=Spaces should be encoded', false],
      ['//', false],
      ['//a', false],
      ['///', false],
      ['http:///a', false],
      ['foo.com', false],
      ['rdar://1234', false],
      ['h://test', false],
      ['http:// shouldfail.com', false],
      [':// should fail', false],
      ['Trends: Periodic abnormal values', false],
      ['trends: Periodic abnormal values', false],
      ['random: Periodic abnormal values', false],
      ['random; Periodic abnormal values', false],
      ['HTTP: Periodic abnormal values', false],
      ['http: Periodic abnormal values', false],
    ])('isValidUrl(%s)', (value, expected) => {
      const result = isValidUrl(value);
      expect(result).toBe(expected);
    });
  });

  describe('useSearchParamString', () => {
    beforeEach(() => mockFunction.mockClear());
    afterAll(() => jest.clearAllMocks());

    const initRender = (key: string, opts?: { replace?: boolean }) => {
      return renderHook(() => useSearchParamString(key, opts));
    };

    it('should return expected value by key', () => {
      const { result } = initRender('topic');

      expect(result.current[0]).toEqual('api');
    });

    it('should be null', () => {
      const { result } = initRender('test');

      expect(result.current[0]).toBeNull();
    });

    it('should add new params', () => {
      const { result } = initRender('test');

      result.current[1]('new-topic');
      expect(mockFunction).toHaveBeenCalled();
      expect(mockFunction).toHaveBeenCalledWith(
        'q=URLUtils.searchParams&topic=api&test=new-topic',
        { replace: false }
      );
    });

    it('should replace existing param', () => {
      const { result } = initRender('topic', { replace: true });

      result.current[1]('new-topic');
      expect(mockFunction).toHaveBeenCalledWith(
        'q=URLUtils.searchParams&topic=new-topic',
        { replace: true }
      );
    });
  });
});
