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
        {Object.entries(subSections).map(([key, sub]) =>
        {
          const { name, isExpanded } = sub;
          return <ExpansionView
            key={key}
            main={id}
            id={key}
            title={name}
            isExpanded={isExpanded}>
            <SubSection></SubSection>
          </ExpansionView>
        })}
      </div>
    </div>
  );

}