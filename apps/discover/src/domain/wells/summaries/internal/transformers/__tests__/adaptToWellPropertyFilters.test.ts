import { getMockWellProperties } from 'domain/wells/summaries/service/__fixtures/getMockWellProperties';

import { FilterIDs } from 'modules/wellSearch/constants';

import { adaptToWellPropertyFilters } from '../adaptToWellPropertyFilters';

const wellPropertiesResponse = getMockWellProperties();

const {
  [FilterIDs.REGION]: regions,
  [FilterIDs.FIELD]: fields,
  [FilterIDs.BLOCK]: blocks,
} = adaptToWellPropertyFilters(wellPropertiesResponse);

describe('adaptToWellPropertyFilters', () => {
  it('should map relationships correctly', () => {
    expect(regions.Discover).toMatchObject({
      [FilterIDs.FIELD]: ['Gulf of Mexico'],
      [FilterIDs.BLOCK]: [],
    });

    expect(regions['Jovian System']).toMatchObject({
      [FilterIDs.FIELD]: ['Callisto'],
      [FilterIDs.BLOCK]: ['Adal', 'Aegir', 'Agloolik', 'Agrol'],
    });

    expect(fields.Callisto).toMatchObject({
      [FilterIDs.REGION]: ['Jovian System'],
      [FilterIDs.BLOCK]: ['Adal', 'Aegir', 'Agloolik', 'Agrol'],
    });

    expect(blocks.Adal).toMatchObject({
      [FilterIDs.REGION]: ['Jovian System'],
      [FilterIDs.FIELD]: ['Callisto'],
    });
  });
});
