import { Body, Title, Illustrations, IllustrationType } from '@cognite/cogs.js';

import { PlaceholderWrapper } from './elements';

export const FlexPlaceholder = ({
  title,
  description,
  graphic = 'Analysis',
}: {
  title: string;
  description: string;
  graphic?: IllustrationType;
}) => {
  return (
    <PlaceholderWrapper>
      <div className="wrapper" style={{ background: 'transparent' }}>
        <div className="content">
          <div className="placeholder-text">
            <Title key="placeholder_title" level={3}>
              {title}
            </Title>

            <Body level={1}>{description}</Body>
          </div>

          <div className="placeholder-graphic">
            <Illustrations.Solo type={graphic} prominence="muted" />
          </div>
        </div>
      </div>
    </PlaceholderWrapper>
  );
};
