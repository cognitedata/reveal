/*!
 * Copyright 2024 Cognite AS
 */
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { type NodeItem, type RuleOutputSet } from '../types';
import { fdmViewsExist } from '../../../utilities/fdmViewsExist';
import { useCallback } from 'react';

export const useSearchRuleInstance = (): ((
  externalId: string
) => Promise<Array<NodeItem<RuleOutputSet>>>) => {
  const fdmSdk = useFdmSdk();

  const searchRuleById = useCallback(
    async (ruleId: string): Promise<Array<NodeItem<RuleOutputSet>>> => {
      const viewExists = await fdmViewsExist(fdmSdk, [RULE_BASED_OUTPUTS_VIEW]);

      if (!viewExists) {
        return [];
      }

      const versionedPropertiesKey = `${RULE_BASED_OUTPUTS_VIEW.externalId}/${RULE_BASED_OUTPUTS_VIEW.version}`;

      const filter = {
        in: {
          property: [RULE_BASED_OUTPUTS_VIEW.space, versionedPropertiesKey, 'id'],
          values: [ruleId]
        }
      };

      const result = await fdmSdk.searchInstances<RuleOutputSet>(
        RULE_BASED_OUTPUTS_VIEW,
        '',
        'node',
        1,
        filter
      );

      return result.instances;
    },
    []
  );

  return searchRuleById;
};
