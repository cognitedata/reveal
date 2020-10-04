import React, { useEffect, useState } from 'react';
import { SpacedRow } from 'components/Common';
import { Button } from '@cognite/cogs.js';

export type TabsPane = {
  children: React.ReactElement<TabPaneProps>[];
  tab?: string;
  onTabChange?: (key: string) => void;
};

export const Tabs = ({
  children,
  tab: propsTab,
  onTabChange = () => {},
}: TabsPane) => {
  const tabs = children.map(el => el.key) as string[];

  const [currentTab, setTab] = useState<typeof tabs[number]>(
    children[0].key as string
  );

  useEffect(() => {
    if (propsTab) {
      setTab(propsTab);
    }
  }, [propsTab]);

  return (
    <>
      <SpacedRow>
        {tabs.map(el => {
          const key = el as typeof tabs[number];

          const item = (children.find(
            tab => tab.key === key
          )! as unknown) as React.ReactElement<TabPaneProps>;

          if (item.props.titleRenderer) {
            return item.props.titleRenderer();
          }
          return (
            <Button
              variant={key === currentTab ? 'default' : 'ghost'}
              type={key === currentTab ? 'primary' : 'secondary'}
              onClick={() => {
                setTab(key);
                onTabChange(key);
              }}
              key={key}
            >
              {item.props.title}
            </Button>
          );
        })}
      </SpacedRow>

      {children.find(el => el.key === currentTab)}
    </>
  );
};

export type TabPaneProps = {
  children?: React.ReactNode;
  key: string;
  title: React.ReactNode;
  titleRenderer?: () => React.ReactNode;
};

const TabPane: React.FC<TabPaneProps> = ({ children }: TabPaneProps) => {
  return <>{children}</>;
};

Tabs.Pane = TabPane;
