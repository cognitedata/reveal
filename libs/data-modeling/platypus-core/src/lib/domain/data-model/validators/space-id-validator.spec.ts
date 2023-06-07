import { SpaceIdValidator } from './space-id-validator';

describe('DataModelExternalIdValidator', () => {
  const createInstance = () => {
    return new SpaceIdValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('validates string with "_"', () => {
    const validator = createInstance();

    const result = validator.validate('id', 'valid_name');
    expect(result.valid).toBe(true);
  });

  it('validates string with "-"', () => {
    const validator = createInstance();

    const result = validator.validate('id', 'valid-name');
    expect(result.valid).toBe(true);
  });

  it('does not validate string starting with "-"', () => {
    const validator = createInstance();

    const result = validator.validate('id', '-invalid-name');
    expect(result.valid).toBe(false);
  });

  it('does not validate string starting with "_"', () => {
    const validator = createInstance();

    const result = validator.validate('id', '_invalid-name');
    expect(result.valid).toBe(false);
  });

  it('does not validate string with "/"', () => {
    const validator = createInstance();

    const result = validator.validate('id', 'valid/Name');
    expect(result.valid).toBe(false);
  });

  it('does not validate string with "$"', () => {
    const validator = createInstance();

    const result = validator.validate('id', 'invalid-name$$.');
    expect(result.valid).toBe(false);
  });

  it('does not validate strings with reserved words', () => {
    const reservedWords = [
      'cdf',
      'dms',
      'pg3',
      'shared',
      'system',
      'node',
      'edge',
    ];

    const validator = createInstance();
    for (const word in reservedWords) {
      const result = validator.validate('id', word);
      expect(result.valid).toBe(false);
    }
  });

  it('does not validate strings with more than 43 characters', () => {
    const id = 'a'.repeat(44);
    const validator = createInstance();
    const result = validator.validate('id', id);
    expect(result.valid).toBe(false);
  });
});
