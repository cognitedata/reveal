import { ProjectConfigDocuments } from '@cognite/discover-api-types';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { Modules } from 'modules/sidebar/types';

export const useDocumentConfig = () => {
  return useProjectConfigByKey<ProjectConfigDocuments>(Modules.DOCUMENTS);
};
