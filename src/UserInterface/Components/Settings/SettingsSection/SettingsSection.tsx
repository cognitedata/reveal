import React from "react";
import {
  ISettingsSection,
  ISettingsElement,
  ISettingsSectionProps,
} from "@/UserInterface/Components/Settings/Types";
import ExpansionView from "@/UserInterface/Components/ExpansionView/ExpansionView";
import SettingsElement from "@/UserInterface/Components/Settings/SettingsElement/SettingsElement";
import "./SettingsSection.module.scss";

export default function SettingsSection(props: ISettingsSectionProps) {
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
            {elements.map(
              (element: ISettingsElement) =>
                element && (
                  <SettingsElement
                    key={`${element.name}-input-`}
                    sectionId={name}
                    config={element}
                    onPropertyValueChange={props.onPropertyValueChange}
                    onPropertyUseChange={props.onPropertyUseChange}
                  />
                )
            )}
          </div>
        )}
        {subSections && subSections.length ? (
          <div className="sub-section-container additional-padding">
            {subSections.map((subSection: ISettingsSection) => (
              <SettingsSection
                key={`${subSection.name}-sub-section`}
                section={subSection}
                onExpand={props.onExpand}
                onPropertyValueChange={props.onPropertyValueChange}
                onPropertyUseChange={props.onPropertyUseChange}
              />
            ))}
          </div>
        ) : null}
      </>
    </ExpansionView>
  );
}
