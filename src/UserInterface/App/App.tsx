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

const LOAD_MOCK_DATA = false;
const MOCK_DATA_PATH = "@/Solutions/BP/MockData/Sample";

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
    htmlFontSize: 16,
    fontSize: 16 * Appearance.ApplicationDefaultFontSize,
    h2: {
      fontSize: 14,
    },
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

  useEffect(() => {
    if (LOAD_MOCK_DATA) {
      Promise.all([
        import(`${MOCK_DATA_PATH}/wells.json`),
        import(`${MOCK_DATA_PATH}/wellbores.json`),
        import(`${MOCK_DATA_PATH}/trajectories.json`),
        import(`${MOCK_DATA_PATH}/trajectoryData.json`),
        import(`${MOCK_DATA_PATH}/logs.json`),
        import(`${MOCK_DATA_PATH}/casings.json`),
        import(`${MOCK_DATA_PATH}/ndsEvents.json`),
        import(`${MOCK_DATA_PATH}/nptEvents.json`),
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
            "Sample Data not found synthetic data will be loaded!",
            err
          );
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
      <ThemeProvider theme={theme}>
        <NodeVisualizer root={root} />
      </ThemeProvider>
    </div>
  );
}
