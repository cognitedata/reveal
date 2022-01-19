//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

/* eslint-disable max-classes-per-file */

import { BaseNode } from "@/Core/Nodes/BaseNode";

export class NodeEventArgs {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private changes: ChangedDescription[] | null = null;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(changed: symbol, name?: string) {
    this.add(changed, name);
  }

  //= =================================================
  // INSTANCE METHODS: Requests
  //= =================================================

  public get isEmpty(): boolean { return this.changes === null || this.changes.length === 0; }

  public isChanged(...changes: symbol[]): boolean {
    if (!this.changes)
      return false;
    for (const changed of changes)
      if (this.changes.some((desc: ChangedDescription) => desc.changed === changed))
        return true;
    return false;
  }

  public isNameChanged(changed: symbol, ...names: string[]): boolean {
    // This igonores space and case.
    const name = this.getName(changed);
    if (!name)
      return false;

    const isUpperCase = (s: string) => /[A-Z]/.test(s);
    const isSpace = (s: string) => s === " ";

    const { length } = name;
    for (const otherName of names) {
      let found = true;
      const otherLength = otherName.length;

      for (let i = 0, j = 0; i < length && found; i++) {
        let a = name.charAt(i);
        if (isSpace(a))
          continue;

        if (isUpperCase(a))
          a = a.toLowerCase();

        for (; j < otherLength;) {
          let b = otherName.charAt(j);
          j += 1;
          if (isSpace(b))
            continue;

          if (isUpperCase(b))
            b = b.toLowerCase();
          if (b !== a)
            found = false;
          break;
        }
      }
      if (found)
        return true;
    }
    return false;
  }

  //= =================================================
  // INSTANCE METHODS: Getters
  //= =================================================

  private getChangedDescription(changed: symbol): ChangedDescription | undefined {
    if (!this.changes)
      return undefined;
    if (this.changes.length === 1) // optimalization
      return this.changes[0].changed === changed ? this.changes[0] : undefined;
    return this.changes.find((desc: ChangedDescription) => desc.changed === changed);
  }

  private getName(changed: symbol): string | undefined {
    const changedDescription = this.getChangedDescription(changed);
    return changedDescription ? changedDescription.name : undefined;
  }

  public getOrigin(changed: symbol): BaseNode | null {
    const changedDescription = this.getChangedDescription(changed);
    return changedDescription ? changedDescription.origin : null;
  }

  //= =================================================
  // INSTANCE METHODS: Operations
  //= =================================================

  public add(changed: symbol, name?: string) {
    if (changed === undefined)
      return;
    if (!this.changes)
      this.changes = [];

    this.changes.push(new ChangedDescription(changed, name));
  }
}

//= =================================================
// LOCAL HELPER CLASS
//= =================================================

class ChangedDescription {
  public changed: symbol;

  public name: string | undefined;

  public origin: BaseNode | null;

  public constructor(changed: symbol, name?: string, origin: BaseNode | null = null) {
    this.changed = changed;
    this.name = name;
    this.origin = origin;
  }
}
