import styled from 'styled-components';

import { Button, Flex } from '@cognite/cogs.js';

import { VerticalTab } from '../../common/types';
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

  return (
    <Flex direction="column" gap={4}>
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
    </Flex>
  );
};

const TabButton = styled(Button)`
  justify-content: flex-start !important;
`;
