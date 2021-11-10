export enum NodeTypes {
  SOURCE = 'CalculationInput',
  FUNCTION = 'ToolboxFunction',
  CONSTANT = 'Constant',
  OUTPUT = 'CalculationOutput',
}

export type SourceOption = {
  type: 'timeseries' | 'workflow';
  color: string;
  label: string;
  value: string;
};
