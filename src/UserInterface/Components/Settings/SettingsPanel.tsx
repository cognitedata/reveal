import React, { useState } from "react";
import { SettingPanelProps } from "@/UserInterface/Components/Settings/Types";
import { SettingsSection } from "@/UserInterface/Components/Settings/SettingsSection/SettingsSection";
import { PanelTitleBar } from "@/UserInterface/Components/PanelTitleBar/PanelTitleBar";
import { NodeUtils } from "@/UserInterface/utils/NodeUtils";

//==================================================
// Main Settings Panel Component
//==================================================

export function SettingsPanel(props: SettingPanelProps) {
  const {
    id,
    titleBar,
    onSectionExpand,
    onPropertyValueChange,
    onPropertyUseChange,
    expandedSections,
  } = props;

  const [, forceUpdate] = useState(0);

  const sections =
    (NodeUtils.createElementTree(NodeUtils.properties) as any)?.elements ?? [];

  const handleUsePropertyChange = (elementId: string, value: boolean) => {
    onPropertyUseChange(elementId, value);
    forceUpdate((val) => ++val);
  };

  const handleValueChange = (elementId: string, value: boolean) => {
    onPropertyValueChange(elementId, value);
    forceUpdate((val) => ++val);
  };

  return (
    <div className="settings-container">
      {id ? (
        <>
          {titleBar && (
            <PanelTitleBar
              sectionId="-1"
              className="settings-title-bar"
              title={titleBar.name}
              icon={titleBar.icon}
              toolBar={titleBar.toolBar}
            />
          )}
          {sections.map((section) => {
            section.isExpanded = expandedSections[section.id];
            return (
              <div
                key={`${section.name}-section`}
                className="settings-section-container"
              >
                {section.elements.length > 0 && (
                  <SettingsSection
                    section={section}
                    onExpand={onSectionExpand}
                    onPropertyValueChange={handleValueChange}
                    onPropertyUseChange={handleUsePropertyChange}
                  />
                )}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
