export type ScheduleParameters = {
  interval: string;
  isPaused?: boolean;
};

export type Schedule = {
  configId?: number;
  requestSchedulerId?: number;
  createdAt?: number;
  interval: string;
  isPaused?: boolean;
};
