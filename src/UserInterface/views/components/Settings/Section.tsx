import React from 'react';

import ExpansionView from "../Common/ExpansionView";
import Form from './Form';

export default function Section(props) {

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
      {subSections ?
        <div className="settings-section-container left-panel-section additional-padding">
          {subSections.map((subSection, index: number) =>
            (<Section
              key={`${sectionId}-sub-${subSectionId}-${index}`}
              section={subSection}
              sectionId={sectionId}
              subSectionId={index}>
            </Section>))}</div> :
        <Form
          elements={elements}
          sectionId={sectionId}
          subSectionId={subSectionId}
        >
        </Form>}
    </ExpansionView>
  );
}