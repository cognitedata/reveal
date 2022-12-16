import { Body, Button, Graphic, Title } from '@cognite/cogs.js';
import { ComponentProps, PropsWithChildren } from 'react';

import { StyledCommonError } from './elements';

interface Props extends PropsWithChildren {
  title: ComponentProps<typeof Title>['children'];
  buttonText?: string;
  onButtonClick?: ComponentProps<typeof Button>['onClick'];
}
export const CommonError = ({
  title,
  children,
  buttonText,
  onButtonClick,
}: Props) => (
  <StyledCommonError>
    <Graphic type="DataKits" />
    <Title level={5}>{title}</Title>
    <Body>{children}</Body>
    {buttonText && onButtonClick && (
      <Button
        onClick={onButtonClick}
        data-testid="common-error-button"
        aria-label={buttonText!}
      >
        {buttonText}
      </Button>
    )}
  </StyledCommonError>
);
