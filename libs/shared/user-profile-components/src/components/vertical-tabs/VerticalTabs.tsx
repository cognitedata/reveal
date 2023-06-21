import styled from 'styled-components';

import { Button, Flex, IconType } from '@cognite/cogs.js';

export type VerticalTab<K extends string = string> = {
  key: K;
  icon: IconType;
  title: string;
};

export type VerticalTabsProps<K extends string = string> = {
  activeKey: K;
  onChange: (key: K) => void;
  tabs: VerticalTab<K>[];
};

export const VerticalTabs = <K extends string = string>({
  activeKey,
  onChange,
  tabs,
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
          onClick={() => handleChange(key)}
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
