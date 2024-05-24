/*!
 * Copyright 2024 Cognite AS
 */

export class Index2 {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public i: number;
  public j: number;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(i?: number, j?: number) {
    this.i = i ?? 0;
    this.j = j ?? this.i;
  }

  public clone(): Index2 {
    return new Index2(this.i, this.j);
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get size(): number {
    return this.i * this.j;
  }

  public get isZero(): boolean {
    return this.i === 0 && this.j === 0;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getAt(dimension: number): number {
    switch (dimension) {
      case 0:
        return this.i;
      case 1:
        return this.j;
      default:
        return Number.NaN;
    }
  }

  public toString(): string {
    return `(${this.i}, ${this.j})`;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public copy(value: Index2): this {
    this.i = value.i;
    this.j = value.j;
    return this;
  }

  public add(value: Index2): this {
    this.i += value.i;
    this.j += value.j;
    return this;
  }

  public sub(value: Index2): this {
    this.i -= value.i;
    this.j -= value.j;
    return this;
  }
}
