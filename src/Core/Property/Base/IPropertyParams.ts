import { Action, IsEnabled, StringAction, ValidateOption } from "@/Core/Property/Base/ValueProperty";

export default interface IPropertyParams<T>
{
  name: string;
  fieldName?: string;
  toolTip?: string;
  instance?: object; // Either this is set
  value?: T; // Or this
  readonly?: boolean;
  options?: object; // needs this so that options would accept an enum at the runtime
  use?: boolean;

  // Delegates
  applyDelegate?: Action;
  applyByFieldNameDelegate?: StringAction;
  isEnabledDelegate?: IsEnabled;
  optionValidationDelegate?: ValidateOption;
  // eslint-disable-next-line semi
}
