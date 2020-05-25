import React from 'react';
import { useSelector } from "react-redux";

import ExpansionView from "../Common/ExpansionView";
import Form from './Form';
import { SettingsSectionInterface } from "@/UserInterface/interfaces/settings";
import { ReduxStore } from "@/UserInterface/interfaces/common";

// Top level settings component
export default function Section(props: {
  section: SettingsSectionInterface,
  sectionId: string,
  subSectionId?: string,
}) {

  const { sectionId, subSectionId, section } = props;
  const { name, isExpanded, toolBar, subSectionIds, elementIds } = section;
  const settings = useSelector((state: ReduxStore) => state.settings);
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
