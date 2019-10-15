

import { SyntaxTests } from "./src/SyntaxTests";
import { add } from "./src/Functions";


let a = add(1, 2);
console.debug(a);

SyntaxTests.testVariables();
SyntaxTests.testObject();
SyntaxTests.testForLoop();
SyntaxTests.testArray();
SyntaxTests.testArray2();
SyntaxTests.testArrayTemplate();
SyntaxTests.testMap();
SyntaxTests.testMapTemplate();
SyntaxTests.testSetTemplate();
    
    

setInterval(() => { }, 10000);