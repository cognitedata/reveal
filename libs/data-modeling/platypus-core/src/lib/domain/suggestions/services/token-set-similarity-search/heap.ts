/**
 * Simple heap that keep the k elements with highest priority
 * and pop the element with lowest priority.
 */
export class TopKHeap {
  private ids: Float64Array;
  private priorities: Float64Array;
  private _length: number;
  private _k: number;

  constructor(k: number) {
    this.ids = new Float64Array(k);
    this.priorities = new Float64Array(k);
    this._length = 0;
    this._k = k;
  }

  get length(): number {
    return this._length;
  }

  push(id: number, priority: number) {
    if (this._length === this._k) {
      if (
        priority > this.peekPriority() ||
        (priority === this.peekPriority() && id < this.peek())
      ) {
        this.pop();
      } else {
        return;
      }
    }

    let i = this._length;
    this._length++;

    while (i > 0) {
      const parent = (i - 1) >> 1;
      const parentPriority = this.priorities[parent];
      if (
        priority > parentPriority ||
        (priority === parentPriority && id < this.ids[parent])
      ) {
        break;
      }
      this.ids[i] = this.ids[parent];
      this.priorities[i] = parentPriority;
      i = parent;
    }

    this.ids[i] = id;
    this.priorities[i] = priority;
  }

  pop(): number {
    if (this._length === 0) {
      throw new Error('Heap is empty');
    }

    const top = this.ids[0];
    this._length--;

    if (this._length > 0) {
      const id = this.ids[this._length];
      const priority = this.priorities[this._length];
      let i = 0;

      while (i < this._length >> 1) {
        const left = (i << 1) + 1;
        const right = left + 1;

        const lowestChild =
          right >= this._length ||
          this.priorities[left] < this.priorities[right] ||
          (this.priorities[left] === this.priorities[right] &&
            this.ids[left] > this.ids[right])
            ? left
            : right;

        if (
          this.priorities[lowestChild] < priority ||
          (this.priorities[lowestChild] == priority &&
            this.ids[lowestChild] > id)
        ) {
          this.ids[i] = this.ids[lowestChild];
          this.priorities[i] = this.priorities[lowestChild];
          i = lowestChild;
        } else {
          break;
        }
      }

      this.ids[i] = id;
      this.priorities[i] = priority;
    }

    return top;
  }

  peek(): number {
    if (this._length === 0) {
      throw new Error('Heap is empty');
    }
    return this.ids[0];
  }

  peekPriority(): number {
    if (this._length === 0) {
      throw new Error('Heap is empty');
    }
    return this.priorities[0];
  }

  clear() {
    this._length = 0;
  }
}
