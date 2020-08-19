import React from "react";
import { SettingPanelProps } from "@/UserInterface/Components/Settings/Types";
import PanelTitleBar from "@/UserInterface/Components/PanelTitleBar/PanelTitleBar";
import SettingsSection from "@/UserInterface/Components/Settings/SettingsSection";

//==================================================
// Main Settings Panel Component
//==================================================

export default function SettingsPanel(props: SettingPanelProps) {
  const { id, titleBar, sections, onSectionExpand, onSettingChange } = props;

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
            return (
              <div
                key={`${section.name}-section`}
                className="settings-section-container"
              >
                <SettingsSection
                  section={section}
                  onExpand={onSectionExpand}
                  onElementChange={onSettingChange}
                />
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
