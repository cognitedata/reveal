import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Button, Colors, Dropdown, Menu, InputExp } from '@cognite/cogs.js';

import { CircleIcon } from '../../icons/CircleIcon';

import { RuleColor } from './constants';
import getConditionAsText from './getConditionAsText';
import { Condition, RuleType } from './types';

type RuleProps = {
  onRuleChange: (updaterFn: (rule: RuleType) => RuleType) => void;
  onDeleteClick: () => void;
} & RuleType;

const Rule: React.FC<RuleProps> = ({
  onDeleteClick,
  onRuleChange,
  ...props
}) => {
  const onThenValueChange = useCallback(
    (then: string) =>
      onRuleChange((prevRule) => ({
        ...prevRule,
        then,
      })),
    [onRuleChange]
  );

  const onConditionChange = useCallback(
    (condition: Condition) =>
      onRuleChange((prevRule) => ({
        ...prevRule,
        condition,
      })),
    [onRuleChange]
  );

  const onComparisonValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onRuleChange((prevRule) => ({
        ...prevRule,
        comparisonValue: e.target.value,
      })),
    [onRuleChange]
  );

  return (
    <Container>
      <InnerContainer>
        <Dropdown
          hideOnSelect={{
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          }}
          content={
            <Menu inverted>
              {Object.values(RuleColor).map((color) => (
                <Menu.Item onClick={() => onThenValueChange(color)}>
                  {/* Inverted Menu will be built by cogs https://cognitedata.atlassian.net/browse/CGS-43 */}
                  <CircleIcon fill={color} />
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            icon="ChevronDown"
            iconPlacement="right"
            inverted
            size="small"
          >
            <InnerButtonContainer>
              <CircleIcon fill={props.then} />
            </InnerButtonContainer>
          </Button>
        </Dropdown>
        <div>if</div>
        <Dropdown
          hideOnSelect={{
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          }}
          content={
            <Menu inverted>
              {Object.values(Condition).map((condition) => (
                <Menu.Item onClick={() => onConditionChange(condition)}>
                  {/* Inverted Menu will be built by cogs https://cognitedata.atlassian.net/browse/CGS-43 */}
                  {getConditionAsText(condition)}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            icon="ChevronDown"
            iconPlacement="right"
            inverted
            size="small"
          >
            <InnerButtonContainer>
              {getConditionAsText(props.condition)}
            </InnerButtonContainer>
          </Button>
        </Dropdown>

        <InputContainer>
          <InputExp
            size="small"
            value={props.comparisonValue}
            onChange={onComparisonValueChange}
            inverted
            fullWidth
          />
        </InputContainer>
      </InnerContainer>
      <Button
        icon="Delete"
        type="ghost"
        inverted
        onClick={onDeleteClick}
        size="small"
      />
    </Container>
  );
};

const Container = styled.div`
  color: ${Colors['text-icon--muted--inverted']};
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;

  & > * {
    margin-right: 8px;
  }
`;

const InnerButtonContainer = styled.div`
  min-height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputContainer = styled.div`
  width: 5em;
`;

export default Rule;
