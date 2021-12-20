import isEqual from 'lodash/isEqual';

import { getTenantInfo } from '@cognite/react-container';

import { ExternalLinksConfig } from 'tenants/types';

const ipnExternalLinksConfig: ExternalLinksConfig = {
  hasWellProductionData: () =>
    'https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/61f91bdd-7af0-4ac8-bfa0-7de24f1fd267/ReportSection?noSignUpCheck=1',
  hasProductionData: (field?: string) => {
    if (field === 'SNORRE') {
      return `https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/aaf15ed0-30bd-4236-8750-f8eff525b197/ReportSection798d9037caecb76f3610?filter=Final/Field in ('Snorre A','Snorre B')`;
    }

    return `https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/aaf15ed0-30bd-4236-8750-f8eff525b197/ReportSection798d9037caecb76f3610?filter=Final/Field eq '${field}'`;
  },
};

export const useExternalLinksConfig = () => {
  const [tenant] = getTenantInfo();

  if (isEqual(tenant, 'ipn-dev') || isEqual(tenant, 'ipn-prod')) {
    return ipnExternalLinksConfig;
  }

  return undefined;
};
