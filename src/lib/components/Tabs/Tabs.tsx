import React, { useEffect, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';

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
          const { disabled, title } = item.props;

          return (
            <TabHeader
              selected={key === currentTab}
              disabled={disabled}
              onClick={
                disabled
                  ? () => {}
                  : () => {
                      setTab(key);
                      onTabChange(key);
                    }
              }
              key={key}
            >
              {title}
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
  disabled?: boolean;
};

const TabPane: React.FC<TabPaneProps> = ({ children }: TabPaneProps) => {
  return <>{children}</>;
};

Tabs.Pane = TabPane;

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${lightGrey};
  display: flex;
  align-items: stretch;
  padding-top: 10px;
  zindex: 1;
  && > *:nth-child(0) {
    margin-left: 0px;
  }
`;

const TabHeader = styled.div<{ selected?: boolean; disabled?: boolean }>(
  props => css`
    margin-right: 32px;
    cursor: ${props.disabled ? 'not-allowed' : 'pointer'};
    transition: 0.3s all;
    padding-bottom: 10px;
    border-bottom: 3px solid
      ${props.selected ? Colors.midblue.hex() : 'rgba(0,0,0,0)'};
  `
);
