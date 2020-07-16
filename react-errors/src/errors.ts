/**
 * Throw this to assert that every possible situation in a {@code switch} is
 * handling all situations. For example:
 *
 * <pre><code>
 * type Foo = 'bar' | 'baz';
 *
 * type f: Foo = generateFoo();
 * switch(f) {
 *   case 'bar':
 *     return 1;
 *   case 'baz':
 *     return 2;
 *   default:
 *     throw new UnreachableCaseError(f);
 * }
 * </code></pre>
 *
 * If a new type is ever added to {@code Foo}, then this code will fail to
 * compile because this additional case is not handled.
 */
export class UnreachableCaseError extends Error {
  public constructor(val: never) {
    super(`Unreachable case: ${val}`);
  }
}

/**
 * Useful to throw for when TypeScript can't know that something is handled but
 * it just doesn't see that. For example if a list is filtered for truthy items
 * and then it is mapped over -- TypeScript will warn that this thing might be
 * undefined.
 *
 * Rather than using @ts-ignore, throw this to make it happy. If the filter is
 * ever dropped, your app will scream loudly.
 */
export class ImpossibleStateError extends Error {
  public constructor(msg: string | never) {
    super(`Impossible state: ${msg}`);
  }
}
