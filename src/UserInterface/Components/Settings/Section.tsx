import React from 'react';
import { useSelector } from "react-redux";

import ExpansionView from "./ExpansionView";
import Form from './Form';
import {SettingsSection} from "@/UserInterface/Components/Settings/Types";
import {State} from "@/UserInterface/Redux/State/State";

// Top level settings component
export default function Section(props: {
  section: SettingsSection,
  sectionId: string,
  subSectionId?: string,
}) {

  const { sectionId, subSectionId, section } = props;
  const { name, isExpanded, toolBar, subSectionIds, elementIds } = section;
  const settings = useSelector((state: State) => state.settings); //TODO: use map to properties and get rid of reference to state
  const { subSections } = settings;

  return (
    <ExpansionView
      sectionId={sectionId}
      subSectionId={subSectionId}
      title={name}
      isExpanded={isExpanded}
      toolBar={toolBar}
    >
      <React.Fragment>
        {elementIds ? <Form
          elementIds={elementIds}
          sectionId={sectionId}
        /> : null}
        {subSectionIds ?
          <div className="left-panel-section additional-padding">
            {subSectionIds.map((id: string) =>
              (<Section
                key={`${sectionId}-sub-${id}-${id}`}
                section={subSections[id]}
                sectionId={sectionId}
                subSectionId={id} />
              ))}</div> : null}
      </React.Fragment>
    </ExpansionView>
  );
}
