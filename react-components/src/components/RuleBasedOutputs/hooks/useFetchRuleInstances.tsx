/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { useSDK } from '../../RevealCanvas/SDKProvider';
import { RULE_BASED_OUTPUTS_VIEW } from '../constants';
import { FdmSDK } from '../../../utilities/FdmSDK';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type RuleAndEnabled } from '../types';

export const useFetchRuleInstances = (): UseQueryResult<RuleAndEnabled[], unknown> => {
  const sdk = useSDK();
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  return useQuery(['react-components', 'color-overlay-rules', 'all'], async () => {
    const versionedPropertiesKey = `${RULE_BASED_OUTPUTS_VIEW.externalId}/${RULE_BASED_OUTPUTS_VIEW.version}`;

    const filter = {
      in: {
        property: [RULE_BASED_OUTPUTS_VIEW.space, versionedPropertiesKey, 'shamefulOutputTypes'],
        values: ['color']
      }
    };
    const result = await fdmSdk.filterAllInstances(filter, 'node', RULE_BASED_OUTPUTS_VIEW);

    const rulesAndEnabled: RuleAndEnabled[] = [];
    result.instances.forEach((instance) => {
      rulesAndEnabled.push({
        isEnabled: false,
        rule: instance
      });
    });

    return rulesAndEnabled;
  });
};
