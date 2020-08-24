import { Action, IsEnabled, StringAction, GetOptionIcon } from "@/Core/Property/Base/UseProperty";

export default interface IPropertyParams<T>
{
  name: string;
  toolTip?: string;
  instance?: object; // Either this is set
  value?: T; // Or this
  readonly?: boolean;
  options?: T[];
  use?: boolean;

  // Delegates
  apply?: Action;
  applyByFieldNameDelegate?: StringAction;
  isEnabled?: IsEnabled;
  getOptionIconDelegate?: GetOptionIcon;
  // eslint-disable-next-line semi
}