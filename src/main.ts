import { Range3 } from "./Core/Geometry/Range3";

import { ThreeModule } from "./Three/ThreeModule";
import { ThreeRenderTargetNode } from "./Three/Nodes/ThreeRenderTargetNode";

import { RootNode } from "./Nodes/TreeNodes/RootNode";
import { RandomDataLoader } from "./RootLoaders/RandomDataLoader";
import { BaseRootLoader } from "./RootLoaders/BaseRootLoader";
import { RealDataLoader } from "./RootLoaders/RealDataLoader";

main(document.body);

export default function main(elm: HTMLElement)
{
  const useRealData = false;

  // Create the module and install it it
  const module = new ThreeModule();
  module.install();

  // Load the data
  const root = module.createRoot() as RootNode;

  let loader: BaseRootLoader;
  if (useRealData)
    loader = new RealDataLoader();
  else
    loader = new RandomDataLoader();
  loader.load(root);

  // Set up the draw target
  {
    const fractionRange = Range3.createByMinAndMax(0, 0, 1, 1);
    const target = new ThreeRenderTargetNode(fractionRange);

    target.domElement.style.height = 1200 + "px";
    target.domElement.style.width = 1000 + "px";
    target.domElement.style.position = "absolute";

    elm.appendChild(target.domElement);

    const range = target.pixelRange;
    const stats = target.stats;
    stats.dom.style.left = range.x.min.toFixed(0) + "px";
    stats.dom.style.top = range.y.min.toFixed(0) + "px";
    stats.dom.style.margin = "10px";
    stats.dom.style.position = "absolute";

    elm.appendChild(stats.dom);

    root.targets.addChild(target);
    target.setActiveInteractive();
    target.onResize();
  }
  module.initializeWhenPopulated(root);
  loader.updatedVisible(root);

  const target = root.activeTarget as ThreeRenderTargetNode;
  if (target)
    target.viewAll();

  loader.startAnimate(root);
}
