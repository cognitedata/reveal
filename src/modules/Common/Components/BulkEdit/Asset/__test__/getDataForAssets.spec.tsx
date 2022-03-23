/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Tag } from 'antd';
import {
  getTagForOriginal,
  separateNewAssets,
  getTagForNew,
  getTagForUpdated,
} from 'src/modules/Common/Components/BulkEdit/Asset/getDataForAssets';
import { AssetIds } from 'src/modules/Common/store/common/types';

const assetsDetails: Record<number, { name: string }> = {
  1: { name: 'First Test Asset' },
  2: { name: 'Second Test Asset' },
  3: { name: 'Third Test Asset' },
  4: { name: 'Forth Test Asset' },
};

describe('Test getTagForOriginal', () => {
  describe('if assetId not available in assetsDetails', () => {
    test('unsavedAssetIds is undefined', () => {
      const assetId = 5;
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedValue = <Tag key={assetId} />;
      expect(
        getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
      ).toStrictEqual(expectedValue);
    });

    describe('unsavedAssetIds is defined', () => {
      const unsavedAssetIds: AssetIds | undefined = {
        addedAssetIds: [2, 4, 5, 7],
        removedAssetIds: [3, 4, 6, 7],
      };

      test('if asset is added again', () => {
        const assetId = 5;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      test('if asset is deleted', () => {
        const assetId = 6;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      test('if asset is added and deleted', () => {
        const assetId = 7;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });
    });
  });

  describe('if assetId is available in assetsDetails', () => {
    test('unsavedAssetIds is undefined', () => {
      const assetId = 1;
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedValue = (
        <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>
      );
      expect(
        getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
      ).toStrictEqual(expectedValue);
    });

    describe('unsavedAssetIds is defined', () => {
      const unsavedAssetIds: AssetIds | undefined = {
        addedAssetIds: [2, 4],
        removedAssetIds: [3, 4],
      };

      test("if asset don't exist as unsaved asset", () => {
        const assetId = 1;
        const expectedValue = (
          <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>
        );
        expect(
          getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      describe('if asset exist as unsaved asset', () => {
        test('if asset is added again', () => {
          const assetId = 2;
          const expectedValue = (
            <Tag key={assetId} color="blue">
              {assetsDetails[assetId].name}
            </Tag>
          );
          expect(
            getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });

        test('if asset is deleted', () => {
          const assetId = 3;
          const expectedValue = (
            <Tag key={assetId} color="red">
              {assetsDetails[assetId].name}
            </Tag>
          );
          expect(
            getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });

        test('if asset is added and deleted', () => {
          const assetId = 4;
          const expectedValue = (
            <Tag key={assetId} color="red">
              {assetsDetails[assetId].name}
            </Tag>
          );
          expect(
            getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });
      });
    });
  });
});

describe('Test separate New Assets', () => {
  describe('if no existingAssetIds exist', () => {
    const existingAssetIds = undefined;

    test('if unsavedAssetIds undefined', () => {
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedNewAssetIds: number[] = [];
      const expectedOriginalAssetIds: number[] = [];
      expect(
        separateNewAssets({ existingAssetIds, unsavedAssetIds })
      ).toStrictEqual({
        newAssetIds: expectedNewAssetIds,
        originalAssetIds: expectedOriginalAssetIds,
      });
    });

    describe('if unsavedAssetIds defined', () => {
      test('if both added and removed assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          addedAssetIds: [3, 4, 7, 8],
          removedAssetIds: [3, 8],
        };
        const expectedNewAssetIds: number[] = [4, 7];
        const expectedOriginalAssetIds: number[] = [];
        expect(
          separateNewAssets({ existingAssetIds, unsavedAssetIds })
        ).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
      });

      test('if only added assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          addedAssetIds: [3, 4, 7, 8],
        };
        const expectedNewAssetIds: number[] = [3, 4, 7, 8];
        const expectedOriginalAssetIds: number[] = [];
        expect(
          separateNewAssets({ existingAssetIds, unsavedAssetIds })
        ).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
      });

      test('if only removed assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          removedAssetIds: [3, 4, 7, 8],
        };
        const expectedNewAssetIds: number[] = [];
        const expectedOriginalAssetIds: number[] = [];
        expect(
          separateNewAssets({ existingAssetIds, unsavedAssetIds })
        ).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
      });
    });
  });

  describe('if existingAssetIds exist', () => {
    const existingAssetIds = [1, 2, 3, 4, 5, 6];

    test('if unsavedAssetIds undefined', () => {
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedNewAssetIds: number[] = [];
      const expectedOriginalAssetIds = existingAssetIds;
      expect(
        separateNewAssets({ existingAssetIds, unsavedAssetIds })
      ).toStrictEqual({
        newAssetIds: expectedNewAssetIds,
        originalAssetIds: expectedOriginalAssetIds,
      });
    });

    describe('if unsavedAssetIds defined', () => {
      test('if both added and removed assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          addedAssetIds: [3, 4, 7, 8],
          removedAssetIds: [3, 8],
        };
        const expectedNewAssetIds: number[] = [7];
        const expectedOriginalAssetIds: number[] = [1, 2, 4, 5, 6];

        const { newAssetIds, originalAssetIds } = separateNewAssets({
          existingAssetIds,
          unsavedAssetIds,
        });
        expect({ newAssetIds, originalAssetIds }).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
        expect(
          unsavedAssetIds.removedAssetIds
            ?.map((removedId) => originalAssetIds.includes(removedId))
            .includes(true)
        ).toBe(false);
      });

      test('if only added assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          addedAssetIds: [3, 4, 7, 8],
        };
        const expectedNewAssetIds: number[] = [7, 8];
        const expectedOriginalAssetIds: number[] = existingAssetIds;

        const { newAssetIds, originalAssetIds } = separateNewAssets({
          existingAssetIds,
          unsavedAssetIds,
        });
        expect({ newAssetIds, originalAssetIds }).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
        expect(
          unsavedAssetIds.removedAssetIds
            ?.map((removedId) => originalAssetIds.includes(removedId))
            .includes(true)
        ).toBe(undefined);
      });

      test('if only removed assets exists', () => {
        const unsavedAssetIds: AssetIds | undefined = {
          removedAssetIds: [3, 4, 7, 8],
        };
        const expectedNewAssetIds: number[] = [];
        const expectedOriginalAssetIds: number[] = [1, 2, 5, 6];

        const { newAssetIds, originalAssetIds } = separateNewAssets({
          existingAssetIds,
          unsavedAssetIds,
        });
        expect({ newAssetIds, originalAssetIds }).toStrictEqual({
          newAssetIds: expectedNewAssetIds,
          originalAssetIds: expectedOriginalAssetIds,
        });
        expect(
          unsavedAssetIds.removedAssetIds
            ?.map((removedId) => originalAssetIds.includes(removedId))
            .includes(true)
        ).toBe(false);
      });
    });
  });
});

describe('Test get tag for updated', () => {
  describe('if assetId not available in assetsDetails', () => {
    test('unsavedAssetIds is undefined', () => {
      const assetId = 5;
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedValue = <Tag key={assetId} />;
      expect(
        getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
      ).toStrictEqual(expectedValue);
    });

    describe('unsavedAssetIds is defined', () => {
      const unsavedAssetIds: AssetIds | undefined = {
        addedAssetIds: [2, 4, 5, 7],
        removedAssetIds: [3, 4, 6, 7],
      };

      test('if asset is added again', () => {
        const assetId = 5;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      test('if asset is deleted', () => {
        const assetId = 6;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      test('if asset is added and deleted', () => {
        const assetId = 7;
        const expectedValue = <Tag key={assetId} />;
        expect(
          getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });
    });
  });

  describe('if assetId is available in assetsDetails', () => {
    test('unsavedAssetIds is undefined', () => {
      const assetId = 1;
      const unsavedAssetIds: AssetIds | undefined = undefined;
      const expectedValue = (
        <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>
      );
      expect(
        getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
      ).toStrictEqual(expectedValue);
    });

    describe('unsavedAssetIds is defined', () => {
      const unsavedAssetIds: AssetIds | undefined = {
        addedAssetIds: [2, 4],
        removedAssetIds: [3, 4],
      };

      test("if asset don't exist as unsaved asset", () => {
        const assetId = 1;
        const expectedValue = (
          <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>
        );
        expect(
          getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
        ).toStrictEqual(expectedValue);
      });

      describe('if asset exist as unsaved asset', () => {
        test('if asset is added again', () => {
          const assetId = 2;
          const expectedValue = (
            <Tag key={assetId} color="blue">
              {assetsDetails[assetId].name}
            </Tag>
          );
          expect(
            getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });

        test('if asset is deleted', () => {
          const assetId = 3;
          const expectedValue = null;
          expect(
            getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });

        test('if asset is added and deleted', () => {
          const assetId = 4;
          const expectedValue = null;
          expect(
            getTagForUpdated({ assetId, unsavedAssetIds, assetsDetails })
          ).toStrictEqual(expectedValue);
        });
      });
    });
  });
});

describe('Test get tag for new', () => {
  test('if assetId is in assetsDetails', () => {
    const assetId: number = 1;
    const expectedTag = (
      <Tag key={assetId} color="green">
        {assetsDetails[assetId].name}
      </Tag>
    );
    expect(getTagForNew({ assetId, assetsDetails })).toStrictEqual(expectedTag);
  });

  test('if assetId not found in assetsDetails', () => {
    const assetId: number = 5;
    const expectedTag = <Tag key={assetId} color="green" />;
    expect(getTagForNew({ assetId, assetsDetails })).toStrictEqual(expectedTag);
  });
});
