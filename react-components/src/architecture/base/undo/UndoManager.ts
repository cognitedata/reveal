/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type Transaction } from './Transaction';

export class UndoManager {
  private readonly _transactions: Transaction[] = [];

  // ==================================================
  // INSTANCE METHODS
  // =================================================

  public addTransaction(transaction: Transaction | undefined): void {
    if (transaction === undefined) {
      return;
    }
    this._transactions.push(transaction);
  }

  public undo(renderTarget: RevealRenderTarget): boolean {
    if (this._transactions.length === 0) {
      return false;
    }
    let transaction = this._transactions.pop();
    if (transaction === undefined) {
      throw new Error('Transaction is undefined');
    }
    let isChanged = transaction.undo(renderTarget);
    let timeStamp = transaction.timeStamp;

    // Undo all transactions that happened within 500ms of the last transaction
    for (let i = this._transactions.length - 1; i >= 0; i--) {
      const deltaTime = Math.abs(this._transactions[i].timeStamp - timeStamp);
      if (deltaTime > 500) {
        break;
      }
      transaction = this._transactions.pop();
      if (transaction === undefined) {
        throw new Error('Transaction is undefined');
      }
      timeStamp = transaction.timeStamp;
      if (transaction.undo(renderTarget)) {
        isChanged = true;
      }
    }
    return isChanged;
  }

  public get canUndo(): boolean {
    return this._transactions.length > 0;
  }

  public hasUniqueId(uniqueId: number): boolean {
    return this._transactions.find((a) => a.uniqueId === uniqueId) !== undefined;
  }
}
