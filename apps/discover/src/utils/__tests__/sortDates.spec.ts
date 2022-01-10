import { sortDates } from '../sortDates';

describe('sort dates', () => {
  it('sort short format dates', () => {
    const dates = [
      new Date('07.03.1993'),
      new Date('10.09.2002'),
      new Date('09.12.1997'),
      new Date('11.12.1963'),
    ];
    const sortedDates = [
      new Date('11.12.1963'),
      new Date('07.03.1993'),
      new Date('09.12.1997'),
      new Date('10.09.2002'),
    ];

    // default sort by ascending order
    expect(dates).not.toMatchObject(sortedDates);
    dates.sort(sortDates);
    expect(dates).toMatchObject(sortedDates);
  });

  it('sort string short format dates', () => {
    const dates = ['07.03.1993', '10.09.2002', '09.12.1997', '11.12.1963'];
    const sortedDates = [
      '11.12.1963',
      '07.03.1993',
      '09.12.1997',
      '10.09.2002',
    ];

    // default sort by ascending order
    expect(dates).not.toMatchObject(sortedDates);
    dates.sort(sortDates);
    expect(dates).toMatchObject(sortedDates);
  });

  it('sort both invalid dates', () => {
    const dates = ['2003.22', '423193', '0193297'];

    dates.sort(sortDates);
    expect(dates).toMatchObject(dates);
  });

  it('sort one invalid dates', () => {
    const firstDateInvalid = ['14.14.20302', '05.12.1993', '09.12.1997'];
    const expectedFirstDateInvalid = firstDateInvalid;

    firstDateInvalid.sort(sortDates);
    expect(firstDateInvalid).toMatchObject(expectedFirstDateInvalid);

    const secondDateInvalid = ['12.04.2002', '05.14.193293', '09.12.1997'];
    const expectedSecondDateInvalid = secondDateInvalid;

    secondDateInvalid.sort(sortDates);
    expect(secondDateInvalid).toMatchObject(expectedSecondDateInvalid);

    const valid = ['12.04.2002', '05.12.1993', '09.12.1997'];
    const expectedValid = ['05.12.1993', '09.12.1997', '12.04.2002'];

    expect(valid).not.toMatchObject(expectedValid);
    valid.sort(sortDates);
    expect(valid).toMatchObject(expectedValid);
  });
});
