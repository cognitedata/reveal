
abstract class BaseClass
{
    protected name: string;
    protected number: number;

    protected constructor(name: string)
    {
        this.name = name;
        this.number = 12;
    }

    protected abstract showNameCore(): void;

    public showNumber(): void
    {
        console.log(`BaseClass ${this.number}`);
    }

    public showName(): void
    {
        this.showNameCore();
    }
}

