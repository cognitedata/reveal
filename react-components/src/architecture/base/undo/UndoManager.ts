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

  public addTransaction(transaction?: Transaction): void {
    if (transaction === undefined) {
      return;
    }
    this._transactions.push(transaction);
  }

  public undo(renderTarget: RevealRenderTarget): boolean {
    if (this._transactions.length === 0) {
      return false;
    }
    const transaction = this._transactions.pop();
    if (transaction === undefined) throw new Error('Transaction is undefined');

    return transaction.undo(renderTarget);
  }

  public get canUndo(): boolean {
    return this._transactions.length > 0;
  }
}
