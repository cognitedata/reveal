import React from 'react';
import { useSelector } from "react-redux";
import ExpansionView from "../components/common/ExpansionView";
import TitleBar from './common/TitleBar';

export default function Settings()
{
  const settings = useSelector(({ settings }) => settings);
  console.log(settings);
  return (
    <div className="settings-container left-panel-section">
      <TitleBar
        nodeId={settings.id}
        className="settings-title-bar"
        titleBar={settings.titleBar}>
      </TitleBar>
      <div className="settings-sections">
        <ExpansionView title="General Info">
          <h1>Hasita</h1>
        </ExpansionView>
        <ExpansionView title="Statistics">
          <h1>Hasita</h1>
        </ExpansionView>
        <ExpansionView title="Visual Settings">
          <h1>Hasita</h1>
        </ExpansionView>
      </div>
    </div>
  );

}