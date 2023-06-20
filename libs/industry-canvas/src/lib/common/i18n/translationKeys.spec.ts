import translations from './en/industrial-canvas.json';
import { translationKeys } from './translationKeys';

const loosenedTranslationKeys = translationKeys as Record<string, string>;

describe('translationKeys', () => {
  it('should have a list of properties where each value is the same as the key', () => {
    const keys = Object.keys(loosenedTranslationKeys);
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach((key) => {
      expect(loosenedTranslationKeys[key]).toEqual(key);
    });
  });

  it('should have a list of properties where each value also a key in the translations object', () => {
    const keys = Object.keys(loosenedTranslationKeys);
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach((key) => {
      expect((translations as Record<string, string>)[key]).toBeDefined();
    });
  });
});
