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

import { FdmSDK } from '../src/utilities/FdmSDK';
import {
  Expression,
  StringCondition,
  type ExpressionOperator,
  type Rule,
  type RuleOutput,
  type RuleOutputSet,
  type RuleWithOutputs,
  MetadataRuleTrigger,
  ConcreteExpression,
  StringTrigger,
  NumericCondition
} from 'rule-based-actions/src/lib/types';

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

  const modelOptions = {
    modelId: 4319392643513894,
    revisionId: 91463736617758
  };
  const transform = new Matrix4().makeTranslation(0, 10, 0);
  const onLoaded = (): void => {
    setResourceIsLoaded(true);
  };

  /*   const initialExpressionForRuleOne: ExpressionOperator = {
    type: 'or',
    expressions: [concreteExpressionOne, concreteExpressionTwo]
  }; */

  /*  const ruleOne: Rule = {
    id: 'ruleId1',
    name: 'rule one id',
    expression: initialExpressionForRuleOne
  }; */

  /*   const ruleTwo: Rule = {
    id: 'ruleId2',
    name: 'rule two id',
    expression: expressionOperator
  };

  const ruleThree: Rule = {
    id: 'ruleId3',
    name: 'rule three id',
    expression: expressionOperator
  };

  const ruleFour: Rule = {
    id: 'ruleId4',
    name: 'rule four id',
    expression: expressionOperator
  };
 */
  /*   const ruleApplicationOne: BaseRuleApplication = {
    applicationId: 'threeDApplication',
    fill: '#ACD123',
    outline: '#000000',
    ruleId: 'ruleId1'
  };

  const ruleApplicationTwo: BaseRuleApplication = {
    applicationId: 'threeDApplication',
    fill: '#00FF00',
    outline: '#000000',
    ruleId: 'ruleId2'
  };

  const ruleApplicationThree: BaseRuleApplication = {
    applicationId: 'threeDApplication',
    fill: '#FF0000',
    outline: '#000000',
    ruleId: 'ruleId3'
  };

  const ruleApplicationFour: BaseRuleApplication = {
    applicationId: 'threeDApplication',
    fill: '#FFFF00',
    outline: '#000000',
    ruleId: 'ruleId4'
  }; */

  /* const stringTriggerOne: MetadataRuleTrigger = {
    type: 'metadata',
    key: 'ABC indication'
  };
  const stringConditionOne: StringCondition = {
    type: 'equals',
    parameter: 'D'
  };
  const concreteExpressionOne: Expression = {
    type: 'stringExpression',
    trigger: stringTriggerOne,
    condition: stringConditionOne
  };

  const stringTriggerTwo: MetadataRuleTrigger = {
    type: 'metadata',
    key: 'ABC indication'
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
 */

  const numericConditionTwoForGroupOne: StringCondition = {
    type: 'notEquals',
    parameter: 'C'
  };
  const triggerForConcreteExprTwoGroupOne: StringTrigger = {
    type: 'metadata',
    key: 'status'
  };
  const concreteExpressionTwoForGroupOne: ConcreteExpression = {
    type: 'stringExpression',
    trigger: triggerForConcreteExprTwoGroupOne,
    condition: numericConditionTwoForGroupOne
  };

  const numericConditionOneForGroupOne: NumericCondition = {
    type: 'within',
    lowerBoundInclusive: 10,
    upperBoundInclusive: 30
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
    key: 'ABC indication'
  };
  const stringConditionOne: StringCondition = {
    type: 'equals',
    parameter: 'D'
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
    externalId: 'rule-output-external-id',
  };

  const ruleOne: Rule = {
    id: 'ruleid123', // uuid
    name: 'rule one',
    expression: expressionForInitialGroup
  };

  const ruleTwo: Rule = {
    id: 'ruleid123456', // uuid
    name: 'rule two',
    expression: expressionForInitialGroup
  };

  const rules: Rule[] = [ruleOne, ruleTwo];

  const rulesWithOutputTwo: RuleWithOutputs = {
    rule: ruleTwo,
    outputs: [ruleOutput]
  };
  const rulesWithOutput: RuleWithOutputs = {
    rule: ruleOne,
    outputs: [ruleOutput]
  };
  const ruleSet: RuleOutputSet = {
    rulesWithOutputs: [rulesWithOutput, rulesWithOutputTwo],
    name: 'ABC indication Rule',
    id: '12345',
    createdAt: Date.now(),
    createdBy: 'daniel.priori@cognite.com'
  };

  console.log(' Rule Set ', ruleSet, rules /* , ruleTwo, ruleThree, ruleFour */);

  /* const rulesTest = [
    {
      colorRuleName: 'ABC indication Rule',
      rulerTriggerType: 'metadata',
      sourceField: ['ABC indication', 'ABC indic.'],
      isStringRule: true,
      subHierarchyAggregationMethod: 'none',
      threeDObjects: 'all',
      conditions: [
        {
          valueString: 'D',
          color: '#ACD123'
        },
        {
          valueString: 'L',
          color: '#00FF00'
        },
        {
          valueString: 'S',
          color: '#FF0000'
        },
        {
          valueString: 'M',
          color: '#FFFF00'
        },
        {
          valueString: 'H',
          color: '#FFDC00'
        },
        {
          valueString: 'F',
          color: '#CC00FF'
        }
      ]
    },
    {
      colorRuleName: 'Scalar Test',
      rulerTriggerType: 'metadata',
      sourceField: ['Room'],
      isStringRule: false,
      subHierarchyAggregationMethod: 'none',
      threeDObjects: 'all',
      conditions: [
        {
          description: 'Below retiring limit',
          valueMax: '1.0',
          valueMin: '0.0',
          color: '#ff0000'
        },
        {
          description: 'Close to retiring limit',
          valueMax: '1.5',
          valueMin: '1.0',
          color: '#ffdc00'
        },
        {
          description: 'Nominal',
          valueMax: '999.0',
          valueMin: '1.5',
          color: '#00ff00'
        }
      ]
    }
  ]; */
  return (
    <>
      <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      {resourceIsLoaded && (
        <ColorOverlayRules addModelOptions={modelOptions} ruleSet={ruleSet} rules={rules} />
      )}
    </>
  );
};
