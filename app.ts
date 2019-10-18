import { RevealModule } from "./src/Specific/RevealModule";
import { PolylinesNode } from "./src/Specific/PolylinesNode";
import { RootNode } from "./src/Nodes/RootNode";
import { FolderNode } from "./src/Nodes/FolderNode";
import { RevealTargetNode } from "./src/Specific/RevealTargetNode";

import { main } from "./main";

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


let symbol = Symbol("Nils Petter");
console.log(symbol);
console.log(symbol.toString());


// Start ThreeJS test viewer
main();


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