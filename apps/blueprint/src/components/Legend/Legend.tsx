import { Checkbox } from '@cognite/cogs.js';
import { RuleStylePreview } from 'components/RuleSetDrawer/RuleStylePreview';
import { RuleSet } from 'typings';

import { LegendWrapper } from './elements';

export type LegendProps = {
  ruleSets: RuleSet[];
  disabledRuleSets?: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
};

export const Legend = ({
  ruleSets,
  disabledRuleSets = {},
  onChange,
}: LegendProps) => {
  const renderRules = () =>
    ruleSets.map((r) => (
      <div key={r.id} className="rule-set">
        <div>
          <h3>
            <Checkbox
              name={r.name}
              checked={!disabledRuleSets[r.id]}
              onChange={() => {
                onChange({
                  ...disabledRuleSets,
                  [r.id]: !disabledRuleSets[r.id],
                });
              }}
            />
            {r.name}
          </h3>
          {r.rules.map((r) => (
            <div key={r.id} className="rule-set--details">
              <RuleStylePreview rule={r} />
              {r.expression}
            </div>
          ))}
        </div>
      </div>
    ));

  if (ruleSets.length <= 0) {
    return null;
  }

  return <LegendWrapper>{renderRules()}</LegendWrapper>;
};

export default Legend;
