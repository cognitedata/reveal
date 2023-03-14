import { DataModelPropertyNameValidator } from './data-model-property-name-validator';

describe('DataModelTypeNameValidatorTest', () => {
  const createInstance = () => {
    return new DataModelPropertyNameValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate a valid name', async () => {
    const validator = createInstance();

    const result = validator.validate('property', 'name');
    expect(result.valid).toBe(true);
  });

  it('does not validate reserved keyword property names', () => {
    const reservedPropertyNames = [
      'space',
      'externalId',
      'createdTime',
      'lastUpdatedTime',
      'deletedTime',
      'extensions',
    ];

    const validator = createInstance();
    for (const keyword of reservedPropertyNames) {
      const result = validator.validate('property', keyword);
      expect(result.valid).toBe(false);
    }
  });

  it('does not validate field names starting with "_"', () => {
    const validator = createInstance();
    const result = validator.validate('property', '_name');
    expect(result.valid).toBe(false);
  });

  it('does not validate field names starting with "__"', () => {
    const validator = createInstance();
    const result = validator.validate('property', '__name');
    expect(result.valid).toBe(false);
  });
});
