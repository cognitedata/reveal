import React, { useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import TitleBar from './TitleBar';
import Section from './Section';

import { generateSettingsConfig } from "../../../redux/actions/settings";
import { SettingsSectionInterface } from "../../../interfaces/settings"
import { GlobalState } from "../../../interfaces/common"

/**
 * Settings component
 */
export default function Settings() {

  const dispatch = useDispatch();
  const settings = useSelector((state: GlobalState) => state.settings);
  const selectedNode = useSelector((state: GlobalState) => state.explorer.selectedNode);
  const { titleBar, sections, id } = settings;

  useEffect(() => {
    dispatch(generateSettingsConfig(selectedNode));
  }, [
    selectedNode
  ]);

  return (
    <div className="settings-container left-panel-section">
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
            className="settings-section-container left-panel-section">
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