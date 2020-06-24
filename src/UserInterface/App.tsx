import React, { useState, useEffect } from "react";
import NodeVisualizer from "@/UserInterface/NodeVisualizer";
import { Modules } from "@/Core/Module/Modules";
import { ThreeModule } from "@/Three/ThreeModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { SyntheticSubSurfaceModule } from "@/Nodes/SyntheticSubSurfaceModule";

/**
 * App component acts as a container application. Eg- BP
 */
export default function App() {
  const [root, setRoot] = useState<BaseRootNode>();
  const [module, setModule] = useState<SyntheticSubSurfaceModule>(new SyntheticSubSurfaceModule());
  const [renderFlag, setRenderFlag] = useState(false);
  const modules = Modules.instance;

  // Setup modules
  useEffect(() => {
    modules.add(new ThreeModule());
    modules.add(module);
    modules.install();
    setRoot(modules.createRoot());
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <NodeVisualizer root={root} renderFlag={renderFlag} />
    </div>
  );
}
