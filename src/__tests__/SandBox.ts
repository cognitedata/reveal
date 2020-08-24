//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

// tslint:disable: no-console

const symbol = Symbol("Nils Petter");
console.log(symbol);
console.log(symbol.toString());

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

export function globalFunction(x: number, y: number): number
{
  return x + y;
}

export class SyntaxTests
{
  public static testVariables()
  {
    const a: boolean = true;
    let b: number = 6;
    const c: string = "Nils";
    const d: [string, number] = ["Hallo", 5];
    const f: number = 7;

    b += 5;
    console.log(`${a} ${b} ${c} ${d} ${f}`);
  }

  public static testForLoop()
  {
    console.log("Test for loop");
    for (let i: number = 0; i < 10; i++)
      console.log(i);
  }

  public static testArray2()
  {
    const array: number[] = [100, 200, 300];
    for (const item of array)
      console.log(item);
  }

  public static testMap()
  {
    const map = new Map();

    map.set("A", 100);
    map.set("B", 200);
    map.set("C", 300);

    console.log(map.get("A"));
    console.log(map.get("B"));
  }

  public static testMapTemplate()
  {
    const map = new Map<string, number>();

    map.set("A", 100);
    map.set("B", 200);
    map.set("C", 300);

    console.log(map.get("A"));
    console.log(map.get("B"));
  }

  public static testSetTemplate()
  {
    const map = new Set<string>();

    map.add("A");
    map.add("B");
    map.add("C");

    console.log(map.has("A"));
    console.log(map.has("D"));
  }


  static async hei(): Promise<string>
  {
    console.log("In hei");
    return "Return hei";
  }

  static async hopp(): Promise<string>
  {
    console.log("In hopp");
    return "Return hopp";
  }

  public static testAsync()
  {
    console.log("Start asyncsss");
    (async () =>
    {
      const dummyFunc = async () => 
      {
        console.log("In dummy");
      };
      await dummyFunc();

      console.log("Calling hei");
      const a = await this.hei();
      console.log(a);

      console.log("Calling hopp");
      const b = await this.hopp();
      console.log(b);

      console.log("Calling hei once more");
      const c = await this.hei();
      console.log(c);

      console.log("Calling hopp once more");
      const d = await this.hopp();
      console.log(d);

      console.log("Calling async anonym");
      for (let i = 0; i < 10; i++)
      {
        const func = async () => 
        {
          console.log(`Anonym ${i.toString()}`);
          return `Anonym ${i.toString()}`;
        };
        // eslint-disable-next-line no-await-in-loop
        const funcResult = await func();
        console.log(funcResult);
      }
    })();
    console.log("End async");
  }
}
