import React, { useEffect, useState } from "react";
import NodeVisualizer from "@/UserInterface/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/Three/ThreeModule";
import BPDataModule from "@/Solutions/BP/BPDataModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { SyntheticSubSurfaceModule } from "@/Nodes/SyntheticSubSurfaceModule";

const LOAD_MOCK_DATA = true;

/**
 * App component acts as a container application. Eg- BP
 */
export default function App() {
  const [root, setRoot] = useState<BaseRootNode>();

  const modules = Modules.instance;
  // Setup modules
  const module = new BPDataModule();
  modules.add(new ThreeModule());

  useEffect(() => {
    if (LOAD_MOCK_DATA) {
      Promise.all([
        import("@/Solutions/BP/MockData/Sample/wells.json"),
        import("@/Solutions/BP/MockData/Sample/wellbores.json"),
        import("@/Solutions/BP/MockData/Sample/trajectories.json"),
        import("@/Solutions/BP/MockData/Sample/trajectoryData.json"),
        import("@/Solutions/BP/MockData/Sample/logs.json"),
        import("@/Solutions/BP/MockData/Sample/casings.json"),
        import("@/Solutions/BP/MockData/Sample/ndsEvents.json"),
        import("@/Solutions/BP/MockData/Sample/nptEvents.json")
      ])
        .then(
          ([
            wellsJson,
            wellBoresJson,
            trajectoriesJson,
            trajectoryDataJson,
            logsJson,
            casingsJson,
            ndsEventsJson,
            nptEventsJson
          ]) => {
            module.setModuleData({
              wells: wellsJson.default,
              wellBores: wellBoresJson.default,
              trajectories: trajectoriesJson.default,
              trajectoryData: trajectoryDataJson.default,
              ndsEvents: ndsEventsJson.default,
              nptEvents: nptEventsJson.default,
              casings: casingsJson.default,
              logs: logsJson.default
            });
            modules.add(module);
            modules.install();
            const rootNode = modules.createRoot();
            setRoot(rootNode);
          }
        )
        .catch(err => {
          // tslint:disable-next-line:no-console
          console.error("Sample Data not found synthetic data will be loaded!", err);
          window.alert(`Sample Data not found! App Loaded with Synthetic Module! 
          Disable LOAD_MOCK_DATA constant in App.tsx to remove this warning!`);
          modules.add(new SyntheticSubSurfaceModule());
          modules.install();
          const rootNode = modules.createRoot();
          setRoot(rootNode);
        });
    } else {
      modules.add(new SyntheticSubSurfaceModule());
      modules.install();
      const rootNode = modules.createRoot();
      setRoot(rootNode);
    }

    return () => {
      // clean modules on unmount
      modules.clearModules();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <NodeVisualizer root={root} />
    </div>
  );
}
