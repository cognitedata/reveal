/*!
 * Copyright 2024 Cognite AS
 */
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { type ExternalIdsResultList, type RuleOutputSet } from '../types';
import { fdmViewsExist } from '../../../utilities/fdmViewsExist';
import { useCallback } from 'react';

export const useDeleteRuleInstance = (): ((
  ruleOutputSet: RuleOutputSet
) => Promise<ExternalIdsResultList<unknown>>) => {
  const fdmSdk = useFdmSdk();

  const deleteRule = useCallback(
    async (ruleOutputSet: RuleOutputSet): Promise<ExternalIdsResultList<unknown>> => {
      const viewExists = await fdmViewsExist(fdmSdk, [RULE_BASED_OUTPUTS_VIEW]);

      if (!viewExists) {
        return { items: [] };
      }

      const resultFromSavingRule = await fdmSdk.deleteInstance([
        {
          instanceType: 'node',
          space: RULE_BASED_OUTPUTS_VIEW.space,
          externalId: ruleOutputSet.id
        }
      ]);

      return resultFromSavingRule;
    },
    []
  );
  return deleteRule;
};
