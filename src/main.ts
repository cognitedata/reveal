import { Range3 } from "@/Core/Geometry/Range3";
import { ThreeModule } from "@/ThreeSubSurface/ThreeModule";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { SyntheticSubSurfaceModule } from "@/SubSurface/SyntheticSubSurfaceModule";
import { Modules } from "@/Core/Module/Modules";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

main(document.body);

export default function main(element: HTMLElement)
{
  // Create the module and install it it
  const modules = Modules.instance;
  modules.add(new ThreeModule());
  modules.add(new SyntheticSubSurfaceModule());
  modules.install();

  // Load the data
  const root = modules.createRoot();

  // Set up the render target
  addRenderTarget(element, root);
  modules.initializeWhenPopulated(root);
  modules.startAnimate(root);
}

function addRenderTarget(element: HTMLElement, root: BaseRootNode)
{
  const fractionRange = Range3.createByMinAndMax(0, 0, 1, 1);
  const target = new ThreeRenderTargetNode(fractionRange);

  target.domElement.style.height = `${100}vh`;
  target.domElement.style.width = `${100}vw`;
  target.domElement.style.position = "absolute";
  target.domElement.style.top = `${0}px`;
  target.domElement.style.left = `${0}px`;

  element.appendChild(target.domElement);

  root.targets.addChild(target);
  target.setActiveInteractive();
}
