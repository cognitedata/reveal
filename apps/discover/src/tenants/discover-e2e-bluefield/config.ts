import { TenantConfig } from 'tenants/types';

import config from '../discover-e2e-config';

const defaultConfig: TenantConfig = config;

/**
 * This config should be sync with `discover-e2-azure-dev` tenant.
 * If there are changes to be made, add them to '../test-config.ts'.
 */
export default defaultConfig;
