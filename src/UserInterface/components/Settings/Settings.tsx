import React from "react";
import { useSelector } from "react-redux";

import TitleBar from "./TitleBar";
import Section from "./Section";
import { ReduxStore } from "@/UserInterface/interfaces/common";

/**
 * Settings component
 */
export default function Settings() {

  const settings = useSelector((state: ReduxStore) => state.settings);
  const { id, titleBar, sections } = settings;

  return (
    <div className="settings-container">
      {id ? <React.Fragment>
        {titleBar && <TitleBar
          sectionId={"-1"}
          className="settings-title-bar"
          title={titleBar.name}
          icon={titleBar.icon}
          toolBar={titleBar.toolBar}
        />}
        {Object.entries(sections).map(([index, section]) => {
          return <div
            key={`${id}-section-${index}`}
            className="settings-section-container">
            <Section
              sectionId={index}
              section={section}
            />
          </div>
        })}
      </React.Fragment> : null}
    </div>
  );
}
