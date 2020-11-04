import React, { useEffect, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export type TabsPane<T = string> = {
  children: React.ReactElement<TabPaneProps>[];
  tab?: T;
  onTabChange?: (key: T) => void;
};

export const Tabs = <T extends string>({
  children,
  tab: propsTab,
  onTabChange = () => {},
}: TabsPane<T>) => {
  const tabs = children.map(el => el.key) as T[];

  const [currentTab, setTab] = useState<typeof tabs[number]>(
    children[0].key as T
  );

  useEffect(() => {
    if (propsTab) {
      setTab(propsTab);
    }
  }, [propsTab]);

  return (
    <>
      <HeaderWrapper>
        {tabs.map(el => {
          const key = el as typeof tabs[number];

          const item = (children.find(
            tab => tab.key === key
          )! as unknown) as React.ReactElement<TabPaneProps>;

          return (
            <TabHeader
              selected={key === currentTab}
              onClick={() => {
                setTab(key);
                onTabChange(key);
              }}
              key={key}
            >
              {item.props.title}
            </TabHeader>
          );
        })}
      </HeaderWrapper>

      {children.find(el => el.key === currentTab)}
    </>
  );
};

export type TabPaneProps = {
  children?: React.ReactNode;
  key: string;
  title: React.ReactNode;
};

const TabPane: React.FC<TabPaneProps> = ({ children }: TabPaneProps) => {
  return <>{children}</>;
};

Tabs.Pane = TabPane;

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  display: flex;
  align-items: stretch;
  && > *:nth-child(0) {
    margin-left: 0px;
  }
`;

const TabHeader = styled.div<{ selected?: boolean }>(
  props => css`
    margin-right: 32px;

    padding-top: 10px;
    padding-bottom: 10px;
    cursor: pointer;
    transition: 0.3s all;

    border-bottom: 3px solid
      ${props.selected ? Colors.midblue.hex() : 'rgba(0,0,0,0)'};
  `
);
