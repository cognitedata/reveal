import { SyntaxTests } from "./src/Templates/SyntaxTests";
import { add } from "./src/Templates/Functions";
import { RevealModule } from "./src/Specific/RevealModule";
import { PolylinesNode } from "./src/Specific/PolylinesNode";
import { Render3DTargetNode } from "./src/Nodes/Render3DTargetNode";



let module = new RevealModule();
module.Install();



let node1 = new PolylinesNode();
let node2 = new PolylinesNode();
let target1 = new Render3DTargetNode();
let target2 = new Render3DTargetNode();

node1.name = "node1";
node2.name = "node2";

target1.name = "target1";
target2.name = "target2";

for (let i = 0; i < 2; i++)
{
  let target = target1;
  if (i == 1)
    target = target2;

  for (let j = 0; j < 2; j++)
  {
    let node = node1;
    if (i == 1)
      node = node2;

    console.log("Is visible ${node.name}:" + node.isVisible(target));
    node.setVisible(true, target);
    console.log("Is visible ${node.name}:" + node.isVisible(target));
    node.setVisible(false, target);
    console.log("Is visible ${node.name}:" + node.isVisible(target));
    console.log("---------");
  }
}




let a = add(1, 2);
console.debug(a);

SyntaxTests.testVariables();
SyntaxTests.testForLoop();
SyntaxTests.testArray();
SyntaxTests.testArray2();
SyntaxTests.testArrayTemplate();
SyntaxTests.testMap();
SyntaxTests.testMapTemplate();
SyntaxTests.testSetTemplate();



    
    

// setInterval(() => { }, 10000);