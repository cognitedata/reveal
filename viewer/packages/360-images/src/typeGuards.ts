import { Image360CollectionSourceType } from './types';

export function isImage360SourceType(source: string | undefined): source is Image360CollectionSourceType {
  return source === 'dm' || source === 'cdm' || source === 'event';
}
