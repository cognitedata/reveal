import { SyntaxTests } from "./src/Templates/SyntaxTests";
import { add } from "./src/Templates/Functions";
import { RevealModule } from "./src/Specific/RevealModule";



let module = new RevealModule();
module.Install();

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