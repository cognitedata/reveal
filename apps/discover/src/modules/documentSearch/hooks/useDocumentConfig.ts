import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { Modules } from 'modules/sidebar/types';

export const useDocumentConfig = () => {
  return useProjectConfigByKey(Modules.DOCUMENTS);
};
