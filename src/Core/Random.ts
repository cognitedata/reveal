

export class Random
{
    //==================================================
    // STATIC METHODS: 
    //==================================================

    static getInt(min: number, max: number): number
    {
        return Math.round(Random.getFloat(min, max));
    }

    static getFloat(min: number, max: number): number
    {
        return min + Math.random() * (max - min);
    }

    static get isTrue(): boolean
    {
        return Math.random() > 0.5;
    }
}

