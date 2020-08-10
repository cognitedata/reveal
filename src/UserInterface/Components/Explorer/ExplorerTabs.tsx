import React from "react";
import Icon from "@/UserInterface/Components/Icon/Icon";
import { ExplorerTabsPropType } from "@/UserInterface/Components/Explorer/ExplorerTypes";
import {
  StyledTabs,
  StyledTab,
} from "@/UserInterface/Components/Tabs/StyledTabs";

// Renders Explorer Tabs
export function ExplorerTabs(props: ExplorerTabsPropType) {
  const { onTabChange, tabs, selectedTabIndex } = props;
  if (!tabs) {
    return null;
  }
  const handleChange = (event: React.ChangeEvent<{}>, tabIndex: number) => {
    onTabChange(tabIndex);
  };

  return (
    <div className="explorer-tabs">
      <StyledTabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        {tabs.map((tab) => (
          <StyledTab
            tabIndex={0}
            key={`node-type-${tab.type}`}
            label={
              <div className="explorer-tab">
                <Icon src={tab.icon} />
                <span>{tab.name}</span>
              </div>
            }
          />
        ))}
      </StyledTabs>
    </div>
  );
}
