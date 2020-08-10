import React from "react";
import { ISettingsSection } from "@/UserInterface/Components/Settings/Types";
import ExpansionView from "@/UserInterface/Components/ExpansionView/ExpansionView";
import SettingsElement from "@/UserInterface/Components/Settings/SettingsElement";

export type SettingsSectionProps = {
  section: ISettingsSection;
  onExpand: (id: string, expandStatus: boolean) => void;
  onElementChange: (elementId: string, value: any) => void;
};

export default function SettingsSection(props: SettingsSectionProps) {
  const { name, isExpanded, toolBar, subSections, elements } = props.section;

  return (
    <ExpansionView
      id={name}
      title={name}
      isExpanded={isExpanded}
      toolBar={toolBar}
      onExpandChange={props.onExpand}
    >
      <>
        {elements && (
          <div className="settings-section-element-container">
            {elements.map((element) => (
              <SettingsElement
                key={`${element.name}-input-`}
                sectionId={name}
                config={element}
                onChange={props.onElementChange}
              />
            ))}
          </div>
        )}
        {subSections && subSections.length ? (
          <div className="sub-section-container additional-padding">
            {subSections.map((subSection: ISettingsSection) => (
              <SettingsSection
                key={`${subSection.name}-sub-section`}
                section={subSection}
                onExpand={props.onExpand}
                onElementChange={props.onElementChange}
              />
            ))}
          </div>
        ) : null}
      </>
    </ExpansionView>
  );
}
