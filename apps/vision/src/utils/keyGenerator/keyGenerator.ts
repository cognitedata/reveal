export function* keyGenerator({
  prefix,
  startingIndex = 0,
}: {
  prefix?: string;
  startingIndex?: number;
}) {
  let increment = 0;
  while (true) {
    yield `${prefix || ''}${startingIndex + increment}`;
    increment++;
  }
}
