import { ThreeModule } from "./src/Three/ThreeModule";

import { main } from "./main";

// Create the module
const module = new ThreeModule();
module.install();

// Create the root
const root = module.createRoot();

const symbol = Symbol("Nils Petter");
console.log(symbol);
console.log(symbol.toString());

// Start ThreeJS test viewer
main();

// const a = add(1, 2);
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