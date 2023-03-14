import { TopKHeap } from './heap';

describe('Heap', () => {
  it('should be able to push and pop', () => {
    const heap = new TopKHeap(6);

    heap.push(5, 0.5);
    expect(heap.pop()).toBe(5);

    heap.push(3, 0.5);
    heap.push(2, 0.7);
    heap.push(4, 0.1);
    heap.push(5, 0.2);
    expect(heap.pop()).toBe(4);
    heap.push(1, 0.3);
    heap.push(7, 0.4);
    heap.push(8, 0.9);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(7);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(8);
  });

  it('should order by id when priority is equal', () => {
    const heap = new TopKHeap(7);
    heap.push(3, 0.5);
    heap.push(2, 0.5);
    heap.push(1, 0.5);
    heap.push(5, 0.5);
    heap.push(4, 0.5);
    heap.push(6, 0.5);
    heap.push(7, 0.5);
    expect(heap.pop()).toBe(7);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(4);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(1);
  });

  it('should not have more than k entries', () => {
    const heap = new TopKHeap(3);

    heap.push(3, 0.5);
    expect(heap).toHaveLength(1);
    heap.push(2, 0.7);
    expect(heap).toHaveLength(2);
    heap.push(4, 0.1);
    expect(heap).toHaveLength(3);
    heap.push(5, 0.2);
    heap.push(1, 0.3);
    heap.push(7, 0.4);
    heap.push(8, 0.9);
    expect(heap).toHaveLength(3);

    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(8);
  });
});
