import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Chip, Colors, Flex, Body } from '@cognite/cogs.js';

import Rule from './Rule';
import type { RuleType } from './types';

type RulesProps = {
  rules: RuleType[];
  onRulesChange: (updaterFn: (prevRules: RuleType[]) => RuleType[]) => void;
};

const Rules: React.FC<RulesProps> = ({ rules, onRulesChange }) => {
  const onRuleChangeById = useCallback(
    (id: string) => (updaterFn: (prevRule: RuleType) => RuleType) => {
      onRulesChange((prevRules) =>
        prevRules.map((rule) => (rule.id === id ? updaterFn(rule) : rule))
      );
    },
    [onRulesChange]
  );

  const onRuleDelete = useCallback(
    (id: string) => () => {
      onRulesChange((prevRules) => prevRules.filter((rule) => rule.id !== id));
    },
    [onRulesChange]
  );

  return (
    <Container>
      <RulesHeadline>
        <Flex alignItems="center">
          <Body strong size="x-small" inverted>
            Rules
          </Body>
          <ChipContainer>
            <Chip
              size="x-small"
              // TODO: No inverted chips in Cogs
              style={{ color: Colors['text-icon--muted--inverted'] }}
              label={String(rules.length)}
            />
          </ChipContainer>
        </Flex>
      </RulesHeadline>
      {rules.map((rule) => (
        <Rule
          key={rule.id}
          id={rule.id}
          then={rule.then}
          condition={rule.condition}
          comparisonValue={rule.comparisonValue}
          onRuleChange={onRuleChangeById(rule.id)}
          onDeleteClick={onRuleDelete(rule.id)}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
`;

const RulesHeadline = styled.div`
  padding-bottom: 3px;
`;

const ChipContainer = styled.div`
  margin-left: 4px;
`;

export default Rules;
