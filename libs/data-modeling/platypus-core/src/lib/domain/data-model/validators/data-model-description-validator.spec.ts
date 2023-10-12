import { DataModelDescriptionValidator } from './data-model-description-validator';

describe('DataModelDescriptionValidator', () => {
  const createInstance = () => {
    return new DataModelDescriptionValidator();
  };

  it('test valid description', () => {
    const validator = createInstance();
    const mockDescription = 'My Data Model description!';

    const result = validator.validate('description', mockDescription);
    expect(result.valid).toBe(true);
  });

  it('test if the description contains 255 or less characters', () => {
    const validator = createInstance();

    const mockDescription = new Array(255).fill('x').join('');

    const result = validator.validate('description', mockDescription);
    expect(result.valid).toBe(true);
  });

  it('test if the description contains more than 255 characters', () => {
    const validator = createInstance();

    const mockDescription = new Array(256).fill('x').join('');

    const result = validator.validate('description', mockDescription);
    expect(result.valid).toBe(false);
  });
});
