import { getStepIdentifier, sanitizeStepInput } from './stringUtils';

describe('sanitizeStepInput', () => {
  it('handles slashes', () => {
    expect(sanitizeStepInput('/Crude_Feed/VMGOPStream.MassFlow')).toBe(
      'Crude Feed VMGOPStream MassFlow'
    );
  });

  it('handles words separated by spaces', () => {
    expect(sanitizeStepInput('Material Stream')).toBe('Material Stream');
  });

  it('handles words separated by periods', () => {
    expect(sanitizeStepInput('PROSPER.ANL.SYS.Pres')).toBe(
      'PROSPER ANL SYS Pres'
    );
  });

  it('handles other special characters', () => {
    expect(sanitizeStepInput('PROSPER.ANL.[{$}][0,1]')).toBe('PROSPER ANL 0 1');
  });
});

describe('getStepIdentifier', () => {
  it('handles a single word', () => {
    expect(getStepIdentifier('Crude', 0)).toBe('C0');
  });

  it('handles multiple words', () => {
    expect(getStepIdentifier('Crude Feed Temperature', 1)).toBe('CFT1');
  });

  it('handles lower case words', () => {
    expect(getStepIdentifier('crude feed temperature', 1)).toBe('CFT1');
  });
});
