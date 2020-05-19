import React from 'react';

import ExpansionView from "../Common/ExpansionView";
import Form from './Form';
import { SettingsSectionInterface } from "../../../interfaces/settings"

export default function Section(props: {
  sectionId: number,
  subSectionId?: number,
  section: SettingsSectionInterface,
}) {

  const { sectionId, subSectionId, section } = props;
  const { name, toolBar, elements, subSections } = section;

  return (
    <ExpansionView
      sectionId={sectionId}
      title={name}
      isExpanded={section.isExpanded}
      toolBar={toolBar}
      subSectionId={subSectionId}
    >
      <React.Fragment>
        {elements ? <Form
          elements={elements}
          sectionId={sectionId}
          subSectionId={subSectionId}
        /> : null}
        {subSections ?
          <div className="left-panel-section additional-padding">
            {subSections.map((subSection, index: number) =>
              (<Section
                key={`${sectionId}-sub-${subSectionId}-${index}`}
                section={subSection}
                sectionId={sectionId}
                subSectionId={index} />
              ))}</div> : null}
      </React.Fragment>
    </ExpansionView>
  );
}