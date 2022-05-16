import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { RuleSet } from 'typings';

export type BaseRuleControlProps = {
  ruleSets?: RuleSet[];
  shapeRuleSetsIds: string[];
  onClickRuleSet: (nextId: string) => void;
  onNewRuleSet: () => void;
};

export const BaseRuleControl: React.FC<BaseRuleControlProps> = ({
  ruleSets,
  shapeRuleSetsIds,
  onClickRuleSet,
  onNewRuleSet,
}) => {
  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Header>Rule Sets</Menu.Header>
          {ruleSets?.map((r) => (
            <Menu.Item
              key={r.id}
              onClick={() => {
                onClickRuleSet(r.id);
              }}
              appendIcon={
                shapeRuleSetsIds?.includes(r.id) ? 'Checkmark' : undefined
              }
            >
              {r.name}
            </Menu.Item>
          ))}
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              onNewRuleSet();
            }}
          >
            Manage rule sets
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        key="BaseRuleControlButton"
        type="ghost"
        aria-label="fillControlButton"
        icon="Function"
      />
    </Dropdown>
  );
};
