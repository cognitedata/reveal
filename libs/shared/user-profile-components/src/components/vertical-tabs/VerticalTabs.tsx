import styled from 'styled-components';

import { Button, Colors, Flex, Select } from '@cognite/cogs.js';

import { RESPONSIVE_BREAKPOINT } from '../../common/constants';
import { VerticalTab } from '../../common/types';
import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';
import { OnTrackEvent, tabChangeEvent } from '../../metrics';

export type VerticalTabsProps<K extends string = string> = {
  activeKey: K;
  onChange: (key: K) => void;
  tabs: VerticalTab<K>[];
  onTrackEvent?: OnTrackEvent;
};

export const VerticalTabs = <K extends string = string>({
  activeKey,
  onChange,
  tabs,
  onTrackEvent,
}: VerticalTabsProps<K>): JSX.Element => {
  const handleChange = (key: K): void => {
    onChange(key);
  };
  const isScreenWideEnough = useIsScreenWideEnough();

  if (!isScreenWideEnough) {
    const options = tabs.map(({ key, title }) => ({
      label: title,
      value: key,
    }));
    return (
      <Container direction="column">
        <StyledSelect
          onChange={(option: { label: string; value: string }) => {
            onTrackEvent?.(tabChangeEvent, { tabKey: option.value });
            handleChange(option.value as K);
          }}
          options={options}
          value={options.find(({ value }) => value === activeKey)}
        />
      </Container>
    );
  }

  return (
    <Container direction="column" gap={4}>
      {tabs.map(({ key, icon, title }) => (
        <TabButton
          key={key}
          icon={icon}
          onClick={() => {
            onTrackEvent?.(tabChangeEvent, { tabKey: key });
            handleChange(key);
          }}
          toggled={activeKey === key}
          type="ghost"
        >
          {title}
        </TabButton>
      ))}
    </Container>
  );
};

const Container = styled(Flex)`
  padding: 0 0 16px 16px;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    background-color: ${Colors['surface--strong']};
    padding: 0 16px 16px 16px;
  }
`;

const TabButton = styled(Button)`
  justify-content: flex-start !important;
`;

const StyledSelect = styled(Select)`
  background-color: ${Colors['surface--muted']};
`;
