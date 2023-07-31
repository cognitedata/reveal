export interface ValueProps {
  color: string;
  percentage: number;
}

export interface ProgressType {
  label: string;
  value: number;
  color: string;
}

export interface ProgressBarProps {
  name: string;
  totalProgress?: ProgressType[];
  progress: ProgressType[];
  total: number;
}
