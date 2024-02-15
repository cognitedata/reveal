/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RevealContainer, Reveal3DResources, type AddResourceOptions } from '../src';
import { Color } from 'three';
import { type ReactElement, useState } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { RuleBasedOutputs } from '../src/components/RuleBasedOutputs/RuleBasedOutputs';

import {
  type Expression,
  type StringCondition,
  type ExpressionOperator,
  type Rule,
  type RuleOutput,
  type RuleWithOutputs,
  type MetadataRuleTrigger,
  type ConcreteExpression,
  type StringTrigger,
  type NumericCondition,
  type FdmRuleOutputSet
} from 'rule-based-outputs/src/lib/types';

const meta = {
  title: 'Example/RuleBasedColoring',
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
  const onLoaded = (): void => {
    setResourceIsLoaded(true);
  };

  // Rule example
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
    externalId: 'rule-output-external-id'
  };

  const ruleOutputTwo: RuleOutput = {
    type: 'color',
    fill: '#ff0000',
    outline: '#000000',
    externalId: 'rule-output-external-id'
  };

  const ruleOne: Rule = {
    id: 'ruleid555', // uuid
    name: 'rule one',
    expression: expressionForInitialGroup
  };

  const ruleTwo: Rule = {
    id: 'ruleid888', // uuid
    name: 'rule two',
    expression: expressionForSecondGroup
  };

  const rulesWithOutputTwo: RuleWithOutputs = {
    rule: ruleTwo,
    outputs: [ruleOutputTwo]
  };
  const rulesWithOutput: RuleWithOutputs = {
    rule: ruleOne,
    outputs: [ruleOutput]
  };
  const ruleSet: FdmRuleOutputSet = {
    rulesWithOutputs: [rulesWithOutput, rulesWithOutputTwo],
    name: 'ABC ind. RuleSet',
    id: '123456789',
    createdAt: Date.now(),
    createdBy: 'daniel.priori@cognite.com',
    shamefulOutputTypes: ['color', 'canvasAnnotation']
  };

  return (
    <>
      <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      {resourceIsLoaded && <RuleBasedOutputs addModelOptions={modelOptions} ruleSet={ruleSet} />}
    </>
  );
};
