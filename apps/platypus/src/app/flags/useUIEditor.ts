import { useFlag } from '../../environments/useFlag';

export const useUIEditorFeatureFlag = () => {
  return useFlag('DEVX_SHOW_UI_EDITOR', {
    fallback: false,
  });
};
