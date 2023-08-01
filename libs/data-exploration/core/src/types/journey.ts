import { ResourceType } from './resource';

export type JourneyItem = {
  type?: ResourceType;
  id: number;
  selectedTab?: string;
  initialTab?: string;
};

export type Journey = JourneyItem[] | undefined;
