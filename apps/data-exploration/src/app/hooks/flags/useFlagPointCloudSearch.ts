import { useFlag } from '@cognite/react-feature-flags';

export const useFlagPointCloudSearch = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_point_cloud_search', {
    forceRerender: true,
    fallback: false,
  });
  return isEnabled;
};
