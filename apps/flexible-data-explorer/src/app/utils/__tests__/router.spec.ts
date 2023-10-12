import { createSearchParams } from '../router';

describe('router', () => {
  describe('createSearchParams', () => {
    it('should create URLSearchParams with valid parameters', () => {
      const params = {
        name: 'John',
        age: '30',
        address: {
          city: 'Oslo',
          postalCode: '0010',
        },
      };

      const result = createSearchParams(params);

      expect(result.toString()).toBe(
        'name=John&age=30&address=%7B%22city%22%3A%22Oslo%22%2C%22postalCode%22%3A%220010%22%7D'
      );
    });

    it('should ignore undefined and empty parameters', () => {
      const params = {
        name: 'John',
        age: undefined,
        address: {},
        email: '',
      };

      const result = createSearchParams(params);

      expect(result.toString()).toBe('name=John');
    });
  });
});
