import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { NavigationPanel } from 'components/NavigationPanel';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { Table } from 'components/Tablev3';
import { EMPTY_ARRAY } from 'constants/empty';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { CasingAssemblyView } from '../../types';

import { getCasingsDetailViewColumns } from './columns';
import { TableWrapper } from './elements';

const tableOptions = {
  flex: false,
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

export interface CasingsDetailViewProps {
  wellName: string;
  wellboreName: string;
  data?: CasingAssemblyView[];
  onBackClick: () => void;
}

export const CasingsDetailView: React.FC<CasingsDetailViewProps> = React.memo(
  ({ wellName, wellboreName, data = EMPTY_ARRAY, onBackClick }) => {
    const { data: userPreferredUnit } = useUserPreferencesMeasurement();

    return (
      <OverlayNavigation mount={!isEmpty(data)}>
        <NavigationPanel
          title={wellName}
          subtitle={wellboreName}
          onBackClick={onBackClick}
        />

        <TableWrapper>
          <Table<CasingAssemblyView>
            scrollTable
            id="wellbore-casings-detail-view-table"
            data={data}
            columns={getCasingsDetailViewColumns(userPreferredUnit)}
            options={tableOptions}
          />
        </TableWrapper>
      </OverlayNavigation>
    );
  }
);
