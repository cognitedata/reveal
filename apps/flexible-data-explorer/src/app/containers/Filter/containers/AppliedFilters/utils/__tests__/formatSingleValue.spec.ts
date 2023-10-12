import * as dateUtils from '../../../../../../utils/date';
import { FieldType } from '../../../../types';
import { formatSingleValue } from '../formatSingleValue';

jest.mock('../../../../../../utils/date');

describe('formatSingleValue', () => {
  const formatDate = jest.spyOn(dateUtils, 'formatDate');

  const VALUE = 'TEST_VALUE';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call formatDate if field type is date', () => {
    formatSingleValue(VALUE, 'date');
    expect(formatDate).toHaveBeenCalledWith(VALUE);
  });

  it('should not call formatDate if field type is not date', () => {
    const types: FieldType[] = ['string', 'number', 'boolean'];

    types.forEach((type) => {
      const result = formatSingleValue(VALUE, type);
      expect(formatDate).not.toHaveBeenCalled();
      expect(result).toBe(VALUE);
    });
  });
});
