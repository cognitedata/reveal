import React from 'react';
import { SDKError } from '../../model/SDKErrors';

type Props = {
  error: SDKError;
};
export function ErrorFeedback({ error }: Props) {
  return (
    <div>
      <p>Something bad happened.</p>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
