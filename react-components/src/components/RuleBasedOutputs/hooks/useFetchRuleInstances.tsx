/*!
 * Copyright 2024 Cognite AS
 */
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type RuleAndEnabled, type RuleOutputSet } from '../types';
import { fdmViewsExist } from '../../../utilities/fdmViewsExist';

export const useFetchRuleInstances = (): UseQueryResult<RuleAndEnabled[], unknown> => {
  const fdmSdk = useFdmSdk();

  return useQuery({
    queryKey: ['react-components', 'color-overlay-rules', 'all'],
    queryFn: async () => {
      const viewExists = await fdmViewsExist(fdmSdk, [RULE_BASED_OUTPUTS_VIEW]);

      if (!viewExists) {
        return [];
      }

      const versionedPropertiesKey = `${RULE_BASED_OUTPUTS_VIEW.externalId}/${RULE_BASED_OUTPUTS_VIEW.version}`;

      const filter = {
        in: {
          property: [RULE_BASED_OUTPUTS_VIEW.space, versionedPropertiesKey, 'shamefulOutputTypes'],
          values: ['color']
        }
      };
      const result = await fdmSdk.filterAllInstances<RuleOutputSet>(
        filter,
        'node',
        RULE_BASED_OUTPUTS_VIEW
      );

      const rulesAndEnabled: RuleAndEnabled[] = [];
      result.instances.forEach((instance) => {
        rulesAndEnabled.push({
          isEnabled: false,
          rule: instance
        });
      });

      return rulesAndEnabled;
    }
  });
};
