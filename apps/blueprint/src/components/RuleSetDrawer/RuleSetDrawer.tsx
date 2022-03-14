import { Button, Flex, Input } from '@cognite/cogs.js';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import { Rule, RuleOutput, RuleSet } from 'typings';
import { ColorPicker } from 'components/ColorPicker';
import styled from 'styled-components';

import { RuleStylePreview } from './RuleStylePreview';

export type RuleSetDrawerProps = {
  ruleSet: RuleSet;
  onUpdate: (nextRuleSet: RuleSet) => void;
};

export type RuleFormProps = {
  existingRule?: Rule<RuleOutput>;
  onDone: (nextRule: Rule<RuleOutput>) => void;
};

const RuleFormWrapper = styled.div`
  padding: 16px;
  margin-top: 16px;
  background: #fafafa;
  input {
    width: 100%;
  }
  .label {
    padding-top: 8px;
    padding-bottom: 4px;
    font-size: 14px;
    font-weight: 700;

    color: var(--cogs-text-color-secondary);
    text-transform: uppercase;
  }
  button {
    margin-top: 16px;
  }
`;

export const RuleForm = ({ existingRule, onDone }: RuleFormProps) => {
  const [rule, setRule] = useState(
    existingRule ||
      ({
        id: uuid(),
        expression: '',
        output: {
          fill: 'rgba(0, 0, 255)',
          fillOpacity: '0.5',
        },
      } as Rule<RuleOutput>)
  );

  const handleChange = (partial: Partial<Rule<RuleOutput>>) =>
    setRule((prev) => ({ ...prev, ...partial }));

  return (
    <RuleFormWrapper>
      <div className="label">if</div>
      <Input
        value={rule.expression}
        onChange={(e) => {
          handleChange({ expression: e.target.value });
        }}
        placeholder="e.g. corrosion < 5 and status == 'open'"
      />

      <div className="label">then</div>

      <ColorPicker
        color={rule.output.fill || 'rgba(0, 0, 0, .3)'}
        onColorChange={(next) => {
          handleChange({
            output: {
              ...rule.output,
              fill: next,
            },
          });
        }}
      />

      <Button type="primary" block onClick={() => onDone(rule)}>
        Apply
      </Button>
    </RuleFormWrapper>
  );
};

type RuleDisplayProps = {
  rule: Rule<RuleOutput>;
  onUpdate: (nextRule: Rule<RuleOutput>) => void;
  onDelete: () => void;
};

const RuleDisplayWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: #fafafa;
  padding: 16px;
  margin-top: 16px;
  div {
    display: flex;
    align-items: center;
  }
`;
export const RuleDisplay = ({ rule, onUpdate, onDelete }: RuleDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <RuleForm
        existingRule={rule}
        onDone={(next) => {
          onUpdate(next);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <RuleDisplayWrapper>
      <div>
        <RuleStylePreview rule={rule} />
        {rule.expression}
      </div>
      <Flex gap={8}>
        <Button type="ghost" icon="Edit" onClick={() => setIsEditing(true)} />
        <Button type="ghost" icon="Delete" onClick={() => onDelete()} />
      </Flex>
    </RuleDisplayWrapper>
  );
};

const EditableInputWrapper = styled.div`
  input {
    background: transparent;
    border: none;
    font-size: inherit;
  }
`;

const EditableInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (nextValue: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  return (
    <EditableInputWrapper>
      <input
        style={{}}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onValueChange((e.target as HTMLInputElement).value);
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {isFocused && (
        <Button
          type="ghost"
          icon="Checkmark"
          onMouseDown={() => {
            onValueChange(inputValue);
          }}
        />
      )}
    </EditableInputWrapper>
  );
};

const RuleSetWrapper = styled.div`
  h3 {
    margin-bottom: 0;
  }
`;

export const RuleSetDrawer = ({ ruleSet, onUpdate }: RuleSetDrawerProps) => {
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  return (
    <RuleSetWrapper>
      <header>
        <h3>
          <EditableInput
            value={ruleSet.name}
            onValueChange={(nextName) => {
              onUpdate({ ...ruleSet, name: nextName });
            }}
          />
        </h3>
        <Button onClick={() => setIsCreatingRule(true)} type="ghost" icon="Add">
          Add rule
        </Button>
      </header>
      {ruleSet.rules.map((rule) => (
        <RuleDisplay
          key={rule.id}
          rule={rule}
          onUpdate={(nextRule) => {
            onUpdate({
              ...ruleSet,
              rules: ruleSet.rules.map((r) =>
                r.id === nextRule.id ? nextRule : r
              ),
            });
          }}
          onDelete={() => {
            onUpdate({
              ...ruleSet,
              rules: ruleSet.rules.filter((r) => r.id !== rule.id),
            });
          }}
        />
      ))}
      {isCreatingRule && (
        <RuleForm
          onDone={(nextRule) => {
            onUpdate({
              ...ruleSet,
              rules: [...(ruleSet.rules || []), nextRule],
            });
            setIsCreatingRule(false);
          }}
        />
      )}
    </RuleSetWrapper>
  );
};
