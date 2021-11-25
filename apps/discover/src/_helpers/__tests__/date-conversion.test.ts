import { getMockDocument } from '__test-utils/fixtures/document';
import { documentDateToDate } from '_helpers/dateConversion';

describe('convert Document Date to JS Date', () => {
  it('return document date to short date', () => {
    const document1 = [
      getMockDocument(
        {},
        {
          creationdate: '1998-01-12T14:31:49+06:00',
          lastmodified: '2020-07-11T03:28:09+05:30',
        }
      ),
    ];

    expect(documentDateToDate(document1).flatMap((e) => e.created)).toEqual([
      new Date(document1[0].doc.creationdate),
    ]);
    expect(documentDateToDate(document1).flatMap((e) => e.modified)).toEqual([
      new Date(document1[0].doc.lastmodified),
    ]);
  });
});
