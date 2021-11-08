export class Result<T> {
  isSuccess: boolean;
  isFailure: boolean;
  error: T | string | any;
  private _value: T;

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  static fail<U>(error: any): Result<U> {
    return new Result<U>(false, error);
  }

  constructor(isSuccess: boolean, error?: T | string | any, value?: T) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: A result cannot be successful and contain an error'
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        'InvalidOperation: A failing result needs to contain an error message'
      );
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value as T;

    Object.freeze(this);
  }

  getValue(): T {
    if (!this.isSuccess) {
      // eslint-disable-next-line no-restricted-syntax
      console.log(this.error);
      throw new Error(
        "Can't get the value of an error result. Use 'errorValue' instead."
      );
    }

    return this._value;
  }

  errorValue(): T {
    return this.error as T;
  }
}
