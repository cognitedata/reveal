import React from 'react';
import ExpansionView from "../Common/ExpansionView";
import TitleBar from './TitleBar';
import SubSection from "./SubSection";

export default function MainSection(props)
{
  const { id, section } = props;
  const { subSections } = section;
  return (
    <div className="settings-section-container left-panel-section">
      <TitleBar
        sectionId={id}
        className="settings-title-bar"
        name={section.name}
        icon={section.icon}
        toolBar={section.toolBar}
      >
      </TitleBar>
      <div className="settings-sections">
        {subSections.map((sub, idx) =>
        {
          const { name, elements, isExpanded } = sub;
          return <ExpansionView
            key={`${id}-sub-${idx}`}
            mainId={id}
            subIndex={idx}
            title={name}
            isExpanded={isExpanded}>
            <SubSection elements={elements}
              mainId={id}
              subIndex={idx}>
            </SubSection>
          </ExpansionView>
        })}
      </div>
    </div>
  );

}