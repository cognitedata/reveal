import { equalsIgnoreCaseAndSpace } from '../utilities/extensions/stringUtils';

export class ChangedDescription {
  public change: symbol;
  public fieldName: string | undefined;

  public constructor(change: symbol, fieldName?: string) {
    this.change = change;
    this.fieldName = fieldName;
  }

  public isChanged(fieldName: string): boolean {
    if (this.fieldName === undefined) {
      return false;
    }
    return equalsIgnoreCaseAndSpace(this.fieldName, fieldName);
  }
}
