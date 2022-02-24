import { makeDefaultTranslations } from './translations';

describe('makeDefaultTranslations', () => {
  it('generates correct ouput', () => {
    const granularity = makeDefaultTranslations('Test 1', 'Test 2');
    expect(granularity).toEqual({
      'Test 1': 'Test 1',
      'Test 2': 'Test 2',
    });
  });
});
