import React, { useEffect, useState } from "react";
import { NodeVisualizer } from "@/UserInterface/NodeVisualizer/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/ThreeSubSurface/ThreeModule";
import { BPDataModule } from "@/Solutions/BP/BPDataModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { SyntheticSubSurfaceModule } from "@/SubSurface/SyntheticSubSurfaceModule";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { Appearance } from "@/Core/States/Appearance";
import { CogniteSeismicClient } from "@cognite/seismic-sdk-js";

const LoadMockData = false;

// customize the colors for changing UI style
const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[300],
    },
    secondary: {
      main: grey[50],
    },
  },
  typography: {
    fontSize: 16 * Appearance.ApplicationDefaultFontSize,
    body1: {
      fontSize: 16 * Appearance.ApplicationDefaultFontSize,
    },
  },
});

/**
 * App component acts as a container application. Eg- BP
 */
export function App() {
  const [root, setRoot] = useState<BaseRootNode>();

  const modules = Modules.instance;
  // Setup modules
  const module = new BPDataModule();
  modules.add(new ThreeModule());

  const syntheticDataModule = new SyntheticSubSurfaceModule(
    new CogniteSeismicClient({
      api_url: process.env.API_URL || "",
      api_key: process.env.API_KEY || "",
      debug: true,
    }),
    process.env.FILE_ID || ""
  );

  useEffect(() => {
    if (LoadMockData) {
      Promise.all([
        import("@/Solutions/BP/MockData/Sample/wells.json"),
        import("@/Solutions/BP/MockData/Sample/wellbores.json"),
        import("@/Solutions/BP/MockData/Sample/trajectories.json"),
        import("@/Solutions/BP/MockData/Sample/trajectoryData.json"),
        import("@/Solutions/BP/MockData/Sample/logs.json"),
        import("@/Solutions/BP/MockData/Sample/casings.json"),
        import("@/Solutions/BP/MockData/Sample/ndsEvents.json"),
        import("@/Solutions/BP/MockData/Sample/nptEvents.json"),
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
            nptEventsJson,
          ]) => {
            module.setModuleData({
              wells: wellsJson.default,
              wellBores: wellBoresJson.default,
              trajectories: trajectoriesJson.default,
              trajectoryData: trajectoryDataJson.default,
              ndsEvents: ndsEventsJson.default,
              nptEvents: nptEventsJson.default,
              casings: casingsJson.default,
              logs: logsJson.default,
            });
            modules.add(module);
            modules.install();
            const rootNode = modules.createRoot();
            setRoot(rootNode);
          }
        )
        .catch((err) => {
          // tslint:disable-next-line:no-console
          console.error(
            `Sample Data not found synthetic data will be loaded! 
Disable loadMockData constant in App.tsx to remove this warning!`,
            err
          );
          modules.add(syntheticDataModule);
          modules.install();
          const rootNode = modules.createRoot();
          setRoot(rootNode);
        });
    } else {
      modules.add(syntheticDataModule);
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
    <ThemeProvider theme={theme}>
      <NodeVisualizer root={root} />
    </ThemeProvider>
  );
}
