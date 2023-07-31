import { getMockLabels } from '__test-utils/fixtures/label';
import { CONTEXTUALIZE_URL } from 'constants/app';

import {
  canContextualize,
  extractDocumentLabelsFomAllLabels,
  getBaseApi,
  getContextualizePath,
} from '../contextualize';

describe('Contextualize test', () => {
  it('can contextualize', () => {
    expect(canContextualize(['WELLBORE_SCHEMATIC', 'PDF'])).toBeTruthy();
    expect(canContextualize(['testLabel'])).toBeFalsy();
  });

  it('get contexualize path', () => {
    const baseApi = getBaseApi();

    const fullPath = getContextualizePath('123', 'test-project');

    expect(fullPath).toBe(
      `${CONTEXTUALIZE_URL}test-project/explore/file/123?env=${baseApi}&showSidebar=false`
    );
  });

  it('extract Document Labels Fom All Labels', () => {
    const labels = [{ externalId: 'PDF' }];
    expect(extractDocumentLabelsFomAllLabels(labels, getMockLabels)).toEqual([
      'PDF',
    ]);

    const invalidLabel = [{ externalId: 'test' }];

    expect(
      extractDocumentLabelsFomAllLabels(invalidLabel, getMockLabels)
    ).toEqual([]);
  });
});
