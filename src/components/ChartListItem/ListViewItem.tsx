import { ReactNode } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import PlotlyChart from 'components/PlotlyChart';
import { Chart } from 'models/chart/types';
import { trackUsage } from 'services/metrics';
import { useProject } from 'hooks/config';
import { useIsChartOwner } from 'hooks/user';
import { formatOwner, formatDate } from './utils';

interface ListViewItemProps {
  chart: Chart;
  dropdownMenu: ReactNode;
  handleRenameChart: (value: string) => void;
  isEditingName: boolean;
  cancelEdition: () => void;
}

const ListViewItem = ({
  chart,
  dropdownMenu,
  handleRenameChart,
  isEditingName,
  cancelEdition,
}: ListViewItemProps) => {
  const isChartOwner = useIsChartOwner(chart);
  const project = useProject();
  const location = useLocation();

  return (
    <Wrapper>
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
        <ImageColumn>
          <PlotlyChart chart={chart} isPreview />
        </ImageColumn>
        <NameColumn>
          <TranslatedEditableText
            value={chart.name}
            onChange={handleRenameChart}
            editing={isEditingName}
            onCancel={cancelEdition}
            hideEdit={!isChartOwner}
          />
        </NameColumn>
        <OwnerColumn>
          {formatOwner(
            chart.userInfo?.displayName || chart.userInfo?.email || chart.user
          )}
        </OwnerColumn>
        <UpdatedColumn>{formatDate(chart.updatedAt)}</UpdatedColumn>
      </StyledLink>
      <Menu>{dropdownMenu}</Menu>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  margin: 0 20px 20px 20px;
  padding: 16px;
  border: 1px solid #dedede;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const StyledLink = styled(Link)`
  flex-grow: 1;
  display: flex;
  align-items: center;
  color: var(--cogs-text-color);
  &:hover {
    color: var(--cogs-text-color);
  }
`;

const ImageColumn = styled.div`
  width: 120px;
  height: 90px;
  flex-grow: 0;
  border: 1px solid #dedede;
`;

const NameColumn = styled.div`
  width: 40%;
  margin-left: 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--cogs-text-color);
`;

const OwnerColumn = styled.div`
  flex-grow: 1;
  margin-left: 16px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
`;

const UpdatedColumn = styled.div`
  margin-left: 16px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
`;

const Menu = styled.div`
  margin-left: 16px;
`;

export { ListViewItem };
