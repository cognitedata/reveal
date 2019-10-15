
class SyntaxTests
{
    public static makeVariables()
    {
        enum Color { Red = 1, Green, Blue }

        var a: boolean = true;
        var b: number = 6;
        var c: string = "Nils";
        let d: [string, number] = ["Hallo", 5];
        let e: Color = Color.Green;
        const f: number = 7;

        b += 5;
        console.log("" + a + b + c + d + e + f);
    }

    public static makeObject()
    {
        let object = new InheritClass("Hei");
        console.log(object);
        object.showName();
    }

    public static runLoop1()
    {
        for (let i: number = 0; i < 10; i++)
            console.log("for loop executed : " + i);
    }

    public static showLoop2()
    {
        const array: number[] = [10, 65, 73, 26, 44];
        for (let item in array)
            console.log(array[item]);
    }

    public static showLoop3()
    {
        const array: number[] = [10, 65, 73, 26, 44];
        for (let item in array)
            console.log(item);
    }

    public static showLoop4()
    {
        const array: Array<number> = new Array<number>();
        array.push(1);
        array.push(2);
        array.push(4);

        for (let item in array)
            console.log(item);
    }

    public static showLoop5() {

        //let map = new Map();

        //map.set("A", 1);
        //map.set("B", 2);
        //map.set("C", 3);

        //console.log(map.get("John"));
    }
}




var a2: number = 5555;


function Add(x: number, y: number): number 
{
    return x + y;
}

