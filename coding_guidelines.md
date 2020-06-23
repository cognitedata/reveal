# Table of Contents

1. [Types](#types)
2. [References](#references)
3. [Objects](#objects)
4. [Arrays](#arrays)
5. [Functions](#functions)
6. [Arrow Functions](#arrow-functions)
7. [Destructuring](#destructuring)
8. [Strings](#strings)
9. [Modules](#strings)
10. [Properties](#properties)
11. [Comparison Operators & Equality](#comparison-operators-&-equality)
12. [Naming Conventions](#naming-conventions)
13. [Accessors](#accessors)
14. [Packages](#packages)

# Types

### [Primitives](#primitives)

Primitives are passed by value.

```typescript
const favoriteNumber: number = 88;
let newFavoriteNumber: number = favoriteNumber;
newFavoriteNumber = 42;
console.log(favoriteNumber, newFavoriteNumber); // => 88, 42
```

#### Primitive types

- `string`
- `number`
- `boolean`
- `null`
- `undefined`

### [Complex](#complex)

Complex types are passed by reference.

```typescript
const favoriteNumberArray: number[] = [88, 42];
const newFavoriteNumberArray: number[] = favoriteNumberArray;
newFavoriteNumberArray[1] = 1337;
console.log(favoriteNumberArray[1], newFavoriteNumberArray[1]); // => 1337, 1337
```

#### Complex types

- `object`
- `array`
- `function`

# References

Mosst reference rules are defined in our linter, and will give lint errors if misshandled.

> **Note:** Please make sure to include the type on all references, e.g.

```typescript
const months: number = 12;
let currentMonth: number = 6;
```

### [Immutable References](#imutable-references)

Use `const` instead of `var` for all of your immutable references.

### [Mutable References](#mutable-references)

Use `let` instead of `var` if you need a mutable reference.

> `let` is block-scoped rather than function scoped

# Objects

### [Object Instansiation](#object-instansiation)

#### Literal Syntax

Literal syntax is prefered when dealing with simple cases. If an object has a function defined do not create it using literlal syntax, but rather create a [class](#classes) which extends the interface and construct it using it's constructor.

Example of **correct** code for this rule.

```typescript
interface User {
  username: string;
  age: number;
}

const user: User = {
  username: "kanedoe",
  age: 42,
};
```

**!!** Example of **incorrect** code for this rule.

```typescript
interface Store {
  name: string;
  isOpen(hour24: number): boolean;
}

const isOpen = (hour24: number) => {
  return hour24 > 6 && hour24 < 20;
};

const butcherShop = {
  name: "Meaty",
  isOpen, // AVOID!
};
```

#### Interfaces

Interfaces can be created through literal syntax as long as the following rules apply.

- The interface does not contain any functions.
- The interface is a mock-up used for a test class.

If an interface contains a function you should instead make a class implementing said interface for instantiation.

#### Classes

Instead of using literal syntax on complex interfaces, create a class which implements the interface.

Example of **correct** code for this rule.

```typescript
interface Store {
  readonly name: string;
  isOpen(hour24: number): boolean;
}

class ButcherShop implements Store {
  private readonly _name: string;
  private readonly _openingHour: number;
  private readonly _closingHour: number;

  constructor(name: string, openingHour: number, closingHour: number) {
    this._name = name;
    this._openingHour = openingHour;
    this._closingHour = closingHour;
  }

  get name(): string {
    return this._name;
  }

  isOpen(hour24: number): boolean {
    return hour24 >= this._openingHour && hour24 < this._closingHour;
  }
}
```

> **Note:** Make sure to create the correct access level of variables. The Store in the example above has a readonly name to prevent the name of the shop to be changed, in this case where the readonly variable is a primitive it gets passed by value.

> **Note:** Place readonly variables above mutable variables in classes.

### Inheritance(#inheritance)

Use `extends` to inherit prototype functionality without breaking `instanceof`.

Example of **correct** code for this rule.

```typescript
abstract class Geometry {
  abstract areal(): number;
}

class Square extends Geometry {
  private readonly _width: number;
  private readonly _height: number;

  constructor(width: number, height: number) {
    super();
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  public areal(): number {
    return this._width * this._height;
  }
}

class Block extends Square {
  private readonly _color: string;
  constructor(width: number, height: number, color: string) {
    super(width, height);
    this._color = color;
  }

  get color(): string {
    return this._color;
  }
}
```

### [Getters and Setters](#getters-and-setters)

Getters and setters are used to make sure that data is not manipulated in the wrong way. In the example above a getter on the name is safe since the variable itself is passed by reference. But what happens when the getter returns an object?

```typescript
interface Owner {
  name: string;
}

interface Store {
  readonly name: string;
  readonly owner: Owner;
}

class CandyShop implements Store {
  private readonly _name: string;
  private readonly _owner: Owner;

  constructor(name: string, owner: Owner) {
    this._name = name;
    this._owner = owner;
  }

  get name(): string {
    return this._name;
  }

  get owner(): Owner {
    return this._owner;
  }
}
```

By this example it would be easy to assume that the owner is `readonly` and cannot be manipulated, and in some sense it is. Unfortunately since the creator of the Owner interface has not made the name `readonly`, this makes it possible to manipulate the ownername.

```typescript
const candyShop = new CandyShop("CandyPlusPlus", { name: "Willy" });
let name = candyShop.name;
name = "CandySharp";
const owner = candyShop.owner;

owner.name = "Billy";

console.log(candyShop.name); // CandyPlusPlus
console.log(candyShop.owner.name); // Billy
```

You can change the return of `get owner()` to return a `Readonly<Owner>` instead, to prevent the user from manipulating child objects.

Example of **correct** code for this rule.

```typescript
interface Owner {
  name: string;
}

interface Store {
  readonly name: string;
  readonly owner: Owner;
}

class CandyShop implements Store {
  private readonly _name: string;
  private readonly _owner: Owner;

  constructor(name: string, owner: Owner) {
    this._name = name;
    this._owner = owner;
  }

  get name(): string {
    return this._name;
  }

  get owner(): Readonly<Owner> {
    return this._owner;
  }
}
```

> In this example it might make more sense if the owner name was `readonly` and the owner had both a setter and a getter in the shop class.

Example of **correct** code for this rule.

```typescript
interface Owner {
  readonly name: string;
}

interface Store {
  readonly name: string;
  owner: Owner;
}

class CandyShop implements Store {
  private readonly _name: string;
  private readonly _owner: Owner;

  constructor(name: string, owner: Owner) {
    this._name = name;
    this._owner = owner;
  }

  get name(): string {
    return this._name;
  }

  get owner(): Owner {
    return this._owner;
  }

  set owner(owner: Owner): void {
    this._owner = owner;
  }
}
```

### [Private Variables](#private-variables)

Prefix private variables with `_`, e.g. `_name`, `_age`, `_height`.

# Arrays

### [Array Instantiation](#array-instantiation)

For array instantiation you should use the literal syntax instead of `new` constructor.

**!!** Example of **incorrect** code for this rule.

```typescript
const items: number[] = new Array();
```

Example of **correct** code for this rule.

```typescript
const items: number[] = [];
```

### [Array Operations](#array-operations)

For operations on arrays use push etc instead of direct assignment.

**!!** Example of **incorrect** code for this rule.

```typescript
const items: number[] = [];
items[items.length] = 14;
```

Example of **correct** code for this rule.

```typescript
const items: number[] = [];
//
items.push(14);
```

# Functions

### [Expression Vs Declaration](#expression-vs-declaration)

When defining a function we prefer function declaration over function expression, and when dealing with assigned functions we prefer using using an anonymous [arrow function](#arrow-functions) expression.

**!!** Examples of **incorrect** code for this rule.

```typescript
const helloWorld = function(): Void => {};
```

```typescript
const helloWorld = (): void => {};
```

Example of **correct** code for this rule.

```typescript
function helloWorld(): void {}
```

> **Warning:** Declaring a function in a non-function block (if, while etc) has had a history of having different behavior across browsers. It is recommended to assign the function to a variable instead.

### [Don't use Arguments](#dont-use-arguments)

To clarify, your functions can have arguments, but you should never name a parameter `arguments` as this will take precedence over the similarly named object on the function scope, and you don't want to do that.

### [Default Parameters](#default-parameters)

Instead of having mutating function arguments, consider using default parameters.

**!!** Examples of **incorrect** code for this rule.

```typescript
function handleThings(opts): void {
  opts = opts || {};
}
```

> **Note:** This can cause subtle bugs if opts is an object that can be falsly

```typescript
function handleThings(opts): void {
  if (opts === void 0) {
    opts = {};
  }
}
```

Example of **correct** code for this rule.

```typescript
function handleThings(opts = {}): void {}
```

### [Function Signature](#function-signature)

When creating a stand-alone function for usage across different files there are some rules that must be followed.

- Function name
  - descriptive & precise
  - camelCased
  - non-abbreviated
- Function variables
  - descriptive & precise
  - camelCased
  - [destructured](#when-should-you-use-destructuring)
  - typed
- Function returntype
  - always defined

**!!** Example of **incorrect** code for this rule.

```typescript
function hepp(a: number, b: number) {
  return Math.floor(Math.random() * (max - min) + min);
}
```

Example of **better** code for this rule.

```typescript
function randomValue(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
```

Example of **correct** code for this rule.

```typescript
function randomNumberBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}
```

### [Class Functions](#class-functions)

Functions defined in class should follow the strict rules of function signatures. In addition to the general rules, class functions require defining the access level of the function.

Base class of example. Let's try and add some functions to this class.

```typescript
class Thermostat {
  private _targetTemperature: number;
  private _maximumTemperatureLimit: number;
  private _minimumTemperatureLimit: number;

  constructor(
    targetTemperature: number = 22,
    minimumTemperatureLimit: number = 5,
    maximumTemperatureLimit: number = 35
  ) {
    this._targetTemperature = targetTemperature;
    this.minimumTemperatureLimit = minimumTemperatureLimit;
    this.maximumTemperatureLimit = maximumTemperatureLimit;
  }
}
```

**!!** Example of **incorrect** code for this rule.

```typescript
  change(num: number) {
    this._targetTemperature += num;
    if (this._targetTemperature > this._maximumTemperaturLimit) {
      this._targetTemperature = this._maximumTemperatureLimit;
    } else if (this._targetTemperature < this._minimumTemperaturLimit) {
      this._targetTemperature = this._minimumTemperatureLimit;
    }
    return this._targetTemperature;
  }
```

Example of **better** code for this rule.

```typescript
  /**
   * Function to update the target temperature of the thermostat.
   *
   * @param {number} degrees - Amount of degrees to change target temperature.
   * @return {number} - The target temperature of the thermostat.
   */
  public updatingTemperatureBy(degrees: number): number {
    this._targetTemperature = getClampedTemperature(
      this._targetTemperature + degrees
    );
    return this._targetTemperature;
  }

  // Moving out some logic to a separate private function is an alternative.
  private getClampedTemperature(temperature: number): number {
    return temperature > this._maximumTemperatureLimit
      ? this._maximumTemperatureLimit
      : temperature < this._minimumTemperatureLimit
      ? this._minimumTemperatureLimit
      : temperature;
  }
```

> **Note:** You are required to provide documentation if the function name has any ambiguity. In this example since the return value of the function is ambigious we need the function documented.

Example of **correct** code for this rule. First of all, since the clamp functionality is so generic and most likely an operation that will be used for multiple things, we move it into a separate file.

#### someUtilitiesFile.ts

```typescript
export function clampValueToMinMax(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}
```

#### Thermostat.ts

```typescript
  public getTargetTemperatureAfterUpdatingTemperatureBy(degrees: number): number {
    const newTargetTemperature = this._targetTemperature + degrees;
    this._targetTemperature = clampValueToMinMax(newTargetTemperature, this._minimumTemperatureLimit, this._maximumTemperatureLimit);
    return this._targetTemperature;
  }
}
```

# Arrow Functions

### [Function expressions as arrow functions](#function-expressions-as-arrow-functions)

When using function expressions use arrow expressions instead of anonymous and named functions.

**!!** Example of **incorrect** code for this rule.

```typescript
[1, 2, 3].map(function (x: number): number {
  return x * x;
});
```

If the function body fits on one line you can omit the braces and use the implicit return. Example of **correct** code for this rule.

```typescript
[1, 2, 3].map((x: number) => return x * x)
```

> **Note:** If there is a single argument you might get tempted to remove the parantheses, but having type safety on the variable is more secure.

If you have a function body spanning multiple lines then use braces and use a `return` statement.
Example of **correct** code for this rule.

```typescript
[1, 2, 3].map((x: number): number => {
  return x * x;
});
```

>

# Destructuring

### [When should you use destructuring](#when-should-you-use-destructuring)

You should use destructuring whenever you need to create several temporary references of a complex unit.

Let's take a closer look at destructuring using this `Credentials` interface.

```typescript
interface Credentials {
  username: string;
  password: string;
}
```

**!!** Example of **incorrect** code for this rule.

```typescript
function authenticate(credentials: Credentials): boolean {
  const username: string = credentials.username;
  const password: string = credentials.password;

  return this._apiService(username, password);
}
```

Example of **better** code for this rule.

```typescript
function authenticate(credentials: Credentials): boolean {
  const { username, password } = credentials;
  return this._apiService(username, password);
}
```

Example of **correct** code for this rule.

```
function authenticate({ username, password }: Credentials): boolean {
  return this._apiService(username, password);
}
```

You should also use destructuring when working with arrays that have set positions.

```typescript
const arr = [100, 250];
```

**!!** Example of **incorrect** code for this rule.

```typescript
const min = arr[0];
const max = arr[1];
```

Example of **correct** code for this rule.

```typescript
const [min, max] = arr;
```

### [Scalability with Destructuring](#scalability-with-destructuring)

One of the huge benefits of destructuring is that it scales well when working with multiple return values.

**!!** Example of **incorrect** code for this rule.

```typescript
function getBoundingBox(): BoundingBox {
  return [this._left, this._top, this._right, this._bottom];
}
```

> **Note:** When using array destructuring you are required to have all the entries when assigning them to a variable.

**!!** Example of why you should consider object over array destructuring.

```typescript
const [_, top, _, bottom] = getBoundingBox();
```

Example of **correct** code for this rule.

```typescript
function getBoundingBox(): BoundingBox {
  return {
    left: this._left,
    top: this._top,
    right: this._right,
    bottom: this._bottom,
  };
}
```

Due to how destructuring works, the latter example scales a lot better. You can add elements to the return statement without breaking the existing calls to the same function. You also do not need to use all of the returned variables.

```typescript
const { top, bottom } = getBoundingBox();
```

In addition, when adding information to the interface, you don't break the code where destructuring is used.

```typescript
function getBoundingBox(): BoundingBox {
  return {
    visible: this._visible,
    left: this._left,
    top: this._top,
    right: this._right,
    bottom: this._bottom,
  };
}
```

# Strings

### [Single Quotes](#single-quotes)

A string variable should be enclosed by single quotes.

**!!** Example of **incorrect** code for this rule.

```typescript
const name = "Kane Doe";
No!;
```

Example of **correct** code for this rule.

```typescript
const name = "Kane Doe";
```

> **Note:** Make sure you use `string` and not `String`

### [String Breaks](#string-breaks)

If a string is longer than 80 characters, it should be written across multiple lines using breaks.

**!!** Example of **incorrect** code for this rule.

```typescript
const errorMessage =
  "Unable to acquire the correct asset requested. Please make sure you provide the correct identifiers to the requested asset. If this error persists, please make sure to check your internet connection.";
```

Example of **correct** code for this rule.

```typescript
const errorMessage =
  "Unable to acquire the correct asset requested. Please make \
sure you provide the correct identifiers to the requested asset. If this error \
persists, please make sure to check your internet connection.";
```

### [String Concatenation](#string-concatenation)

Another alternative to using `\` for linebreaks is to use string concatenation.
Example of **correct** code for this rule.

```typescript
const errorMessage =
  "Unable to acquire the correct asset requested. " +
  "Please make sure you provide the correct identifiers to the requested asset. " +
  "If this error persists, please make sure to check your internet connection.";
```

> **Note:** Make sure that you do not overuse string concatenation as it has a noticable impact on performance.

### [String Generation](#string-generation)

For strings that are generated programatically use templates instead of concatenation.

**!!** Examples of **incorrect** code for this rule.

```typescript
function debug(tag: string, message: string) {
  console.log("Tag: " + tag + ", message: " + message);
}
```

```typescript
function debug(tag: string, message: string) {
  console.log(["Tag: ", tag, ", message: ", message].join());
}
```

Example of **correct** code for this rule.

```typescript
function debug(tag: string, message: string) {
  console.log(`Tag: ${tag}, message: ${message}`);
}
```

# Modules

### [Import Method](#import-method)

Use typescript import instead of import/require.

**!!** Example of **incorrect** code for this rule.

```typescript
import RevealManager = require("./RevealManager");
```

Example of **correct** code for this rule.

```typescript
import RevealManager from "./RevealManager";
```

You can also scope specific exports from a collection of exports.

Example of **correct** code for this rule.

```typescript
import { of, interval } from "rxjs";
```

# Iterators and Generators

### [Don't use Iterators](#dont-use-iterators) / [Use Iterators](#use-iterators)

Depending on our choise we change the do's and don'ts.

Given you have an array like this.

```typescript
const numbers = [1, 2, 3, 4, 5];
```

**!!** Example of **incorrect** code for this rule.

```typescript
let sum = 0;
for (let num of numbers) {
  sum += num;
}
```

Examples of **correct** code for this rule.

```typescript
let sum = 0;
numbers.forEach((num) => (sum += num));
```

```typescript
const sum = numbers.reduce((total, num) => total + num, 0);
```

# Properties

### Dot Notation

When accessing properties, use the dot notation.

**!!** Example of **incorrect** code for this rule.

```typescript
interface Person {
  readonly name: string;
}

const suspect: Person = { name: "Oscar" };
const name = suspect["name"];
```

Example of **correct** code for this rule.

```typescript
interface Person {
  readonly name: string;
}

const suspect: Person = { name: "Oscar" };
const name = suspect.name;
```

# Comparison Operators & Equality

### [Strict Compare](#strict-compare)

**Don't** use

```typescript
==
!=
```

**Do** use

```typescript
===
!==
```

### [Shortcuts](#shortcuts)


**Don't** use

```typescript
if (name !== '') {}
if (collection.length > 0) {}
```

**Do** use

```typescript
if (name) {}
if (collection.length) {}
!==
```

# Naming Conventions

### [When to use camelCase](#when-to-use-camelcase)
Use `camelCase` when naming objects, functions and instances.

**!!** Examples of **incorrect** code for this rule.
```typescript
const RenderManager = new RevealManager();
const reveal_manager = new RevealManager();
```
```typescript
class Manager {

  public DoStuff(): void {}
}
```
Examples of **correct** code for this rule.
```typescript
const revealManager = new RevealManager();
```
```typescript
class Manager {

  public doStuff(): void {}
}
```

### [When to use PascalCase](#when-to-use-pascalcase)
Use `PascalCase` when naming classes and interfaces.

**!!** Example of **incorrect** code for this rule.
```typescript
interface coffeMachine {}
class material_manager {}
```
Examples of **correct** code for this rule.
```typescript
interface CoffeMachine {}
class MaterialManager {}
```


### [Descriptive naming](#descriptive-naming)

Naming convention is important for others reading your code and contributing. A lot of emphasis should be put on correctly naming a function or a variable.

**!!** Example of **incorrect** code for this rule.

```typescript
class Kek {
  private readonly m: number;
  private bleurg: number = 0;
  constructor(m: number) {
    this.m = m;
  }

  add(n: number): boolean {
    if (this.bleurg + n < this.m) {
      this.bleurg = +n;
      return true;
    }
    return false;
  }
}
```

Excuse the hyperbole example, but even the `add` function which has a descriptive name does do additional work which someone unfamiliar with the code will not catch. The more logic that gets entered into a function, the more likely it is that the name of the function no longer describes the code.

**!!** Example of **incorrect** code for this rule.

```typescript
class Wallet {
  private _amount: number;
  private _loan: number = 0;

  constructor(amount: number) {
    this._amount = amount;
  }

  pay(price: number): boolean {
    if (this._amount - price > 0) {
      this._amount -= price;
      return true;
    } else if (this._loan < 5000 && this._amount !== 0) {
      const loanAmount = price - this._amount;
      this._amount = 0;
      loan += loanAmount;
      return true;
    } else if (this._loan < 5000 && this._amount === 0) {
      loan += price;
      return true;
    }
    return false;
  }
}
```

> **Note:** In addition to the naming convention this price doesn't check if the price number is > 0 to verify that they aren't adding funcs into the wallet buy "paying" for negative values.

The above example illustrates in a way that the function name is no longer discriptive of what the code does. It also starts to blend into a section covered later [Single Responsibility Pattern](#single-responsibility-pattern), but first let's cover the naming convention.

Example of **better** code for this rule.

```typescript
...
payFromWalletOrAttemptToLendMoneyToBuy(price: number): boolean {
  ...
}
...
```

Now the function name mirrors to an extend the behavior of the function, but in a way the function is still a bit wrong. We return a boolean to see if the purchase was accepted, so a better name might have been.

Example of **correct** code for this rule.

```typescript
...
successfullyPaidFromWalletOrLentMoneyToBuy(price: number): boolean {
  ...
}
...
```

Now in addition to describing what happens inside the function it also matches with the return type of the function.

> **Note:** These names are really important if the function is not documented. If the function is not self explanatory then it needs to be documented.

# Accessors

### [Accessor Functions](#accessor-functions)
Althoug accessor functions for properties are not required, if you do create them, use `get__` and `set__`.

**!!** Example of **incorrect** code for this rule.
```typescript
person.firstName();
person.firstName('John');
```
Example of **correct** code for this rule.
```typescript
person.getFirstName();
person.setFirstName('John');
```

### [Boolean Accessors](#boolean-accessors)
In the case of booleans, use a descriptive prefix e.g. `is__`, `has__`.
**!!** Example of **incorrect** code for this rule.
```typescript
if (!person.firstName()) {
  return false;
}
```
Example of **correct** code for this rule.
```typescript
if(!person.hasFirstName()) {
  return false;
}
```
> **Note:** Sometimes `is` and `has` doesn't cover the function operation, at this point you might want to consider if a function is doing too much. On insert functions that return a boolean that represents the result of the operation, add a comment explaining this.

# Packages

### [Feature Structure](#feature-structure)
The package structure of this project is split on feature. Currently there are a handful of root folders in `src`.

### [Datamodels](#datamodels)
Datamodels contains the data types used in the project. In the beginning we have split between `cad` and `pointcloud`, but there should also be a `core` or `common` package containing shared resources.
> **Note:** A shared `abstract class` / `interface` BaseModel which both cad and pointcloud models inherits, belongs in the shared datamodel package.

#### New Features
Depending on whether or not you are adding new or extending features, you will add a new file to the already existing folders, or create a new one inside the appropriate `datamodel` folder.

### [Glsl](#glsl)
Contains shading language. Here you can find fragment and vertex shaders.

### [Public](#public)
The public folder ...
> **Note:** This needs to be updated. The public folder should maybe be moved away and RevealManager should be moved to say the common folder of datamodels, and then we make migration the base folder here.

### [Migration](#migration)
Contains the classes used for migrating from the old viewer `[insert link](link to old 3d viewer repo)` to the new reveal viewer. These classes are the only classes exported from the library at the beginning, meaning everything inside here should change at a much slower pace than classes elsewhere in the project.

### [Utilities](#utilities)
Common folder for utility classes. Common network operations and checks belongs in this folder.

### [Import Alias](#import-alias)
When importing from other files use the `@` alias to make import statements more readable.

### [Package Dependencies](#package-dependencies)
Cross package import statements should be unidirectional. Meaning, classes in the `datamodels` folder can import from `utilities` but not the other way around. If you happen to need data in an `utilities` class from a file in `datamodels` you should create an interface in the `utilities` folder which the class in `datamodels` implements.


**!!** Example of **incorrect** code for this rule.

`datamodels/common/BaseModel.ts`
```typescript
export class BaseModel {
  private _blobUrl: string;

  get blobUrl(): string {
    return this._blobUrl;
  }
}
```
`utilities/network/TransformationProvider.ts`
```typescript
import BaseModel from '@datamodels/common/BaseModel';

export interface TransformationProvider {
  getTransformation(model: BaseModel);
}
```

Example of **correct** code for this rule. (Please excuse the horrible name `BlobMember`)

`utilities/network/BlobMember.ts`
```typescript
export interface BlobMember {
  readonly blobUrl: string;
}
```

```typescript
import BlobMember from '@utilities/network/BlobMember';

export class BaseModel implements BlobMember {
  private _blobUrl: string;

  get blobUrl(): string {
    return this._blobUrl;
  }
}
```
`utilities/network/TransformationProvider.ts`
```typescript
import BlobMember from './BlobMember';

export interface TransformationProvider {
  getTransformation(blobMember: BlobMember);
}
```
> **Note:** Remember you can use [destructuring](#destructuring) to aquire the specific properties you require.
```typescript
  getTransformation({ blobUrl: string }: BlobMember);
```