/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '@reveal/360-images';

export class Image360History {
  private readonly _history: Image360Entity[] = [];
  private _currentIndex: number = -1;

  private isLegalIndex(index: number): boolean {
    return index >= 0 && index < this._history.length;
  }

  public start(history: Image360Entity): void {
    if (this.isLegalIndex(this._currentIndex + 1)) {
      this._history.slice(this._currentIndex + 1);
    }
    this._history.push(history);
    this._currentIndex = this._history.length - 1;
  }

  public forward(): Image360Entity | undefined {
    const currentIndex = this._currentIndex + 1;
    if (!this.isLegalIndex(currentIndex)) {
      return undefined;
    }
    this._currentIndex = currentIndex;
    return this.current();
  }

  public backward(): Image360Entity | undefined {
    const currentIndex = this._currentIndex - 1;
    if (!this.isLegalIndex(currentIndex)) {
      return undefined;
    }
    this._currentIndex = currentIndex;
    return this.current();
  }

  public clear(): void {
    this._history.splice(0, this._history.length);
    this._currentIndex = -1;
  }

  public current(): Image360Entity | undefined {
    if (!this.isLegalIndex(this._currentIndex)) {
      return undefined;
    }
    return this._history[this._currentIndex];
  }
}
