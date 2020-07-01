import React, { useState, useEffect } from "react";
import NodeVisualizer from "@/UserInterface/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/Three/ThreeModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import BPDataModule from "@/Solutions/BP/BPDataModule";
import { RiskEvent } from "@/Interface";

import { wells, wellBores, trajectories, trajData, logs } from '@/Solutions/BP/MockData';

/**
 * App component acts as a container application. Eg- BP
 */
export default function App() {
  const [root, setRoot] = useState<BaseRootNode>();
  const [bpDataModule, setDataModule] = useState<BPDataModule>(new BPDataModule());
  const [renderFlag, setRenderFlag] = useState(false);
  const modules = Modules.instance;

  // Setup modules
  useEffect(() => {
    modules.add(new ThreeModule());
    modules.add(bpDataModule);
    modules.install();
    setRoot(modules.createRoot());
  }, []);

  useEffect(() => {
    if (!root) return;
    const emptyRiskEvents:RiskEvent[] = [];

    bpDataModule.setModuleData({
      wells,
      wellBores,
      trajectories,
      trajectoryData: trajData,
      ndsEvents:emptyRiskEvents,
      nptEvents:emptyRiskEvents,
      logs
    });
    bpDataModule.loadData(root);
    setRenderFlag(!renderFlag);
  }, [root, wells]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <NodeVisualizer root={root} renderFlag={renderFlag} />
    </div>
  );
}
