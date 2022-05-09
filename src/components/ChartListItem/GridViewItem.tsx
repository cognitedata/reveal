import { ReactNode } from 'react';
import styled from 'styled-components/macro';
import { Link, useLocation } from 'react-router-dom';
import { Chart } from 'models/chart/types';
import { trackUsage } from 'services/metrics';
import { useProject } from 'hooks/config';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChartContainer';
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
  const project = useProject();
  const location = useLocation();
  return (
    <Wrapper>
      <Link
        to={{
          ...location,
          pathname: `/${project}/${chart.id}`,
        }}
      >
        <ImageWrapper>
          <ImageContent>
            <PlotlyChartComponent chart={chart} isPreview />
          </ImageContent>
        </ImageWrapper>
      </Link>
      <Footer>
        <StyledLink
          to={{
            ...location,
            pathname: `/${project}/${chart.id}`,
          }}
          onClick={() => {
            trackUsage('ChartList.SelectChart', {
              type: chart.public ? 'public' : 'private',
            });
          }}
        >
          <DateAndOwnerInfo>
            {formatDate(chart.updatedAt)} &middot;{' '}
            {formatOwner(
              chart.userInfo?.displayName || chart.userInfo?.email || chart.user
            )}
          </DateAndOwnerInfo>
          <NameInfo>
            <TranslatedEditableText
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
