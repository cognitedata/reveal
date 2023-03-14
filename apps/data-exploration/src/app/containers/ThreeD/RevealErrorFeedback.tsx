import { Alert, Button } from 'antd';
import { FallbackProps } from 'react-error-boundary';

export default function RevealErrorFeedback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <Alert
      message="Reveal error"
      description={`Reveal component threw an error:\n${JSON.stringify(
        error,
        null,
        2
      )}`}
      action={<Button onClick={resetErrorBoundary}>Reset</Button>}
    />
  );
}
