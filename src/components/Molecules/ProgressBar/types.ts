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
  progress: ProgressType[];
  total: number;
}
