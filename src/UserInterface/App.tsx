import React, { useEffect } from "react";
import NodeVisualizer from "@/UserInterface/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/Three/ThreeModule";
import BPDataModule from "@/Solutions/BP/BPDataModule";
import { wells, wellBores, trajectories, trajData, logs } from "@/Solutions/BP/MockData/Synthetic";
import wellsJson from "@/Solutions/BP/MockData/Sample/wells.json";
import wellBoresJson from "@/Solutions/BP/MockData/Sample/wellbores.json";
import trajectoriesJson from "@/Solutions/BP/MockData/Sample/trajectories.json";
import trajectoryDataJson from "@/Solutions/BP/MockData/Sample/trajectoryData.json";
import logsJson from "@/Solutions/BP/MockData/Sample/logs.json";
import casingsJson from "@/Solutions/BP/MockData/Sample/casings.json";
import ndsEventsJson from "@/Solutions/BP/MockData/Sample/ndsEvents.json";
import nptEventsJson from "@/Solutions/BP/MockData/Sample/nptEvents.json";


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

  if (process.env['data.src'] === 'sample') {
    module.setModuleData({
      wells: wellsJson,
      wellBores: wellBoresJson,
      trajectories: trajectoriesJson,
      trajectoryData: trajectoryDataJson,
      ndsEvents: ndsEventsJson,
      nptEvents: nptEventsJson,
      casings: casingsJson,
      logs: logsJson
    });
  } else {
    module.setModuleData({
      wells,
      wellBores,
      trajectories,
      trajectoryData: trajData,
      ndsEvents: [],
      nptEvents: [],
      casings: [],
      logs
    });
  }

  modules.add(new ThreeModule());
  //modules.add(new SyntheticSubSurfaceModule());
  modules.add(module);
  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <NodeVisualizer root={root} />
    </div>
  );
}
