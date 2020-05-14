import React from 'react';
import Explorer from '../components/Explorer';
import Settings from "../components/Settings";

export default function LeftPanel()
{
  return (<div className="left-panel">
    <Explorer />
    <Settings />
  </div>
  );

}