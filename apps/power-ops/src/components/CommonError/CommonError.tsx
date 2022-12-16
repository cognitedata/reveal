import { Body, Button, Graphic, Title } from '@cognite/cogs.js';
import { ComponentProps } from 'react';

import { StyledCommonError } from './elements';

interface Props extends ComponentProps<typeof StyledCommonError> {
  title: ComponentProps<typeof Title>['children'];
  buttonText?: string;
  onButtonClick?: ComponentProps<typeof Button>['onClick'];
  graphicType?: ComponentProps<typeof Graphic>['type'];
}

export const CommonError = ({
  title,
  children,
  buttonText,
  graphicType = 'DataKits',
  onButtonClick,
  ...rest
}: Props) => {
  return (
    <StyledCommonError {...rest}>
      <Graphic type={graphicType} />
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
