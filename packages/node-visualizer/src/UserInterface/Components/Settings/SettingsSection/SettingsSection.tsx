import React from 'react';

import { ExpansionView } from '../../../../UserInterface/Components/ExpansionView/ExpansionView';
import { SettingsElement } from '../../../../UserInterface/Components/Settings/SettingsElement/SettingsElement';
import {
  ISettingsSection,
  ISettingsElement,
  ISettingsSectionProps,
} from '../../../../UserInterface/Components/Settings/Types';

export const SettingsSection = (props: ISettingsSectionProps) => {
  const { id, name, isExpanded, toolBar, subSections, elements } =
    props.section;

  return (
    <ExpansionView
      id={id}
      title={name}
      isExpanded={isExpanded}
      toolBar={toolBar}
      onSectionExpand={props.onExpand}
    >
      <>
        {elements && (
          <div>
            {elements.map(
              (element: ISettingsElement) =>
                element && (
                  <SettingsElement
                    key={`${element.id}-input-`}
                    sectionId={id}
                    config={element}
                    onPropertyValueChange={props.onPropertyValueChange}
                    onPropertyUseChange={props.onPropertyUseChange}
                  />
                )
            )}
          </div>
        )}
        {subSections && subSections.length ? (
          <div>
            {subSections.map((subSection: ISettingsSection) => (
              <SettingsSection
                key={`${subSection.id}-sub-section`}
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
};
