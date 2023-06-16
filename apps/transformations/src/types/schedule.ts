export type Schedule = {
  id: number;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  interval: string;
  isPaused: boolean;
};

export type ManifestSchedule = {
  interval: string;
  isPaused: boolean;
};
