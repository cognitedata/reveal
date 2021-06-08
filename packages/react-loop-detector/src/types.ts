export type MountRecord = {
  timestamp: number;
};

export type LoopContext = {
  onLoopExit: () => void;
  records: MountRecord[];
};
