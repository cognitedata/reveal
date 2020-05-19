import React from 'react';

import RightPanel from "./panels/RightPanel";
import LeftPanel from "./panels/LeftPanel";
import Root from "../Root";

export default function SubsurfaceVisualizer() {
  return (
    <Root>
      <div className="root-container">
        <LeftPanel />
        <RightPanel />
      </div>
    </Root>
  );
}
