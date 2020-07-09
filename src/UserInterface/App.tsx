import React, { useEffect } from "react";
import NodeVisualizer from "@/UserInterface/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/Three/ThreeModule";
import BPDataModule from "@/Solutions/BP/BPDataModule";
import { wells, wellBores, trajectories, trajData, logs } from "@/Solutions/BP/MockData";
import { SyntheticSubSurfaceModule } from "@/Nodes/SyntheticSubSurfaceModule";
import { ICasing } from '@/Interface/ICasing';

/**
 * App component acts as a container application. Eg- BP
 */
export default function App()
{
  const modules = Modules.instance;

  useEffect(() =>
  {
    return () =>
    {
      // clean modules on unmount
      modules.clearModules();
    };
  });

  // Setup modules
  const module = new BPDataModule();

  module.setModuleData({
    wells,
    wellBores,
    trajectories,
    trajectoryData: trajData,
    ndsEvents: [],
    nptEvents: [],
    logs,
    casings: []
  });

  modules.add(new ThreeModule());
  modules.add(new SyntheticSubSurfaceModule());
  //modules.add(module);
  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <NodeVisualizer root={root} />
    </div>
  );
}
