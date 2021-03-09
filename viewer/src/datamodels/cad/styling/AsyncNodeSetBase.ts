/*!
 * Copyright 2021 Cognite AS
 */
import { ListResponse } from '@cognite/sdk';

import { NodeSet } from './NodeSet';

/**
 * Base class for NodeSets that are populated asynchronously.
 */
export abstract class AsyncNodeSetBase extends NodeSet {
  private _lastStartedQueryId = 0;
  private _lastCompletedQueryId = 0;

  get isLoading(): boolean {
    return this._lastCompletedQueryId !== this._lastStartedQueryId;
  }

  protected startQuery(): number {
    return ++this._lastStartedQueryId;
  }

  protected isLastStartedQuery(queryId: number): boolean {
    return queryId === this._lastStartedQueryId;
  }

  protected completeQuery(queryId: number) {
    this._lastCompletedQueryId = Math.max(this._lastCompletedQueryId, queryId);
    return this._lastCompletedQueryId === queryId;
  }

  protected async pageResults<T>(
    queryId: number,
    request: ListResponse<T[]>,
    itemVisitor: (item: T) => void
  ): Promise<void> {
    while (this.isLastStartedQuery(queryId)) {
      const nextRequest = request.next ? request.next() : undefined;
      request.items.forEach(itemVisitor);

      if (nextRequest) {
        this.notifyChanged();
        request = await nextRequest;
      } else {
        break;
      }
    }

    if (this.completeQuery(queryId)) {
      this.notifyChanged();
    }
  }
}
