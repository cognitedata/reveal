import { formatDateToDatePickerString } from '../date';

describe('formatDateToDatePickerString', () => {
  it('should return corrct results', () => {
    expect(
      formatDateToDatePickerString(new Date('December 17, 1995 03:24:00'))
    ).toEqual('1995/12/17 03:24');
  });
});
