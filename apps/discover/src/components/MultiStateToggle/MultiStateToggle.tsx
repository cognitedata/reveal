import { SegmentedControl } from '@cognite/cogs.js';

import { Wrapper } from './elements';

export interface Props<T = string> {
  activeOption: T;
  options: { [optionName: string]: T };
  onChange: (key: T) => void;
}

export const MultiStateToggle = <T extends string>({
  activeOption,
  options,
  onChange,
}: Props<T>) => {
  return (
    <Wrapper data-testid="multi-state-toggle">
      <SegmentedControl
        currentKey={activeOption}
        onButtonClicked={(key) => onChange(key as T)}
      >
        {Object.values(options).map((option) => (
          <SegmentedControl.Button key={option}>
            {option}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    </Wrapper>
  );
};
