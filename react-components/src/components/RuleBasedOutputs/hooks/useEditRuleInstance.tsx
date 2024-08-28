/*!
 * Copyright 2024 Cognite AS
 */
import { useFdmSdk } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { type RuleOutputSet } from '../types';
import { fdmViewsExist } from '../../../utilities/fdmViewsExist';
import { useCallback } from 'react';
import { type ExternalIdsResultList } from '../../../data-providers/FdmSDK';

export const useEditRuleInstance = (): ((
  ruleOutputSet: RuleOutputSet
) => Promise<ExternalIdsResultList<unknown>>) => {
  const fdmSdk = useFdmSdk();

  const editCurrentRule = useCallback(
    async (ruleOutputSet: RuleOutputSet): Promise<ExternalIdsResultList<unknown>> => {
      const viewExists = await fdmViewsExist(fdmSdk, [RULE_BASED_OUTPUTS_VIEW]);

      if (!viewExists) {
        return { items: [] };
      }

      const resultFromSavingRule = await fdmSdk.editInstance([
        {
          instanceType: 'node',
          space: RULE_BASED_OUTPUTS_VIEW.space,
          externalId: ruleOutputSet.id,
          sources: [
            {
              properties: {
                name: ruleOutputSet.name,
                id: ruleOutputSet.id,
                createdAt: ruleOutputSet.createdAt,
                createdBy: ruleOutputSet.createdBy,
                rulesWithOutputs: JSON.parse(JSON.stringify(ruleOutputSet.rulesWithOutputs)),
                shamefulOutputTypes: ['color']
              },
              source: {
                type: RULE_BASED_OUTPUTS_VIEW.type,
                space: RULE_BASED_OUTPUTS_VIEW.space,
                externalId: RULE_BASED_OUTPUTS_VIEW.externalId,
                version: RULE_BASED_OUTPUTS_VIEW.version
              }
            }
          ]
        }
      ]);

      return resultFromSavingRule;
    },
    []
  );
  return editCurrentRule;
};
