import React from 'react';
import { useSelector } from "react-redux";
import MainSection from './MainSection';

export default function Settings()
{
  const settings = useSelector(({ settings }) => settings);
  const { sections } = settings;
  return (
    <div className="settings-container left-panel-section">
      {Object.entries(sections).map(([key, value]) =>
        <MainSection key={key} id={key} section={value}></MainSection>)}
    </div>
  );

}