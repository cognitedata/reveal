import type { SimpleSource } from '../../../../src';
import type { ViewItemListResponse } from '../../../../src/data-providers/FdmSDK';
import { getMockViewItemFromSimpleSource } from './getMockViewItemFromSimpleSource';

export function getMockViewByIdResponse(sources: SimpleSource[]): ViewItemListResponse {
  return {
    items: sources.map((source) => getMockViewItemFromSimpleSource(source))
  };
}
