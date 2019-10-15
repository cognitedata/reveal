
class InheritClass extends BaseClass
{
    constructor(name: string)
    {
        super(name);
        this.number = 13;
    }


    // OVERRIDE
    protected showNameCore(): void
    {
        console.log(`InheritClass ${this.name}`);
        // throw new Error("Method not implemented.");
    }
}

