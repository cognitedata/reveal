import { Label, Title } from '@cognite/cogs.js';
import { PropsWithChildren } from 'react';

import { Header } from './elements';

interface Props extends PropsWithChildren {
  title: string;
  titleLabel?: string;
}

export const CommonHeader = ({ title, titleLabel, children }: Props) => {
  return (
    <Header>
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
