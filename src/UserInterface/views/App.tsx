import React from 'react';
import RightPanel from "./panels/RightPanel";
import LeftPanel from "./panels/LeftPanel";

export default function App() {
  return (
    <div className="root-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
