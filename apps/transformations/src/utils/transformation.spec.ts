import { describe, expect, test } from '@jest/globals';
import { QueryPreviewData } from '@transformations/hooks';
import { Schema } from '@transformations/types';

import { getPreviewWarnings } from './transformation';

describe('getPreviewWarnings', () => {
  test('returns `incorrect-type` warning while comparing primitive and complex types', () => {
    const mockQueryPreviewData: QueryPreviewData = {
      schema: {
        items: [
          {
            name: 'foo',
            nullable: false,
            sqlType: 'STRUCT<`spaceExternalId`: STRING, `externalId`: STRING>',
            type: {
              type: 'struct',
            },
          },
        ],
      },
      results: { items: [] },
      sql: '',
    };
    const mockSchema: Schema[] = [
      {
        name: 'foo',
        nullable: false,
        sqlType: 'STRING',
        type: 'string',
      },
    ];
    const warnings = getPreviewWarnings(mockQueryPreviewData, mockSchema);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('incorrect-type');
  });
});
