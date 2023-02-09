type UID = string;
export type TagTypes = 'Range' | 'Regex' | 'Abbreviation';
export type TagDefinitions = TagAbbreviation | TagRange | TagRegex;

export type Resource = 'files' | 'assets';

export type System = {
  id: UID;
  title: string;
  resource: Resource;
  description?: string;
  structure: string;
  conventions: Convention[];
  updatedAt?: Date;
};

export type Convention = {
  id: UID;
  keyword: string; // NN
  start: number;
  end: number;
  optional?: boolean;
  name?: string; // System
  definitions?: TagDefinitions[];
  dependency?: UID;
  updatedAt?: Date;
  systemId: string;
};

export type Common = {
  id: UID;
  description: string;
  type: TagTypes;
  optional?: boolean;
  dependsOn?: UID;
};

export type TagAbbreviation = Common & {
  key: string;
};

export type TagRange = Common & {
  value: [number, number];
  minimumCharacterLength?: number; // used for padding with 0s
};

export type TagRegex = Common & {
  regex: string;
};
