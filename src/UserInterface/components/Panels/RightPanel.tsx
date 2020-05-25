import React, { useRef, useEffect } from "react";
// import main from "@/../main"; //add this once you need to show 3d part

/**
 * Right Panel - 3D/2D viewers
 */
export default function RightPanel() {
  const threeD = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (threeD.current) {
      // main(threeD.current); uncomment to show 3d visualization
    }
  });
  return <div id="right-panel" ref={threeD} className="right-panel"></div>;
}
