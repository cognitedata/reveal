import { Chip, Title } from '@cognite/cogs.js-v9';
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
        {titleLabel && <Chip size="small" label={titleLabel} />}
      </div>
      <div className="right-side">{children}</div>
    </Header>
  );
};
