import React, { useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import MainSection from './MainSection';
import { generateSettingsConfig } from "../../../redux/actions/settings"


export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector(({ settings }) => settings);
  const selectedNode = useSelector(({ explorer }) => explorer.selectedNode);
  const { sections, id } = settings;

  useEffect(() => {
    dispatch(generateSettingsConfig(selectedNode));
  }, [
    selectedNode
  ]);

  return (
    <div className="settings-container left-panel-section">
      {id ? Object.entries(sections).map(([key, value]) =>
        <MainSection key={key} id={key} section={value}></MainSection>) : null}
    </div>
  );

}