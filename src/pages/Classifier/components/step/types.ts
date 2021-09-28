export enum ClassifierState {
  MANAGE = 'manage',
  TRAIN = 'train',
  DEPLOY = 'deploy',
  COMPLETE = 'complete',
}
export interface StepProps {
  title: string;
  subtitle?: string;
  subtitleStyle?: 'plain-text' | 'badge';
  nextText: string;
}
