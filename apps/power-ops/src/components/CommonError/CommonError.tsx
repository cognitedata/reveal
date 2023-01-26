import { Body, Button, Illustrations, Title } from '@cognite/cogs.js-v9';
import { ComponentProps } from 'react';

import { StyledCommonError } from './elements';

interface Props extends ComponentProps<typeof StyledCommonError> {
  title: ComponentProps<typeof Title>['children'];
  buttonText?: string;
  onButtonClick?: ComponentProps<typeof Button>['onClick'];
  illustrationType?: ComponentProps<typeof Illustrations.Solo>['type'];
}

export const CommonError = ({
  title,
  children,
  buttonText,
  illustrationType = 'TableSpreadsheet',
  onButtonClick,
  ...rest
}: Props) => {
  return (
    <StyledCommonError {...rest}>
      <Illustrations.Solo type={illustrationType} />
      <Title level={5}>{title}</Title>
      <Body>{children}</Body>
      {buttonText && onButtonClick && (
        <Button
          onClick={onButtonClick}
          data-testid="common-error-button"
          aria-label={buttonText}
          type="primary"
        >
          {buttonText}
        </Button>
      )}
    </StyledCommonError>
  );
};
