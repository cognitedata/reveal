import { sortByDate } from '../sortByDate';

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
    dates.sort(sortByDate);
    expect(dates).toMatchObject(sortedDates);
  });

  it('sort string short format dates', () => {
    const dates = ['07.Mar.1993', '10.Sep.2002', '09.Dec.1997', '11.Dec.1963'];
    const sortedDates = [
      '11.Dec.1963',
      '07.Mar.1993',
      '09.Dec.1997',
      '10.Sep.2002',
    ];

    // default sort by ascending order
    expect(dates).not.toMatchObject(sortedDates);
    dates.sort(sortByDate);
    expect(dates).toMatchObject(sortedDates);
  });

  it('sort both invalid dates', () => {
    const dates = ['2003.22', '423193', '0193297'];

    dates.sort(sortByDate);
    expect(dates).toMatchObject(dates);
  });

  it('sort unix dates', () => {
    expect([2, 1].sort(sortByDate)).toMatchObject([1, 2]);
    expect([1, 2].sort(sortByDate)).toMatchObject([1, 2]);
  });

  it('sort one invalid dates', () => {
    const firstDateInvalid = ['14.Dex.20302', '05.Dec.1993', '09.Dec.1997'];
    const expectedFirstDateInvalid = firstDateInvalid;

    firstDateInvalid.sort(sortByDate);
    expect(firstDateInvalid).toMatchObject(expectedFirstDateInvalid);

    const secondDateInvalid = ['12.Apr.2002', '05.Dex.193293', '09.Dec.1997'];
    const expectedSecondDateInvalid = secondDateInvalid;

    secondDateInvalid.sort(sortByDate);
    expect(secondDateInvalid).toMatchObject(expectedSecondDateInvalid);

    const valid = ['12.Apr.2002', '05.Dec.1993', '09.Dec.1997'];
    const expectedValid = ['05.Dec.1993', '09.Dec.1997', '12.Apr.2002'];

    expect(valid).not.toMatchObject(expectedValid);
    valid.sort(sortByDate);
    expect(valid).toMatchObject(expectedValid);
  });
});
