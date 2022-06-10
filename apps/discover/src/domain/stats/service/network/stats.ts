import { FetchHeaders } from 'utils/fetch';

import { getStats } from './getStats';

// REMEMBER: don't call this stuff directly,
// always use it via the react-query hooks
export const stats = {
  get: async ({ headers }: { headers: FetchHeaders }) => getStats({ headers }),
};
