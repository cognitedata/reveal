/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  useClickedNodeData,
  useCameraNavigation,
  type AddResourceOptions,
  type FdmAssetStylingGroup,
  CadModelContainer
} from '../src';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { AddModelOptions, DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { type AssetMappingStylingGroup } from '../src/components/Reveal3DResources/types';
import { ColorOverlayRules } from '../src/components/ColorOverlayRules/ColorOverlayRules';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';

import { ExternalIdsResultList, FdmSDK } from '../src/utilities/FdmSDK';
import {
  type Expression,
  type StringCondition,
  type ExpressionOperator,
  type Rule,
  type RuleOutput,
  type RuleOutputSet,
  type RuleWithOutputs,
  type MetadataRuleTrigger,
  type ConcreteExpression,
  type StringTrigger,
  type NumericCondition
} from 'rule-based-actions/src/lib/types';
import { useSDK } from '../src/components/RevealContainer/SDKProvider';
import { RULE_BASED_COLORING_SOURCE } from '../src/utilities/globalDataModels';

const meta = {
  title: 'Example/ColorOverlay',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 4319392643513894,
        revisionId: 91463736617758,
        styling: {
          default: {
            color: new Color('#efefef')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [resourceIsLoaded, setResourceIsLoaded] = useState<boolean>(false);
  const cdfClient = useSDK();

  const fdmSdk = useMemo(() => new FdmSDK(cdfClient), [cdfClient]);

  const modelOptions = {
    modelId: 4319392643513894,
    revisionId: 91463736617758
  };
  const transform = new Matrix4().makeTranslation(0, 10, 0);
  const onLoaded = (): void => {
    setResourceIsLoaded(true);
  };

  const stringTriggerTwo: MetadataRuleTrigger = {
    type: 'metadata',
    key: 'ABC ind.'
  };
  const stringConditionTwo: StringCondition = {
    type: 'equals',
    parameter: 'L'
  };
  const concreteExpressionTwo: Expression = {
    type: 'stringExpression',
    trigger: stringTriggerTwo,
    condition: stringConditionTwo
  };

  const expressionForSecondGroup: ExpressionOperator = {
    type: 'or',
    expressions: [concreteExpressionTwo]
  };

  const numericConditionTwoForGroupOne: StringCondition = {
    type: 'equals',
    parameter: 'H'
  };
  const triggerForConcreteExprTwoGroupOne: StringTrigger = {
    type: 'metadata',
    key: 'ABC indic.'
  };
  const concreteExpressionTwoForGroupOne: ConcreteExpression = {
    type: 'stringExpression',
    trigger: triggerForConcreteExprTwoGroupOne,
    condition: numericConditionTwoForGroupOne
  };

  const numericConditionOneForGroupOne: NumericCondition = {
    type: 'within',
    lowerBoundInclusive: 1,
    upperBoundInclusive: 20
  };
  const triggerForConcreteExprOneGroupOne: StringTrigger = {
    type: 'metadata',
    key: 'pressure'
  };
  const concreteExpressionOneForGroupOne: ConcreteExpression = {
    type: 'numericExpression',
    trigger: triggerForConcreteExprOneGroupOne,
    condition: numericConditionOneForGroupOne
  };

  const expressionForGroupOne: Expression = {
    type: 'and',
    expressions: [concreteExpressionOneForGroupOne, concreteExpressionTwoForGroupOne]
  };

  const stringTriggerOne: MetadataRuleTrigger = {
    type: 'metadata',
    key: 'ABC indic.'
  };
  const stringConditionOne: StringCondition = {
    type: 'equals',
    parameter: 'H'
  };
  const concreteExpressionOne: Expression = {
    type: 'stringExpression',
    trigger: stringTriggerOne,
    condition: stringConditionOne
  };

  const expressionForInitialGroup: ExpressionOperator = {
    type: 'or',
    expressions: [concreteExpressionOne, expressionForGroupOne]
  };

  const ruleOutput: RuleOutput = {
    type: 'color',
    fill: '#ff0000',
    outline: '#000000',
    externalId: 'rule-output-external-id3'
  };

  const ruleOutputTwo: RuleOutput = {
    type: 'color',
    fill: '#ff0000',
    outline: '#000000',
    externalId: 'rule-output-external-id8'
  };

  const ruleOne: Rule = {
    id: 'ruleid4777', // uuid
    name: 'rule one',
    expression: expressionForInitialGroup
  };

  const ruleTwo: Rule = {
    id: 'ruleid666', // uuid
    name: 'rule two',
    expression: expressionForSecondGroup
  };

  const rules: Rule[] = [ruleOne, ruleTwo];

  const rulesWithOutputTwo: RuleWithOutputs = {
    rule: ruleTwo,
    outputs: [ruleOutputTwo]
  };
  const rulesWithOutput: RuleWithOutputs = {
    rule: ruleOne,
    outputs: [ruleOutput]
  };
  const ruleSet: RuleOutputSet = {
    rulesWithOutputs: [rulesWithOutput, rulesWithOutputTwo],
    name: 'ABC ind.',
    id: '213213213',
    createdAt: Date.now(),
    createdBy: 'daniel.priori@cognite.com'
  };
  useEffect(() => {
    const getAllIstances = async (): Promise<any> => {
      const versionedPropertiesKey = `${RULE_BASED_COLORING_SOURCE.externalId}/${RULE_BASED_COLORING_SOURCE.version}`;

      const filter = {
        in: {
          property: [
            RULE_BASED_COLORING_SOURCE.space,
            versionedPropertiesKey,
            'shamefulOutputTypes'
          ],
          values: ['color']
        }
      };
      const mappings = await fdmSdk.filterAllInstances(filter, 'node', RULE_BASED_COLORING_SOURCE);
      console.log(' RULE MODEL ', mappings);
      return mappings;
    };
    void getAllIstances();
  }, []);

  return (
    <>
      <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      {resourceIsLoaded && <ColorOverlayRules addModelOptions={modelOptions} ruleSet={ruleSet} />}
    </>
  );
};
