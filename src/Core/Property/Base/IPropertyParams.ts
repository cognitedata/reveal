import { Action, IsEnabled, StringAction } from "@/Core/Property/Base/UseProperty";

export default interface IPropertyParams<T>
{
  name: string;
  toolTip?: string;
  instance?: object; // Either this is set
  value?: T; // Or this
  readonly?: boolean;
  apply?: Action;
  applyByFieldName?: StringAction;
  isEnabled?: IsEnabled;
  options?: T[];
  use?:boolean;
  // eslint-disable-next-line semi
}