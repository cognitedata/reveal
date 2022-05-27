export class BinaryHeap<T> {
  _content: T[] = [];
  _scoreFunction: (element: T) => number;

  constructor(scoreFunction: (element: T) => number) {
    this._scoreFunction = scoreFunction;
  }

  push(element: T): void {
    // Add the new element to the end of the array.
    this._content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this._content.length - 1);
  }

  pop(): T | undefined {
    // Store the first element so we can return it later.
    const result = this._content[0];
    const end = this._content.pop();

    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this._content.length > 0) {
      this._content[0] = end!;
      this.sinkDown(0);
    }
    return result;
  }

  remove(node: T): void {
    const length = this._content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (let i = 0; i < length; i++) {
      if (this._content[i] !== node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      const end = this._content.pop()!;
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this._content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  }

  size(): number {
    return this._content.length;
  }

  bubbleUp(n: number): void {
    // Fetch the element that has to be moved.
    const element = this._content[n],
      score = this._scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1,
        parent = this._content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this._scoreFunction(parent)) break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this._content[parentN] = element;
      this._content[n] = parent;
      n = parentN;
    }
  }

  sinkDown(n: number): void {
    // Look up the target element and its score.
    const length = this._content.length,
      element = this._content[n],
      elemScore = this._scoreFunction(element);

    let child1Score: number;

    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) * 2,
        child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      let swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this._content[child1N];
        child1Score = this._scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N;

        // Do the same checks for the other child.
        if (child2N < length) {
          const child2 = this._content[child2N],
            child2Score = this._scoreFunction(child2);
          if (child2Score < (swap == null ? elemScore : child1Score)) swap = child2N;
        }
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this._content[n] = this._content[swap];
      this._content[swap] = element;
      n = swap;
    }
  }
}
