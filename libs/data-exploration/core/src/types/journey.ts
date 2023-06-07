import { ResourceType } from './resource';

export type JourneyItem = {
  type?: ResourceType;
  id: number;
};

export type Journey = JourneyItem[] | undefined;
