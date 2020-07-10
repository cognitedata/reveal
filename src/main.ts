import { Range3 } from "@/Core/Geometry/Range3";
import { ThreeModule } from "@/Three/ThreeModule";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { SyntheticSubSurfaceModule } from "@/Nodes/SyntheticSubSurfaceModule";
import { Modules } from "@/Core/Module/Modules";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { LineSegment } from "@/Core/Geometry/LineSeg3";

main(document.body);

export default function main(element: HTMLElement)
{
  const p1 = new Vector3(0, 1, 2);
  const p2 = new Vector3(5, 7, 9);
  const line = new LineSegment(p1, p2);

  const p3 = Vector3.getCenterOf2(p1, p2);
  let a = line.getClosest(p3);
  console.log(p3.toString());
  console.log(a.toString());

  a = line.getClosest(p1);
  console.log(p1.toString());
  console.log(a.toString());

  a = line.getClosest(p2);
  console.log(p2.toString());
  console.log(a.toString());

  p1.addScalar(-1);
  a = line.getClosest(p1);
  console.log(p1.toString());
  console.log(a.toString());

  p2.addScalar(1);
  a = line.getClosest(p2);
  console.log(p2.toString());
  console.log(a.toString());


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

  target.domElement.style.height = 100 + "vh";
  target.domElement.style.width = 100 + "vw";
  target.domElement.style.position = "absolute";
  target.domElement.style.top = 0 + "px";
  target.domElement.style.left = 0 + "px";

  element.appendChild(target.domElement);

  root.targets.addChild(target);
  target.setActiveInteractive();
  target.onResize();
}

