import {
  IsEnabled,
  StringAction,
  ValidateOption,
} from '../Property/Base/ValueProperty';

export interface IPropertyParams<T> {
  name: string;
  toolTip?: string;
  instance?: object; // Either this is set
  value?: T; // Or this
  readonly?: boolean;
  options?: object; // needs this so that options would accept an enum at the runtime
  use?: boolean;

  // Delegates
  applyDelegate?: StringAction;
  isEnabledDelegate?: IsEnabled;
  optionValidationDelegate?: ValidateOption;
  // eslint-disable-next-line semi
}
