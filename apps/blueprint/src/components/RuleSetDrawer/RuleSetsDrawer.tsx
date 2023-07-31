import { Button, Flex, Icon } from '@cognite/cogs.js';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import { RuleSet } from 'typings';
import styled from 'styled-components';

import { RuleSetDrawer } from './RuleSetDrawer';
import { RuleStylePreview } from './RuleStylePreview';

const DrawerWrapper = styled.div`
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .rule-set {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
  }
  .rule-set--details {
    display: flex;
    align-items: center;
  }
  .rule-set--issue {
    display: block;
    height: auto;
    width: 100%;
    border-radius: 0;
    margin-bottom: 8px;
    background: var(--cogs-bg-status-small--danger-pressed);
    white-space: pre-wrap;
    text-align: left;
  }
`;

export type RuleSetsDrawerProps = {
  ruleSets: RuleSet[];
  issues: Record<string, string | undefined>;
  onUpdateRuleSets: (nextRuleSets: RuleSet[]) => void;
  onDeleteRuleSet: (ruleSet: RuleSet) => void;
  onIssueClick: (shapeKey: string) => void;
};

export const RuleSetsDrawer = ({
  ruleSets,
  issues,
  onUpdateRuleSets,
  onDeleteRuleSet,
  onIssueClick,
}: RuleSetsDrawerProps) => {
  const [selectedRuleSetId, setSelectedRuleSetId] = useState<string>();

  const handleNewRuleSet = () => {
    const id = uuid();
    onUpdateRuleSets([
      ...ruleSets,
      {
        id,
        name: 'New rule set',
        rules: [],
      },
    ]);
    setSelectedRuleSetId(id);
  };

  const handleRuleSetUpdate = (ruleSet: RuleSet) => {
    onUpdateRuleSets(ruleSets.map((r) => (r.id === ruleSet.id ? ruleSet : r)));
  };

  if (selectedRuleSetId) {
    const ruleSet = ruleSets.find((r) => r.id === selectedRuleSetId);
    if (!ruleSet) {
      return <Icon type="Loader" />;
    }
    return (
      <DrawerWrapper>
        <header style={{ marginBottom: 16 }}>
          <Button
            type="ghost"
            onClick={() => setSelectedRuleSetId(undefined)}
            icon="ArrowLeft"
          >
            Back to rule sets
          </Button>
        </header>
        <RuleSetDrawer ruleSet={ruleSet} onUpdate={handleRuleSetUpdate} />
      </DrawerWrapper>
    );
  }

  const renderIssues = () => {
    if (
      Object.keys(issues).filter((shapeKey) => Boolean(issues[shapeKey]))
        .length === 0
    )
      return null;

    return (
      <div>
        <header style={{ marginTop: 32 }}>
          <h3>Issues</h3>
        </header>
        {Object.keys(issues)
          .filter((shapeKey) => Boolean(issues[shapeKey]))
          .map((shapeKey) => (
            <Button
              key={shapeKey}
              className="rule-set--issue"
              onClick={() => onIssueClick(shapeKey)}
            >
              {issues[shapeKey]}
            </Button>
          ))}
      </div>
    );
  };

  return (
    <DrawerWrapper>
      <header>
        <h2> Rule sets</h2>{' '}
        <Button onClick={handleNewRuleSet} type="ghost" icon="Add">
          Add rule set
        </Button>
      </header>
      {ruleSets.map((r) => (
        <div key={r.id} className="rule-set">
          <div>
            <h3>{r.name}</h3>
            {r.rules.map((r) => (
              <div key={r.id} className="rule-set--details">
                <RuleStylePreview rule={r} />
                {r.expression}
              </div>
            ))}
          </div>
          <Flex gap={4}>
            <Button
              type="ghost"
              icon="Edit"
              onClick={() => {
                setSelectedRuleSetId(r.id);
              }}
            />
            <Button
              type="ghost"
              icon="Delete"
              onClick={() => {
                onDeleteRuleSet(r);
              }}
            />
          </Flex>
        </div>
      ))}

      {renderIssues()}
    </DrawerWrapper>
  );
};
