import { useCallback } from 'react';
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { type RuleOutputSet } from '../types';
import { fdmViewsExist } from '../../../utilities/fdmViewsExist';
import { type ExternalIdsResultList, type FdmNode } from '../../../data-providers/FdmSDK';

export const useDeleteRuleInstance = (): ((
  ruleOutputSet: FdmNode<RuleOutputSet>
) => Promise<ExternalIdsResultList<unknown>>) => {
  const fdmSdk = useFdmSdk();

  const deleteRule = useCallback(
    async (ruleOutputSet: FdmNode<RuleOutputSet>): Promise<ExternalIdsResultList<unknown>> => {
      const viewExists = await fdmViewsExist(fdmSdk, [RULE_BASED_OUTPUTS_VIEW]);

      if (!viewExists) {
        return { items: [] };
      }

      const resultFromSavingRule = await fdmSdk.deleteInstances([
        {
          instanceType: 'node',
          space: RULE_BASED_OUTPUTS_VIEW.space,
          externalId: ruleOutputSet.externalId
        }
      ]);

      return resultFromSavingRule;
    },
    []
  );
  return deleteRule;
};
