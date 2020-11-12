import React from 'react';
import { SdkError } from '../../model/SdkError';

type Props = {
  error: SdkError;
};
export function ErrorFeedback({ error }: Props) {
  return (
    <div>
      <p>Something bad happened.</p>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
