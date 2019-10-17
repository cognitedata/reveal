import { SyntaxTests } from "./src/XYZ/SyntaxTests";
import { add } from "./src/XYZ/Functions";
import { RevealModule } from "./src/Specific/RevealModule";
import { PolylinesNode } from "./src/Specific/PolylinesNode";
import { Render3DTargetNode as RevealTargetNode } from "./src/Nodes/Render3DTargetNode";
import { RootNode } from "./src/Nodes/RootNode";
import { FolderNode } from "./src/Nodes/FolderNode";


// Create the module
let module = new RevealModule();
module.Install();

// Create the root
let root = new RootNode();

// Create some data
{
  let node1 = new PolylinesNode();
  let node2 = new PolylinesNode();
  node1.name = "node1";
  node2.name = "node2";
  let dataFolder = new FolderNode();
  dataFolder.addChild(node1);
  dataFolder.addChild(node2);
  root.addChild(dataFolder);
}

// Create the viewers
{
  let target1 = new RevealTargetNode();
  let target2 = new RevealTargetNode();
  target1.name = "target1";
  target2.name = "target2";
  let targets = new FolderNode();
  targets.addChild(target1);
  targets.addChild(target2);
  root.addChild(targets);
}

for (let descendant of root.getThisAndDescendants())
  console.log(descendant.className + " " + descendant.name);



let symbol = Symbol("Nils Petter");
console.log(symbol);
console.log(symbol.toString());

let f = root.getChildOfType<FolderNode>();
if (f != null)
  console.log("Found " + f.className);


for (let target of root.getChild(1).children)
{
  for (let node of root.getChild(0).children)
  {
    console.log(`Is visible ${node.name}: ` + node.isVisible(target));
    node.setVisible(true, target);
    console.log(`Is visible ${node.name}: ` + node.isVisible(target));
    node.setVisible(false, target);
    console.log(`Is visible ${node.name}: ` + node.isVisible(target));
    console.log(node.root.className + " " + node.root.name);
    console.log('---------');
  }
}

for (let isVisible of [true, false])
{
  for (let target of root.getChild(1).children)
    for (let node of root.getChild(0).children)
      node.setVisible(isVisible, target);

  let visibleCount = 0;
  for (let target of root.getChild(1).children)
    for (let node of root.getChild(0).children)
      if (node.isVisible(target))
        visibleCount++;
  console.debug("visibleCount: " + visibleCount);
}


// let a = add(1, 2);
// console.debug(a);

// SyntaxTests.testVariables();
// SyntaxTests.testForLoop();
// SyntaxTests.testArray();
// SyntaxTests.testArray2();
// SyntaxTests.testArrayTemplate();
// SyntaxTests.testMap();
// SyntaxTests.testMapTemplate();
// SyntaxTests.testSetTemplate();

// setInterval(() => { }, 10000);