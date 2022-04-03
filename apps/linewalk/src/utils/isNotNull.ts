const isNotNull = <T>(value: T | null): value is T => value !== null;

export default isNotNull;
