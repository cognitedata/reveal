import React from 'react';

type Props = {
  error?: any;
};
export default function ErrorFeedback({ error }: Props) {
  if (!error) {
    return null;
  }
  if (error?.message) {
    return <pre>{error.message}</pre>;
  }
  return <pre>{JSON.stringify(error, null, 2)}</pre>;
}
