
import { Point } from "./Point";

export class SyntaxTests
{
    public static testVariables()
    {
        enum Color { Red = 1, Green, Blue }

        let a: boolean = true;
        let b: number = 6;
        let c: string = "Nils";
        let d: [string, number] = ["Hallo", 5];
        let e: Color = Color.Green;
        const f: number = 7;

        b += 5;
        console.log(a + " " + b + " " + c + " " + d + " " + e + " " + f);
    }
    
    public static testForLoop()
    {
        console.log("Test for loop");
        for (let i: number = 0; i < 10; i++)
            console.log(i);
    }

    public static testArray()
    {
        const array: number[] = [100, 200, 300];
        for (let item in array)
            console.log(array[item]);
    }

    public static testArray2()
    {
        const array: number[] = [100, 200, 300];
        for (let item of array)
            console.log(item);
    }

    public static testArrayTemplate()
    {
        const array = new Array<Point>();
        array.push(new Point(1, 1));
        array.push(new Point(2, 2));
        array.push(new Point(3, 3));

        for (let item of array)
            console.log(item.getString());
    }


    public static testMap()
    {
        let map = new Map();

        map.set("A", 100);
        map.set("B", 200);
        map.set("C", 300);

        console.log(map.get("A"));
        console.log(map.get("B"));
    }

    public static testMapTemplate()
    {
        let map = new Map<string, number>();

        map.set("A", 100);
        map.set("B", 200);
        map.set("C", 300);

        console.log(map.get("A"));  
        console.log(map.get("B"));
    }

    public static testSetTemplate()
    {
        let map = new Set<string>();

        map.add("A");
        map.add("B");
        map.add("C");

        console.log(map.has("A"));
        console.log(map.has("D"));
    }
}

