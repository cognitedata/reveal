import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import {
  NodeVisualizer,
  SyntheticSubSurfaceModule,
  ThreeModule,
  Modules,
} from "@cognite/node-visualizer";
import { grey } from "@material-ui/core/colors";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { BaseModule } from "../../src/Core/Module/BaseModule";

// customize the colors for changing UI style
const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[300]
    },
    secondary: {
      main: grey[50]
    }
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 16 * 0.75,
    h2: {
      fontSize: 14
    },
    body1: {
      fontSize: 16 * 0.75
    }
  }
});

export function Trajectory(props: { data: BaseModule }) {
  const modules = Modules.instance;

  modules.clearModules();
  modules.add(new ThreeModule());
  if(props.data) {
    modules.add(props.data);
  } else {
    modules.add(new SyntheticSubSurfaceModule(SyntheticSubSurfaceModule.createSeismicClient(), process.env.FILE_ID || ""));
  }
  modules.install();

  const root = modules.createRoot();

  return (
        <ThemeProvider theme={ theme }>
          <NodeVisualizer root={ root }/>
        </ThemeProvider>
  );
}
