import { NewConfiguration } from 'typings/interfaces';

export enum ConfigUIState {
  INITIAL,
  CONFIGURING,
  CONFIRMED,
  ERROR,
}

export enum ChangeType {
  REPO,
  PROJECT,
  TAGS,
  DATATYPES,
  DATASTATUS,
}

export enum Origin {
  SOURCE,
  TARGET,
}

export interface CommonOriginProps {
  configuration: NewConfiguration;
  targetUIState: ConfigUIState;
  onUiStateChange: (origin: Origin, nextState: ConfigUIState) => void;

  handleChange: (type: ChangeType, value: any) => void;
}
