import { Body, Graphic, Title } from '@cognite/cogs.js';
import { PlaceholderWrapper } from './elements';

export const FlexPlaceholder = ({
  title,
  description,
  graphic = 'Search',
}: {
  title: string;
  description: string;
  graphic?: string;
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
            <Graphic type={graphic} />
          </div>
        </div>
      </div>
    </PlaceholderWrapper>
  );
};
