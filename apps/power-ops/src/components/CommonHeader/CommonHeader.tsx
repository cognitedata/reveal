import { Label, Title } from '@cognite/cogs.js';
import { ComponentProps } from 'react';

import { Header } from './elements';

interface Props extends ComponentProps<typeof Header> {
  title: string;
  titleLabel?: string;
}

export const CommonHeader = ({
  title,
  titleLabel,
  children,
  ...rest
}: Props) => {
  return (
    <Header {...rest}>
      <div>
        <Title level={5}>{title}</Title>
        {titleLabel && (
          <Label size="small" variant="unknown">
            {titleLabel}
          </Label>
        )}
      </div>
      <div className="right-side">{children}</div>
    </Header>
  );
};
