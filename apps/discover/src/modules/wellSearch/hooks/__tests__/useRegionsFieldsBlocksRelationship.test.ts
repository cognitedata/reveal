import { renderHook } from '@testing-library/react-hooks';

import { getWellGroups } from '__test-utils/fixtures/well/groups';
import { FilterIDs } from 'modules/wellSearch/constants';
import { RegionFieldBlockResult } from 'modules/wellSearch/types';

import { useRegionsFieldsBlocksRelationship } from '../useRegionsFieldsBlocksRelationship';

const getRelationshipHook = (selectedOptions: RegionFieldBlockResult) => {
  const wellGroups = getWellGroups();

  const { waitForNextUpdate, result } = renderHook(() =>
    useRegionsFieldsBlocksRelationship(wellGroups, selectedOptions)
  );

  waitForNextUpdate();

  return result.current;
};

describe('useRegionsFieldsBlocksRelationship', () => {
  describe('Filter: Region', () => {
    it('Find correct fields/blocks based on region: "Discover"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: ['Discover'],
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: [],
      };
      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.REGION);

      expect(result).toMatchObject({
        [FilterIDs.FIELD]: ['Gulf of Mexico'],
        [FilterIDs.BLOCK]: [],
      });
    });

    it('Find correct fields/blocks based on region: "Jovian System"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: [],
      };
      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.REGION);

      expect(result).toMatchObject({
        [FilterIDs.FIELD]: ['Callisto'],
        [FilterIDs.BLOCK]: ['Adal', 'Aegir', 'Agloolik', 'Ägröi'],
      });
    });

    it('Handles unknown region option correctly', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: ['random region'],
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: [],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.REGION);

      expect(result).toMatchObject({
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: [],
      });
    });
  });

  describe('Filter: Field', () => {
    it('Find correct region/blocks based on field: "Callisto"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: ['Callisto'],
        [FilterIDs.BLOCK]: [],
      };
      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.FIELD);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.BLOCK]: ['Adal', 'Aegir', 'Agloolik', 'Ägröi'],
      });
    });

    it('Handles unknown field option correctly', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: ['random field'],
        [FilterIDs.BLOCK]: ['Adal'],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.FIELD);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.BLOCK]: [],
      });
    });
  });

  describe('Filter: Blocks', () => {
    it('Find correct region/field based on block: "Adal"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: ['Adal'],
      };
      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.BLOCK);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.FIELD]: ['Callisto'],
      });
    });

    it('Handles unknown block option correctly', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: ['random block'],
        [FilterIDs.FIELD]: ['random field'],
        [FilterIDs.BLOCK]: ['random block'],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.BLOCK);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: [],
      });
    });
  });

  describe('Filters: *Top-down*', () => {
    it('Finds the correct blocks and regions based on previous selections', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.FIELD]: ['Callisto'],
        [FilterIDs.BLOCK]: [],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.FIELD);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Jovian System'],
        [FilterIDs.BLOCK]: ['Adal', 'Aegir', 'Agloolik', 'Ägröi'],
      });
    });
  });

  describe('Filters: *Bottom-up*', () => {
    it('Finds correct region and field based on block: "Adad"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: [],
        [FilterIDs.BLOCK]: ['Adad'],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.BLOCK);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Volve'],
        [FilterIDs.FIELD]: ['Ganymede'],
      });
    });
  });

  describe('Filters: *Middle*', () => {
    it('Finds correct region and bloks based on field: "Ganymede"', () => {
      const selectedOptions = {
        [FilterIDs.REGION]: [],
        [FilterIDs.FIELD]: ['Ganymede'],
        [FilterIDs.BLOCK]: [],
      };

      const getRelationships = getRelationshipHook(selectedOptions);

      const result = getRelationships(FilterIDs.FIELD);

      expect(result).toMatchObject({
        [FilterIDs.REGION]: ['Volve'],
        [FilterIDs.BLOCK]: ['Achelous', 'Adad', 'Adapa', 'Agreus', 'Agrotes'],
      });
    });
  });
});
