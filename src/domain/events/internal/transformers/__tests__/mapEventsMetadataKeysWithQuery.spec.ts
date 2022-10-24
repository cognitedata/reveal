import {
  getBadEventsDataFixture,
  getEventDataFixture,
  getGoodEventsData,
} from '../../__fixtures/mockEventsData';
import { mapEventsMetadataKeysWithQuery } from '../mapEventsMetadataKeysWithQuery';

const SEARCH_QUERY = 'search-input-value';

describe('mapEventsMetadataKeysWithQuery', () => {
  it('Returns undefined when events data is empty', () => {
    const result = mapEventsMetadataKeysWithQuery([], SEARCH_QUERY);

    expect(result).toBeUndefined();
  });
  it('Returns undefined when search string is empty', () => {
    const result = mapEventsMetadataKeysWithQuery([getEventDataFixture()], '');

    expect(result).toBeUndefined();
  });
  it('Returns undefined if both fields are empty', () => {
    const result = mapEventsMetadataKeysWithQuery([], '');

    expect(result).toBeUndefined();
  });

  it('Uses all the metadata keys to merge with search query', () => {
    const result = mapEventsMetadataKeysWithQuery(
      getGoodEventsData,
      SEARCH_QUERY
    );

    expect(result).toMatchObject({
      title: SEARCH_QUERY,
      url: SEARCH_QUERY,
      CDF_ANNO_id: SEARCH_QUERY,
    });
  });

  it('Should return undefined with metadata is malformed', () => {
    const result = mapEventsMetadataKeysWithQuery(
      getBadEventsDataFixture,
      SEARCH_QUERY
    );

    expect(result).toBeUndefined();
  });
});
