import { DataModelNameValidator } from './data-model-name-validator';

describe('DataModelNameValidator', () => {
  const createInstance = () => {
    return new DataModelNameValidator();
  };

  it('validates a valid name', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'My Data Model Name!');
    expect(result.valid).toBe(true);
  });

  it('validates valid names with 255 or less characters', () => {
    const validator = createInstance();

    const name = new Array(255).fill('x').join('');

    const result = validator.validate('name', name);
    expect(result.valid).toBe(true);
  });

  it('validates invalid names with more than 255 characters', () => {
    const validator = createInstance();

    const name = new Array(256).fill('x').join('');

    const result = validator.validate('name', name);
    expect(result.valid).toBe(false);
  });
});
