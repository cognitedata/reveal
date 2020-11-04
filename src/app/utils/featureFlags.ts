import { useFlag } from '@cognite/react-feature-flags';

export const useCollectionFeature = () => useFlag('COLLECTIONS_allowlist');
