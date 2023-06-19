declare type Options = {
    alias: boolean;
    seconds: boolean;
    allowBlankDay: boolean;
    allowSevenAsSunday: boolean;
};
export declare const isValidCron: (cron: string, options?: Partial<Options> | undefined) => boolean;
export {};
