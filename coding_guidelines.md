# Table of Contents
1. [Types](#types)
2. [References](#references)
3. [Objects](#objects)
4. [Arrays](#arrays)
5. [Functions](#functions)
6. [Arrow Functions](#arrow-functions)
7. [Destructuring](#destructuring)
8. [Strings](#strings)

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
console.log(favoriteNumberArray[1], newFavoriteNumberArrayp[1]); // => 1337, 1337
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
Literal syntax is prefered when dealing with simple cases. Perfectly valid usage of literal syntax:
```typescript
interface User {
  username: string;
  age: number;
}

const user: User = {
  username: 'kanedoe',
  age: 42
}
```
**Avoid!!!** using literal syntax if function are defined in the object!
```typescript
interface Store {
  name: string;
  isOpen(hour24: number): boolean;
}

const isOpen = (hour24: number) => {
  return hour24 > 6 && hour24 < 20;
}

const butcherShop = {
  name: 'Meaty',
  isOpen // AVOID!
}
```

#### Interfaces
Interfaces can be created through literal syntax as long as the following rules apply.
- The interface does not contain any functions.
- The interface is a mock-up used for a test class.

If an interface contains a function you should instead make a class implementing said interface for instantiation. 

#### Classes
Instead of using literal syntax on complex interfaces, create a class which implements the interface.
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
const candyShop = new CandyShop('CandyPlusPlus', { name: 'Willy' });
let name = candyShop.name;
name = "CandySharp";
const owner = candyShop.owner;

owner.name = 'Billy';

console.log(candyShop.name); // CandyPlusPlus
console.log(candyShop.owner.name); // Billy
```
> In this example it might make more sense if the owner name was `readonly` and the owner had both a setter and a getter.

### [Private Variables](#private-variables)
Prefix private variables with `_`, e.g. `_name`, `_age`, `_height`.

### [Naming Guidelines](#naming-guidelines)
Naming convention is important for others reading your code and contributing. A lot of emphasis should be put on correctly naming a function or a variable.
```typescript
// DON'T MAKE A CLASS LIKE THIS!
class Kek {
  private readonly m: number;
  private bleurg: number = 0;
  constructor(m: number){
    this.m = m;
  }
  
  add(n: number): boolean {
    if(this.bleurg + n < this.m) {
      this.bleurg =+ n;
      return true;
    }
    return false;
    
  }
}
```
Excuse the hyperbole example, but even the `add` function which has a descriptive name does do additional work which someone unfamiliar with the code will not catch. The more logic that gets entered into a function, the more likely it is that the name of the function no longer describes the code.

```typescript
// DON'T MAKE A CLASS LIKE THIS!
class Wallet {
  private _amount: number;
  private _loan: number = 0;
  
  constructor(amount: number) {
    this._amount = amount;
  }

  pay(price: number): boolean {
    if(this._amount - price > 0) {
      this._amount -= price;
      return true;
    } else if(this._loan < 5000 && this._amount !== 0) {
      const loanAmount = price - this._amount;
      this._amount = 0;
      loan += loanAmount;
      return true;
    } else if(this._loan < 5000 && this._amount === 0) {
      loan += price;
      return true;
    }
    return false;
  }
}
```
> **Note:** In addition to the naming convention this price doesn't check if the price number is > 0 to verify that they aren't adding funcs into the wallet buy "paying" for negative values.

The above example illustrates in a way that the function name is no longer discriptive of what the code does. It also starts to blend into a section covered later [Single Responsibility Pattern](#single-responsibility-pattern), but first let's cover the naming convention. A way to make the function more discriptive would be:
```typescript
...
payFromWalletOrAttemptToLendMoneyToBuy(price: number): boolean {
  ...
}
...
```
Now the function name mirrors to an extend the behavior of the function, but in a way the function is still a bit wrong. We return a boolean to see if the purchase was accepted, so a better name might have been.
```typescript
...
successfullyPaidFromWalletOrLentMoneyToBuy(price: number): boolean {
  ...
}
...
```
Now in addition to describing what happens inside the function it also matches with the return type of the function.

# Arrays

### [Array Instantiation](#array-instantiation)
For array instantiation you should use the literal syntax instead of `new` constructor.
```typescript
// const items: number[] = new Array(); Don't do this.
const items: number[] = [];
```

### [Array Operations](#array-operations)
For operations on arrays use push etc instead of direct assignment.
```typescript
const items: number[] = [];
// items[items.length] = 14; No, don't do this.
items.push(14);
```

# Functions

### [Expression Vs Declaration](#expression-vs-declaration)
When defining a function we prefer function declaration over function expression, and when dealing with assigned functions we prefer using using an anonymous [arrow function](#arrow-functions) expression.
```typescript
function helloWorld(): void {} // Yes
const helloWorld = function(): Void => {}; // No
const helloWorld = (): void => {}; // No
```
> **Note:** Performance based on numbers from: https://jsperf.com/function-vs-arrow-function/14.

> **Warning:** Declaring a function in a non-function block (if, while etc) has had a history of having different behavior across browsers. It is recommended to assign the function to a variable instead.

### [Don't use Arguments](#dont-use-arguments)
To clarify, your functions can have arguments, but you should never name a parameter `arguments` as this will take precedence over the similarly named object on the function scope, and you don't want to do that.

### [Default Parameters](#default-parameters)
Instead of having mutating function arguments, consider using default parameters.
```typescript
// Worst implementation
function handleThings(opts): void {
  // No! We shouldn't mutate function arguments.
  // Double bad: if opts is falsy it'll be set to an object which may
  // be what you want but it can introduce subtle bugs.
  opts = opts || {};
}

// Not much better
function handleThings(opts): void {
  if(opts === void 0) {
    opts = {};
  }
}

// Correct way

function handleThings(opts = {}): void {

}
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

```typescript

// Silly example, obviously don't do this.
function hepp(a: number, b: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Small improvement
function randomValue(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

// Eureka
function randomNumberBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}
```

### [Class Functions](#class-functions)
Functions defined in class should follow the strict rules of function signatures. In addition to the general rules, class functions require defining the access level of the function.
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

  // Bad function
  change(num: number) {
    this._targetTemperature += num;
    if(this._targetTemperature > this._maximumTemperaturLimit) {
      this._targetTemperature = this._maximumTemperatureLimit;
    }
    else if(this._targetTemperature < this._minimumTemperaturLimit) {
      this._targetTemperature = this._minimumTemperatureLimit;
    }
    return this._targetTemperature;
  }

  // Good function
  public getTargetTemperatureAfterUpdatingTemperatureBy(degrees: number): number {
    this._targetTemperature = getClampedTemperature(this._targetTemperature + degrees);
    return this._targetTemperature;
  }

  private getClampedTemperature(temperature: number): number {
    return temperature > this._maximumTemperatureLimit ? this._maximumTemperatureLimit : degrees < this._minimumTemperatureLimit ? this._minimumTemperatureLimit : temperature;
  }
}

```


# Arrow Functions

### Arrow

# Destructuring

### [When should you use destructuring](#when-should-you-use-destructuring)
You should use destructuring whenever you need to create several temporary references of a complex unit.
```typescript
interface Credentials {
  username: string;
  password: string;
}


// No destructuring, avoid doing this.
function authenticate(credentials: Credentials): boolean {
  const username: string = credentials.username;
  const password: string = credentials.password;

  return this._apiService(username, password);
}

// Getting there!
function authenticate(credentials: Credentials): boolean {
  const { username, password } = credentials;
  return this._apiService(username, password);
}

// And the reward goes to!
function authenticate({ username, password }: Credentials): boolean {
  return this._apiService(username, password);
}
```

You should also use destructuring when working with arrays that have set positions.

```typescript
const arr = [100, 250];

// Don't assign variables from arrays in this way.
// const min = arr[0];
// const max = arr[1];

const [min, max] = arr;
```

### [Scalability with Destructuring](#scalability-with-destructuring)
One of the huge benefits of destructuring is that it scales well when working with multiple return values.
```typescript
...
// Carefully consider when you use array destructuring.
function getBoundingBox(): BoundingBox {
  return [this._left, this._top, this._right, this._bottom];
}
...

// Object destructuring scales a lot better than array destructuring.
function getBoundingBox(): BoundingBox {
  return {
    left: this._left,
    top: this._top,
    right: this._right,
    bottom: this._bottom
  };
}
```
Due to how destructuring works, the latter example scales a lot better. You can add elements to the return statement without breaking the existing calls to the same function. You also do not need to use all of the returned variables.

```typescript
// Select the data you need from a function.
const { top, bottom } = getBoundingBox();

// You can change the base function without breaking the places it is used.
function getBoundingBox(): BoundingBox {
  return {
    visible: this._visible,
    left: this._left,
    top: this._top,
    right: this._right,
    bottom: this._bottom
  };
}

```

# Strings

### [Single Quotes](#single-quotes)
A string variable should be enclosed by single quotes.
```typescript
// const name = "Kane Doe"; No!
const name = 'Kane Doe';
```
> **Note:** Make sure you use `string` and not `String`

### [String Breaks](#string-breaks)
If a string is longer than 80 characters, it should be written across multiple lines using breaks.
```typescript
// Why would you do this towards anyone??
const errorMessage = 'Unable to acquire the correct asset requested. Please make sure you provide the correct identifiers to the requested asset. If this error persists, please make sure to check your internet connection.';

// Yes
const errorMessage = 'Unable to acquire the correct asset requested. Please make \
sure you provide the correct identifiers to the requested asset. If this error \
persists, please make sure to check your internet connection.';
```
### [String Concatenation](#string-concatenation)
Another alternative to using `\` for linebreaks is to use string concatenation.
```typescript
const errorMessage = 'Unable to acquire the correct asset requested. ' +
'Please make sure you provide the correct identifiers to the requested asset. ' +
'If this error persists, please make sure to check your internet connection.'
```
> **Note:** Make sure that you do not overuse string concatenation as it has a noticable impact on performance.

### [String Generation](#string-generation)
For strings that are generated programatically use templates instead of concatenation.
```typescript
function debug(tag:string, message: string) {
  // console.log('Tag: ' + tag + ', message: ' + message); // No!
  // console.log(['Tag: ', tag, ', message: ', message].join()); // No again!
  console.log(`Tag: ${tag}, message: ${message}`); // Yay for templates.
}
```