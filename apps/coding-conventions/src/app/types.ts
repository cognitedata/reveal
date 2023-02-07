type UID = string;
export type TagTypes = 'Range' | 'Regex' | 'Abbreviation';
export type SystemTypes = 'files' | 'assets';
export type TagDefinitions = TagHardcoded | TagRange | TagRegex;

export type System = {
  id: UID;
  title: string;
  type: SystemTypes;
  subtitle?: string;
  structure?: string;
  conventions: Convention[];
};

export type Convention = {
  id: UID;
  keyword: string; // NN
  range: {
    start: number;
    end: number;
  };
  optional?: boolean;
  name?: string; // System
  definitions?: TagDefinitions[];
  dependency?: UID;
};

export type Common = {
  id: UID;
  description: string;
  type: TagTypes;
  optional?: boolean;
  dependsOn?: UID;
};

export type TagHardcoded = Common & {
  key: string;
};

export type TagRange = Common & {
  value: [number, number];
  minimumCharacterLength?: number; // used for padding with 0s
};

export type TagRegex = Common & {
  regex: string;
};
