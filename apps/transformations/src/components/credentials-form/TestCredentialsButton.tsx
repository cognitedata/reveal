import { Button, Chip } from '@cognite/cogs.js';

type TestCredentialsButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  onTest?: () => void;
  validation?: boolean;
};

const TestCredentialsButton = ({
  isDisabled,
  isLoading,
  onTest,
  validation,
}: TestCredentialsButtonProps): JSX.Element => {
  if (validation === false) {
    return (
      <Chip
        icon="WarningFilled"
        label="Credentials not valid"
        size="small"
        type="danger"
      />
    );
  }

  if (validation === true) {
    return (
      <Chip
        icon="Checkmark"
        label="Credentials verified"
        size="small"
        type="success"
      />
    );
  }

  return (
    <Button
      disabled={isDisabled}
      loading={isLoading}
      onClick={onTest}
      size="small"
      type="ghost"
    >
      Test credentials
    </Button>
  );
};

export default TestCredentialsButton;
