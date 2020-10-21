import React, { useMemo } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import {
  NodeVisualizer,
  SyntheticSubSurfaceModule,
  ThreeModule,
  Modules,
  ExplorerPropType, VisualizerToolbarProps,
} from "@cognite/node-visualizer";
import { grey } from "@material-ui/core/colors";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { BaseModule } from "../../src/Core/Module/BaseModule";
import { CogniteSeismicClient } from "@cognite/seismic-sdk-js";
import { Explorer } from "./Explorer";
import { Toolbar } from "./Toolbar";

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
    fontSize: 16 * 0.75,
    h2: {
      fontSize: 14,
    },
    body1: {
      fontSize: 16 * 0.75,
    },
  },
});

export function Trajectory(props: { data: BaseModule }) {
  const modules = Modules.instance;

  modules.clearModules();
  modules.add(new ThreeModule());
  if (props.data) {
    modules.add(props.data);
  } else {
    const syntheticModule = new SyntheticSubSurfaceModule();
    syntheticModule.addSeismicCube(
      new CogniteSeismicClient({
        api_url: process.env.REACT_APP_API_URL || "",
        api_key: process.env.REACT_APP_API_KEY || "",
        debug: true,
      }),
      process.env.REACT_APP_FILE_ID || ""
    );
    modules.add(syntheticModule);
  }
  modules.install();

  const root = modules.createRoot();
  const explorer = useMemo(
    () => (props: ExplorerPropType) => <Explorer {...props} />,
    []
  );
  const toolbar = useMemo(() => (props: VisualizerToolbarProps) => <Toolbar {...props} />, []);

  return (
    <ThemeProvider theme={theme}>
      <NodeVisualizer root={root} explorer={explorer} toolbar={toolbar} />
    </ThemeProvider>
  );
}
