import { Label, Title } from '@cognite/cogs.js';

import { CollapseHeaderWrapper } from './elements';

interface CollapseHeaderProps {
  title: string;
  stampCount: number;
  showStampCount: boolean;
}

export const CollapseHeader = ({
  title,
  stampCount,
  showStampCount,
}: CollapseHeaderProps) => (
  <CollapseHeaderWrapper>
    <Title level={6}>{title}</Title>
    {showStampCount && (
      <Label className="count-label" size="small">
        {stampCount}
      </Label>
    )}
  </CollapseHeaderWrapper>
);
