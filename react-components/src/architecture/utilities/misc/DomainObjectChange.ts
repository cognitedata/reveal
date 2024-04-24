/*!
 * Copyright 2024 Cognite AS
 */

export class DomainObjectChange {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _changes: ChangedDescription[] | undefined = undefined;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(change?: symbol, name?: string) {
    if (change !== undefined) {
      this.add(change, name);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public get isEmpty(): boolean {
    return this._changes === undefined || this._changes.length === 0;
  }

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

  public isNameChanged(change: symbol, ...names: string[]): boolean {
    // This igonores space and case.
    const name = this.getName(change);
    if (name === undefined) {
      return false;
    }

    const isSpace = (s: string): boolean => s === ' ';

    const { length } = name;
    for (const otherName of names) {
      let found = true;
      const otherLength = otherName.length;

      for (let i = 0, j = 0; i < length && found; i++) {
        const a = name.charAt(i);
        if (isSpace(a)) {
          continue;
        }
        const lowerA = a.toLowerCase();
        for (; j < otherLength; j++) {
          const b = otherName.charAt(j);
          if (isSpace(b)) {
            continue;
          }
          const lowerB = b.toLowerCase();
          if (lowerB === lowerA) {
            continue;
          }
          found = false;
          break;
        }
      }
      if (found) {
        return true;
      }
    }
    return false;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  private getChangedDescription(change: symbol): ChangedDescription | undefined {
    if (this._changes === undefined) {
      return undefined;
    }
    return this._changes.find((desc: ChangedDescription) => desc.change === change);
  }

  private getName(change: symbol): string | undefined {
    const changedDescription = this.getChangedDescription(change);
    return changedDescription === undefined ? undefined : changedDescription.name;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public add(change: symbol, name?: string): void {
    if (change === undefined) {
      return;
    }
    if (this._changes === undefined) {
      this._changes = [];
    }
    this._changes.push(new ChangedDescription(change, name));
  }
}

// ==================================================
// LOCAL HELPER CLASS
// ==================================================

class ChangedDescription {
  public change: symbol;
  public name: string | undefined;

  public constructor(change: symbol, name?: string) {
    this.change = change;
    this.name = name;
  }
}
