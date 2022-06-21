import {
  getTranslationsForComponent,
  makeDefaultTranslations,
  translationKeys,
} from './translations';

describe('makeDefaultTranslations', () => {
  it('generates correct ouput', () => {
    const granularity = makeDefaultTranslations('Test 1', 'Test 2');
    expect(granularity).toEqual({
      'Test 1': 'Test 1',
      'Test 2': 'Test 2',
    });
  });
});

describe('translationKeys', () => {
  it('generates correct ouput', () => {
    const granularity = translationKeys(
      makeDefaultTranslations('Test 1', 'Test 2')
    );
    expect(granularity).toEqual(['Test 1', 'Test 2']);
  });
});

describe('getTranslationsForComponent', () => {
  it('generates correct ouput', () => {
    const componentTranslations = makeDefaultTranslations(
      'Test 1',
      'Test 2',
      'Test 3'
    );
    const defaultTranslations = makeDefaultTranslations('Test 2', 'Test 3');
    const translations = {
      defaultTranslations,
      translationKeys: translationKeys(defaultTranslations),
      translationNamespace: 'Any',
    };

    expect(
      getTranslationsForComponent(componentTranslations, translations)
    ).toEqual({
      'Test 2': 'Test 2',
      'Test 3': 'Test 3',
    });
  });
});
