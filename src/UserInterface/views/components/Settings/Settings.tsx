import React from 'react';
import { useSelector } from "react-redux";

import TitleBar from './TitleBar';
import Section from './Section';

import { SettingsSectionInterface } from "../../../interfaces/settings"
import { GlobalState } from "../../../interfaces/common"

/**
 * Settings component
 */
export default function Settings() {

  const settings = useSelector((state: GlobalState) => state.settings);
  const { titleBar, sections, id } = settings;

  return (
    <div className="settings-container">
      {id ? <React.Fragment>
        {titleBar && <TitleBar
          sectionId={-1}
          className="settings-title-bar"
          title={titleBar.name}
          icon={titleBar.icon}
          toolBar={titleBar.toolBar}
        />}
        {sections.map((section: SettingsSectionInterface, idx: number) =>
          <div
            key={`${id}-section-${idx}`}
            className="settings-section-container">
            <Section
              key={`${id}-section-${idx}`}
              section={section}
              sectionId={idx}
            />
          </div>)}
      </React.Fragment> : null}
    </div>
  );

}