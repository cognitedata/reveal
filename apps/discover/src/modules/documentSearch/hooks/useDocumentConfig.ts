import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { Modules } from 'modules/sidebar/types';
import { DocumentConfig } from 'tenants/types';

export const useDocumentConfig = () => {
  return useTenantConfigByKey<DocumentConfig>(Modules.DOCUMENTS);
};
