import { ReactText } from 'react';

export function generateKeyValueArray(
  data?: Record<ReactText, ReactText>
): { key: string; value: ReactText }[] {
  let output: { key: string; value: ReactText }[] = [];
  if (data) {
    output = Object.entries(data).map((val) => ({
      key: val[0],
      value: val[1],
    }));
  }
  return output;
}
