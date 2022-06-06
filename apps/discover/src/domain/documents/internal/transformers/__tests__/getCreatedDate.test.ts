import { getDocumentFixture } from 'domain/documents/service/__fixtures/getDocumentFixture';

import { getCreatedDate } from '../getCreatedDate';

describe('convert Document Date to JS Date', () => {
  it('return document date to short date', () => {
    const doc = getDocumentFixture();

    expect(getCreatedDate(doc)?.toDateString()).toContain('Tue Apr 01 2014');
  });
});
