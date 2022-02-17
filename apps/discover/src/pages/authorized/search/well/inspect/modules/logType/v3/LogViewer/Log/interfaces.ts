export type Tuplet = [number, number];

export type LogData = {
  [columnExternalId: string]: {
    measurementType: string;
    values: Tuplet[] | number[];
    unit: string;
    domain: number[];
  };
};

export type EventData = (string | number)[] | (number | null)[];
