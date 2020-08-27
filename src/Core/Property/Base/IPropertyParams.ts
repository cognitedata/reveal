import { Action, IsEnabled, StringAction, ValidateOption } from "@/Core/Property/Base/ValueProperty";

export default interface IPropertyParams<T>
{
  name: string;
  toolTip?: string;
  instance?: object; // Either this is set
  value?: T; // Or this
  readonly?: boolean;
  options?: object; // needs this so that options would accept an enum at the runtime
  use?: boolean;

  // Delegates
  apply?: Action;
  applyByFieldNameDelegate?: StringAction;
  isEnabled?: IsEnabled;
  optionValidationDelegate?: ValidateOption;
  // eslint-disable-next-line semi
}
