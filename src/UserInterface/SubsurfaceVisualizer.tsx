import React from "react";
import Root from "./Root";
import { Provider } from "react-redux";

/**
 * Subsurface Visualizer Component of the application
 * This will render all the components (Settings/Explorer/3D viewers etc.)
 */
export default function SubsurfaceVisualizer(props: { store: any }) {
  return (
    <Provider store={props.store}>
      <Root />
    </Provider>
  );
}
