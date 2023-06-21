import { useCallback } from 'react';

import { selectDefaultRevision } from '../../../utils/selectDefaultRevision';
import { Revision3DWithIndex, RevisionOpts } from '../types';

import { use3DRevisionsQuery } from './use3DRevisionsQuery';

export const useDefault3DModelRevision = (
  modelId?: number,
  opts?: Omit<
    RevisionOpts<Revision3DWithIndex | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return use3DRevisionsQuery(modelId, {
    select: useCallback(selectDefaultRevision, []),
    ...opts,
  });
};
