import React, { ReactNode } from 'react';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';

import { Chart } from 'reducers/charts/types';
import EditableText from 'components/EditableText';
import PlotlyChart from 'components/PlotlyChart';

import { formatOwner, formatDate } from './utils';

interface GridViewItemProps {
  chart: Chart;
  dropdownMenu: ReactNode;
  handleRenameChart: (value: string) => void;
  isEditingName: boolean;
  cancelEdition: () => void;
}

const GridViewItem = ({
  chart,
  dropdownMenu,
  handleRenameChart,
  isEditingName,
  cancelEdition,
}: GridViewItemProps) => {
  return (
    <Wrapper>
      <Link to={`/${chart.id}`}>
        <ImageWrapper>
          <ImageContent>
            <PlotlyChart chart={chart} isPreview />
          </ImageContent>
        </ImageWrapper>
      </Link>
      <Footer>
        <StyledLink to={`/${chart.id}`}>
          <DateAndOwnerInfo>
            {formatDate(chart.updatedAt)} &middot; {formatOwner(chart.user)}
          </DateAndOwnerInfo>
          <NameInfo>
            <EditableText
              value={chart.name}
              onChange={handleRenameChart}
              editing={isEditingName}
              onCancel={cancelEdition}
              hideButtons
              hideEdit
            />
          </NameInfo>
        </StyledLink>
        <div>{dropdownMenu}</div>
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: calc(25% - 40px);
  margin: 20px;
  padding: 16px;
  border: 1px solid #dedede;
  border-radius: 4px;
`;

const Footer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 16px;
`;

const StyledLink = styled(Link)`
  flex-grow: 1;
  color: var(--cogs-text-color);
  &:hover {
    color: var(--cogs-text-color);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 75%;
  flex-grow: 0;
  border: 1px solid #dedede;
`;

const ImageContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const DateAndOwnerInfo = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
`;

const NameInfo = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--cogs-text-color);
`;

export { GridViewItem };
