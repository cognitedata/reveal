export type TagPartType = 'Range' | 'Regex' | 'Hardcoded';

export type Tagpart = {
  name: string;
  tagDefinition: string;
  selectionRange: { start: number; end: number };
  definitions: TagSubPart[];
};

export type TagSubPart =
  | TagSubPartHardcoded
  | TagSubPartRange
  | TagSubPartRegex;

export type TagSubPartBase = {
  description: string;
  type: TagPartType;
  optional: boolean;
  dependencies: string[];
};

export type TagSubPartHardcoded = TagSubPartBase & {
  keyToMatch: string;
};

export type TagSubPartRange = TagSubPartBase & {
  minValue: number;
  maxValue: number;
  minimumCharacterLength: number; // used for padding with 0s
};

export type TagSubPartRegex = TagSubPartBase & {
  regexToMatch: string;
};

// --- Tag (Overall tag information)
// list of tag parts, each pointing to a part of the tag
// each tag part has a list of definitions
// of which there are 3 types: hardcoded, range, regex
