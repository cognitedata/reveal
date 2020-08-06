import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Icon from "@/UserInterface/Components/Icon/Icon";
import { ExplorerTabsPropType } from "@/UserInterface/Components/Explorer/ExplorerTypes";

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
    <div className="node-tabs">
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        {tabs.map((tab) => (
          <Tab
            key={`node-type-${tab.type}`}
            label={
              <div className="node-tab">
                <Icon src={tab.icon} />
                <span>{tab.name}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
}
