
export class Point
{
    public x: number;
    public y: number;

    constructor(x: number = 0.0, y: number = 0.0)
    {
        this.x = x;
        this.y = y;
    }

    public add(point: Point): void
    {
        this.x += point.x;
        this.y += point.y;
    }

    public getString(): string
    {
        return "(" + this.x + ", " + this.y + ")";
    }
}
