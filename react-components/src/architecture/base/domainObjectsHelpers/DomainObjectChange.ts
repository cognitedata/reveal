/*!
 * Copyright 2024 Cognite AS
 */

import { equalsIgnoreCaseAndSpace } from '../utilities/extensions/stringExtensions';

export class DomainObjectChange {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _changes: ChangedDescription[] | undefined = undefined;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(change?: symbol | ChangedDescription, fieldName?: string) {
    if (typeof change === 'symbol') {
      this.addChange(change, fieldName);
    }
    if (change instanceof ChangedDescription) {
      this.addChangedDescription(change);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public get isEmpty(): boolean {
    return this._changes === undefined || this._changes.length === 0;
  }

  /**
   * Checks if the domain object has been changed based on the specified changes.
   * @param changes - The changes to check.
   * @returns `true` if any of the specified changes are present in the domain object, `false` otherwise.
   */
  public isChanged(...changes: symbol[]): boolean {
    if (this._changes === undefined) {
      return false;
    }
    for (const change of changes) {
      if (this._changes.some((desc: ChangedDescription) => desc.change === change)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the domain object has been changed based on the specified change and some specific field names.
   * For instance
   * if (isFieldNameChanged(Changes.renderStyle, 'lineWidth', 'lineColor')) {
   *   // Now you have to update the line material only
   * }
   * @param change - The symbol representing the change.
   * @param fieldNames - The field names to compare against the change symbol.
   * @returns A boolean indicating whether the name has changed or not.
   */
  public isFieldNameChanged(change: symbol, ...fieldNames: string[]): boolean {
    // This ignores space and case.
    const fieldName = this.getFieldNameBySymbol(change);
    if (fieldName === undefined) {
      return false;
    }
    for (const otherFieldName of fieldNames) {
      if (equalsIgnoreCaseAndSpace(fieldName, otherFieldName)) {
        return true;
      }
    }
    return false;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getChangedDescription(change: symbol): ChangedDescription | undefined {
    if (this._changes === undefined) {
      return undefined;
    }
    return this._changes.find((desc: ChangedDescription) => desc.change === change);
  }

  private getFieldNameBySymbol(change: symbol): string | undefined {
    const changedDescription = this.getChangedDescription(change);
    return changedDescription === undefined ? undefined : changedDescription.fieldName;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public addChange(change: symbol, fieldName?: string): void {
    if (change !== undefined) {
      this.addChangedDescription(new ChangedDescription(change, fieldName));
    }
  }

  public addChangedDescription(changedDescription: ChangedDescription): void {
    if (this._changes === undefined) {
      this._changes = [];
    }
    this._changes.push(changedDescription);
  }
}

// ==================================================
// LOCAL HELPER CLASS
// ==================================================
export class ChangedDescription {
  public change: symbol;
  public fieldName: string | undefined;

  public constructor(change: symbol, fieldName?: string) {
    this.change = change;
    this.fieldName = fieldName;
  }
}
