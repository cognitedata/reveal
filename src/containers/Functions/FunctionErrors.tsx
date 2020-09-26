import React from 'react';

interface Props {
  error?: {
    message?: string;
    trace?: string;
  }
}
export default function FunctionErrors({ error }: Props) {
  return (
    <div style={{ overflowY: 'scroll', height: '300px' }}>
      <p>
        <b>Message: </b>
        {error?.message}
      </p>
      <b>Trace: </b>
      {error?.trace?.split('\n').map((i, index) => {
        return <p key={`functionErrortrace-${index.toString()}`}>{i}</p>;
      })}
    </div>
  );
}
