import React, { useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import TitleBar from './TitleBar';
import Section from './Section';

import { generateSettingsConfig } from "../../../redux/actions/settings"


export default function Settings() {

  const dispatch = useDispatch();

  const settings = useSelector(({ settings }) => settings);
  const selectedNode = useSelector(({ explorer }) => explorer.selectedNode);

  const { titleBar, sections, id } = settings;

  useEffect(() => {
    dispatch(generateSettingsConfig(selectedNode));
  }, [
    selectedNode
  ]);

  return (
    <div className="settings-container left-panel-section">
      {id ? <React.Fragment>
        <TitleBar
          sectionId={"main"}
          className="settings-title-bar"
          title={titleBar.name}
          icon={titleBar.icon}
          toolBar={titleBar.toolBar}
        ></TitleBar>
        {sections.map((section, idx) =>
          <div key={`${id}-section-${idx}`} className="settings-section-container left-panel-section">
            <Section
              key={`${id}-section-${idx}`}
              section={section}
              sectionId={idx}
            >
            </Section>
          </div>)}
      </React.Fragment> : null}
    </div>
  );

}