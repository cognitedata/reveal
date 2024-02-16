/*!
 * Copyright 2024 Cognite AS
 */
import {
  useState,
  type ReactElement,
  useEffect,
  useMemo,
  JSXElementConstructor,
  Key,
  ReactNode
} from 'react';

import { Dropdown, Flex, Icon, Menu, Switch } from '@cognite/cogs.js';

import { RuleBasedOutputs } from '../RuleBasedOutputs/RuleBasedOutputs';
import { RULE_BASED_OUTPUTS_VIEW } from '../RuleBasedOutputs/constants';
import { FdmSDK } from '../../utilities/FdmSDK';
import { useSDK } from '../RevealCanvas/SDKProvider';

export const RuleBasedOutputsContainer = (): ReactElement => {
  const [ruleInstances, setRuleInstances] = useState<any>();
  const sdk = useSDK();
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getAllInstances = async () => {
      const versionedPropertiesKey = `${RULE_BASED_OUTPUTS_VIEW.externalId}/${RULE_BASED_OUTPUTS_VIEW.version}`;

      const filter = {
        in: {
          property: [RULE_BASED_OUTPUTS_VIEW.space, versionedPropertiesKey, 'shamefulOutputTypes'],
          values: ['color']
        }
      };
      const result = await fdmSdk.filterAllInstances(filter, 'node', RULE_BASED_OUTPUTS_VIEW);
      console.log(' RULE MODEL ', result);
      setRuleInstances(result.instances);
    };

    void getAllInstances();
  }, []);

  return (
    <>
      <Dropdown
        placement="bottom-start"
        className="rule-based-outputs-class"
        content={
          <Menu
            style={{
              maxHeight: 300,
              overflow: 'auto',
              marginBottom: '20px'
            }}>
            {ruleInstances?.length > 0 &&
              ruleInstances.forEach(
                (rule: {
                  properties: {
                    id: string | undefined;
                    name: string | undefined;
                  };
                }) => (
                  <Menu.Item key={rule.properties.id}>
                    <Flex justifyContent="space-between" alignItems="center" gap={8}>
                      <Flex gap={4} alignItems="center">
                        <Icon type="Ruler" />
                        {rule.properties.name}
                      </Flex>
                      <Switch defaultChecked name={rule.properties.name} label="Switch" />
                    </Flex>
                  </Menu.Item>
                )
              )}
          </Menu>
        }></Dropdown>
      {ruleInstances?.length > 0 && <RuleBasedOutputs ruleSet={ruleInstances[0].properties} />}
    </>
  );
};
