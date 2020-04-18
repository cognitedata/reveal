/*!
 * Copyright 2020 Cognite AS
 */

export class Semaphore {
  private queue: ((ready: boolean) => void)[] = [];
  private slotsInUse: number = 0;
  private slotCount: number;

  constructor(slotCount: number = 20) {
    this.slotCount = slotCount;
  }

  async acquire(): Promise<boolean> {
    if (this.slotsInUse < this.slotCount) {
      this.slotsInUse += 1;
      return true;
    }

    const promise = new Promise<boolean>(resolve => {
      this.queue.push(resolve);
    });
    return promise;
  }

  release() {
    this.slotsInUse -= 1;
    const next = this.queue.shift();
    if (next) {
      this.slotsInUse += 1;
      next(true);
    }
  }

  usedSlots() {
    return this.slotsInUse;
  }

  clear() {
    for (const item of this.queue) {
      item(false);
    }
    this.queue = [];
  }
}
