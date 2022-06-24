export interface Equipment {
  id: string;
  nodeId: number;
  type: string;
  isBroken: boolean;
}

export interface Room {
  id: string;
  name: string;
  nodeId: number;
  description: string;
  isBookable: boolean;
  type: string;
  equipment: Equipment;
}

export interface Person {
  id: string;
  name: string;
  slackId: string;
  desk: Equipment;
}

export type SearchItem = Room | Person;
