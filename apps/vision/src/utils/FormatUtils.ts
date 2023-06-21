import { ReactText } from 'react';

export function generateKeyValueArray(
  data?: Record<ReactText, ReactText>
): { metaKey: string; metaValue: ReactText }[] {
  let output: { metaKey: string; metaValue: ReactText }[] = [];
  if (data) {
    output = Object.entries(data).map((val) => ({
      metaKey: val[0],
      metaValue: val[1],
    }));
  }
  return output;
}
