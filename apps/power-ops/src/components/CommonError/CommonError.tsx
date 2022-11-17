import { Body, Button, Flex, Graphic, Title } from '@cognite/cogs.js';
import { ComponentProps, PropsWithChildren } from 'react';

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
}: Props) => {
  return (
    <Flex direction="column" alignItems="center">
      <div style={{ marginBottom: 32 }}>
        <Graphic type="DataKits" />
      </div>
      <Title level={5} style={{ marginBottom: 8 }}>
        {title}
      </Title>
      <Body style={{ textAlign: 'center', marginBottom: 32 }}>{children}</Body>
      {buttonText && onButtonClick && (
        <Button
          onClick={onButtonClick}
          data-testid="common-error-button"
          aria-label={buttonText!}
        >
          {buttonText}
        </Button>
      )}
    </Flex>
  );
};
