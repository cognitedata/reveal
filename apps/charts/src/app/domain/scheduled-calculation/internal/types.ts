import { OptionType } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

export type ScheduleCalculationFieldValues = {
  name: string;
  clientId: string;
  clientSecret: string;
  cdfCredsMode: 'USER_CREDS' | 'CLIENT_SECRET';
  period: number;
  periodType: OptionType<string>;
  unit?: OptionType<string>;
  description?: string;
  dataset?: DataSet;
};

export type ScheduledCalculationModalProps = {
  onClose: () => void;
  workflowId: string;
};

export type StepInfo = {
  currentStep: number;
  loading: boolean;
};
