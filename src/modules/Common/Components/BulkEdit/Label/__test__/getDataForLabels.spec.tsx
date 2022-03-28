import React from 'react';
import { ExternalId } from '@cognite/sdk';
import { Tag } from 'antd';
import {
  getNewItems,
  getTagForOriginal,
} from 'src/modules/Common/Components/BulkEdit/Label/getDataForLabel';

describe('Test get Tag For Original', () => {
  test('If no unsavedItems items', () => {
    const unsavedItems: ExternalId[] | undefined = undefined;
    const item: ExternalId = { externalId: 'item one' };
    const expectedValue = <Tag key={item.externalId}>{item.externalId}</Tag>;
    expect(getTagForOriginal({ item, unsavedItems })).toStrictEqual(
      expectedValue
    );
  });

  describe('If unsavedItems items exist', () => {
    const unsavedItems: ExternalId[] | undefined = [
      { externalId: 'item one' },
      { externalId: 'item two' },
      { externalId: 'item three' },
    ];
    test('If original item exist as an unsavedItems item', () => {
      const item: ExternalId = { externalId: 'item one' };
      const expectedValue = (
        <Tag key={item.externalId} color="blue">
          {item.externalId}
        </Tag>
      );
      expect(getTagForOriginal({ item, unsavedItems })).toStrictEqual(
        expectedValue
      );
    });

    test("If original item don't exist as an unsavedItems item", () => {
      const item: ExternalId = { externalId: 'item four' };
      const expectedValue = <Tag key={item.externalId}>{item.externalId}</Tag>;
      expect(getTagForOriginal({ item, unsavedItems })).toStrictEqual(
        expectedValue
      );
    });
  });
});

describe('Test get New Items', () => {
  test('If no existingItems items', () => {
    const unsavedItems: ExternalId[] = [
      { externalId: 'item one' },
      { externalId: 'item two' },
      { externalId: 'item three' },
    ];
    const existingItems: ExternalId[] | undefined = undefined;
    const expectedValue = unsavedItems;
    expect(getNewItems({ unsavedItems, existingItems })).toStrictEqual(
      expectedValue
    );
  });

  test('If existingItems items exist', () => {
    const unsavedItems: ExternalId[] = [
      { externalId: 'item one' },
      { externalId: 'item two' },
      { externalId: 'item three' },
    ];
    const existingItems: ExternalId[] | undefined = [
      { externalId: 'item one' },
      { externalId: 'item three' },
    ];
    const expectedValue: ExternalId[] = [{ externalId: 'item two' }];
    expect(getNewItems({ unsavedItems, existingItems })).toStrictEqual(
      expectedValue
    );
  });
});
