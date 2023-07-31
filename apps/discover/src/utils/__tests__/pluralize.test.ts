import { pluralize } from 'utils/pluralize';

describe('Pluralize', () => {
  it('Pluralize the text', () => {
    const result = pluralize('test', 2);

    expect(result).toBe('tests');
  });

  it('Does not pluralize the text', () => {
    const result = pluralize('test', 1);

    expect(result).toBe('test');
  });

  it('Pluralize the text when input is array', () => {
    const result = pluralize('test', [1, 2, 3]);

    expect(result).toBe('tests');
  });

  it('Does not pluralize the text when input is empty array', () => {
    const result = pluralize('test', []);

    expect(result).toBe('test');
  });

  it('Does not pluralize the text when input is undefined', () => {
    const result = pluralize('test', undefined);

    expect(result).toBe('test');
  });
});
