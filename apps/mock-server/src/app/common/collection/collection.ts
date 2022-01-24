/* eslint-disable @typescript-eslint/no-explicit-any */
import { equal, isObj, keyComparer, negate } from './collection-helpers';
import { Aggregator, ICollectionGroup, Predicate, Selector } from './types';

export class Collection<T> {
  protected _elements: T[];

  constructor(elements: T[] = []) {
    this._elements = elements;
  }

  /**
   * Adds an object to the end of the Collection<T>.
   */
  static from<T>(elements: T[]): Collection<T> {
    return new Collection<T>(elements);
  }

  /**
   * Add an object to the end of the Collection<T>.
   * @param element Object to add in the collection
   */
  add(element: T): void {
    this._elements.push(element);
  }

  /**
   * Adds the elements of the specified collection to the end of the Collection<T>.
   * @param elements Elements to add
   */
  addRange(elements: T[]): void {
    this._elements.push(...elements);
  }

  /**
   * Applies an accumulator function over a sequence.
   * @param aggregator - function that will be used for aggregation
   * @param initialValue - initial value
   */
  aggregate<U>(aggregator: Aggregator<U, T>, initialValue?: U): any {
    // eslint-disable-next-line
    // @ts-ignore
    return this._elements.reduce(aggregator, initialValue);
  }

  /**
   * Determines whether all elements of a sequence satisfy a condition.
   * @param predicate - function that will be used for aggregation
   */
  all(predicate: Predicate<T>): boolean {
    return this._elements.every(predicate);
  }

  /**
   * Filters a sequence of values based on a predicate.
   * @param predicate - function that returns bool
   */
  andWhere(predicate: Predicate<T>): Collection<T> {
    return this.where(predicate);
  }

  /**
   * Determines whether a sequence contains any elements.
   */
  any(): boolean;
  any(predicate?: Predicate<T>): boolean {
    return predicate
      ? this._elements.some(predicate)
      : this._elements.length > 0;
  }

  /**
   * Casts the elements of a sequence to the specified type.
   */
  cast<U>(): Collection<U> {
    return new Collection<U>(this._elements as any);
  }

  /**
   * Concatenates two collections.
   * @param collection - collection to concatanate
   */
  concat(collection: Collection<T>): Collection<T> {
    return new Collection<T>(this._elements.concat(collection.toArray()));
  }

  /**
   * Determines whether an element is in the Collection<T>.
   * @param element
   */
  contains(element: T): boolean {
    return this._elements.some((x) => x === element);
  }

  /**
   * Returns the number of elements in a sequence.
   */
  count(): number;
  count(predicate: Predicate<T>): number;
  count(predicate?: Predicate<T>): number {
    return predicate ? this.where(predicate).count() : this._elements.length;
  }

  /**
   * Returns distinct elements from a sequence by using the default equality comparer to compare values.
   */
  distinct(): Collection<T> {
    return this.where(
      (value, index, iter: any) =>
        (isObj(value)
          ? iter.findIndex((obj: any) => equal(obj, value))
          : iter.indexOf(value)) === index
    );
  }

  /**
   * Returns distinct elements from a sequence according to specified key selector.
   * @param keySelector
   */
  distinctBy(keySelector: (key: T) => string | number): Collection<T> {
    const groups = this.groupBy(keySelector);
    return Object.keys(groups).reduce((res, key) => {
      res.add(groups[key][0]);
      return res;
    }, new Collection<T>());
  }

  /**
   * Returns the element at a specified index in a sequence.
   * @param index
   */
  elementAt(index: number): T {
    if (index < this.count() && index >= 0) {
      return this._elements[index];
    } else {
      const msg =
        'ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.';
      throw new Error(msg);
    }
  }

  /**
   * Produces the set difference of two sequences by using the default equality comparer to compare values.
   */
  except(source: Collection<T>): Collection<T> {
    return this.where((x: any) => !source.contains(x));
  }

  /**
   * Returns the first element of a sequence.
   */
  first(): T;
  first(predicate: Predicate<T>): T;
  first(predicate?: Predicate<T>): T {
    if (this.count()) {
      return predicate ? this.where(predicate).first() : this._elements[0];
    } else {
      throw new Error(
        'InvalidOperationException: The source sequence is empty.'
      );
    }
  }

  /**
   * Performs the specified action on each element of the Collection<T>.
   */
  forEach(action: (value?: T, index?: number, collection?: T[]) => any): void {
    return this._elements.forEach(action);
  }

  /**
   * Groups the elements of a sequence according to a specified key selector function.
   */
  groupBy<TResult = T>(
    grouper: (key: T) => string | number,
    mapper?: (element: T) => TResult
  ): ICollectionGroup<TResult> {
    const initialValue: ICollectionGroup<TResult> = {};
    if (!mapper) {
      mapper = (val) => val as any as TResult;
    }
    return this.aggregate((ac, v: any) => {
      const key = grouper(v);
      const existingGroup = ac[key];
      // eslint-disable-next-line
      // @ts-ignore
      const mappedValue = mapper(v);
      if (existingGroup) {
        existingGroup.push(mappedValue);
      } else {
        ac[key] = [mappedValue];
      }
      return ac;
    }, initialValue);
  }

  /**
   * Returns the index of the first occurence of an element in the List.
   */
  indexOf(element: T): number {
    return this._elements.indexOf(element);
  }

  /**
   * Inserts an element into the Collection<T> at the specified index.
   */
  insert(index: number, element: T): void | Error {
    if (index < 0 || index > this._elements.length) {
      throw new Error('Index is out of range.');
    }

    this._elements.splice(index, 0, element);
  }

  /**
   * Produces the set intersection of two sequences by using the default equality comparer to compare values.
   */
  intersect(source: Collection<T>): Collection<T> {
    return this.where((x: any) => source.contains(x));
  }

  /**
   * Correlates the elements of two sequences based on matching keys. The default equality comparer is used to compare keys.
   */
  join<U>(
    list: Collection<U>,
    key1: (key: T) => any,
    key2: (key: U) => any,
    result: (first: T, second: U) => any
  ): Collection<any> {
    return this.selectMany((x) =>
      list.where((y: any) => key2(y) === key1(x)).select((z) => result(x, z))
    );
  }

  /**
   * Returns the last element of a sequence.
   */
  last(): T;
  last(predicate: Predicate<T>): T;
  last(predicate?: Predicate<T>): T {
    if (this.count()) {
      return predicate
        ? this.where(predicate).last()
        : this._elements[this.count() - 1];
    } else {
      throw Error('InvalidOperationException: The source sequence is empty.');
    }
  }

  /**
   * Returns a specified number of contiguous elements from the start of a sequence.
   */
  limit(amount: number): Collection<T> {
    return new Collection<T>(this._elements.slice(0, Math.max(0, amount)));
  }

  /**
   * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
   */
  offset(amount: number): Collection<T> {
    return new Collection<T>(this._elements.slice(Math.max(0, amount)));
  }

  /**
   * Sorts the elements of a sequence in ascending order according to a key.
   */
  orderBy(
    property: (key: T) => any,
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Collection<T> {
    const comparer =
      direction === 'ASC'
        ? keyComparer(property, false)
        : keyComparer(property, true);
    return new Collection<T>(this._elements.sort(comparer));
  }

  /**
   * Removes the first occurrence of a specific object from the List<T>.
   */
  remove(element: T): boolean {
    // eslint-disable-next-line lodash/prefer-includes
    return this.indexOf(element) !== -1
      ? (this.removeAt(this.indexOf(element)), true)
      : false;
  }

  /**
   * Removes all the elements that match the conditions defined by the specified predicate.
   */
  removeAll(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): Collection<T> {
    return this.where(negate(predicate));
  }

  /**
   * Removes the element at the specified index of the List<T>.
   */
  removeAt(index: number): void {
    this._elements.splice(index, 1);
  }

  /**
   * Reverses the order of the elements in the entire List<T>.
   */
  reverse(): Collection<T> {
    return new Collection<T>(this._elements.reverse());
  }

  /**
   * Projects each element of a sequence into a new form.
   */
  select<TOut>(selector: Selector<T, TOut>): Collection<TOut> {
    return new Collection<TOut>(this._elements.map(selector));
  }

  /**
   * Projects each element of a sequence to a List<any> and flattens the resulting sequences into one sequence.
   */
  selectMany<TOut extends Collection<any>>(selector: Selector<T, TOut>): TOut {
    return this.aggregate(
      (ac, _, i: any) => (
        ac.addRange(this.select(selector).elementAt(i).toArray()), ac
      ),
      new Collection<TOut>()
    );
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   */
  thenBy(
    property: (key: T) => any,
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Collection<T> {
    return this.orderBy(property, direction);
  }

  /**
   * Copies the elements of the Collection<T> to a new array.
   */
  toArray(): T[] {
    return this._elements;
  }

  /**
   * Creates a Collection<T> from an Enumerable.List<T>.
   */
  toCollection(): Collection<T> {
    return this;
  }

  /**
   * Creates a Lookup<TKey, TElement> from an IEnumerable<T> according to specified key selector and element selector functions.
   */
  toLookup<TResult>(
    keySelector: (key: T) => string | number,
    elementSelector: (element: T) => TResult
  ): ICollectionGroup<TResult> {
    return this.groupBy(keySelector, elementSelector);
  }

  /**
   * Filters a sequence of values based on a predicate.
   * @param predicate - function that returns bool
   */
  where(predicate: Predicate<T>): Collection<T> {
    return new Collection<T>(this._elements.filter(predicate));
  }

  /**
   * Produces the set union of two sequences by using the default equality comparer.
   */
  union(collection: Collection<T>): Collection<T> {
    return this.concat(collection).distinct();
  }
}
