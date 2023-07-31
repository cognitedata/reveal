import React, { useState } from 'react';
import { Row } from 'react-table';

import { ViewButton } from 'components/Buttons';
import { Modal } from 'components/Modal';
import { Table } from 'components/Tablev3';
import { Treemap, TreeMapData } from 'components/Treemap';

import { WellboreTableWrapper } from './elements';
import { NdsTreemapProps, NdsTreemapWellboreData } from './types';

const PercentageCell = ({ row }: { row: any }) => {
  return (
    <span>
      {row.original.numberOfEvents} ({row.original.percentage}%)
    </span>
  );
};

const SubComponent = ({
  row,
}: {
  // eslint-disable-next-line react/no-unused-prop-types
  row: Row<{
    wellName: string;
    wellbores: NdsTreemapWellboreData[];
  }>;
}) => (
  <Table
    options={{
      flex: false,
    }}
    hideHeaders
    indent="60px"
    columns={[
      {
        Header: 'Wellbore name',
        accessor: 'name',
        width: 'auto',
      },
      {
        Header: 'Number of NDS events',
        width: '250px',
        Cell: PercentageCell,
      },
    ]}
    data={row.original.wellbores}
    id="wellbores-number-of-events"
  />
);

export const NdsTreemap: React.FC<NdsTreemapProps> = ({
  data,
  onClickTile,
  tileCursor,
}) => {
  const [expanded, setExpanded] = React.useState<any>({});

  const [wellsWithWellbores, setWellsAndWellbores] = useState<
    { wellName: string; wellbores: NdsTreemapWellboreData[] }[]
  >([]);

  const handleRowClick = (rowElement: Row<any>) => {
    const { id } = rowElement.original as any;
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  const handleTileClicked = (treemapData: TreeMapData) => {
    const { id, wellboreId, wells } = treemapData;

    if (id === 'other') {
      setWellsAndWellbores(
        wells as {
          wellName: string;
          wellbores: NdsTreemapWellboreData[];
        }[]
      );

      setExpanded(
        (
          wells as {
            wellName: string;
            wellbores: NdsTreemapWellboreData[];
          }[]
        ).reduce((previous, current) => {
          return { ...previous, [current.wellName]: true };
        }, {})
      );
    } else {
      onClickTile?.(wellboreId as string);
    }
  };

  return (
    <>
      <Treemap
        data={data}
        onTileClicked={handleTileClicked}
        tileCursor={tileCursor}
      />

      {/* The modal needs to be implemented properly, there is no design right now for this view so it's improvised */}
      <Modal
        visible={!!wellsWithWellbores.length}
        title="Other"
        width={1000}
        onCancel={() => setWellsAndWellbores([])}
        footer={null}
      >
        <WellboreTableWrapper data-testid="nds-wellbore-table">
          <Table<{ wellName: string; wellbores: NdsTreemapWellboreData[] }>
            id="nds-modal-wells"
            data={wellsWithWellbores}
            columns={[
              {
                Header: 'Well/Wellbore name',
                accessor: 'wellName',
                width: 'auto',
              },
              {
                Header: 'Number of NDS events',
                accessor: 'numberOfEvents',
                width: '250px',
              },
            ]}
            options={{
              expandable: true,
              flex: false,
            }}
            expandedIds={expanded}
            handleRowClick={handleRowClick}
            renderRowHoverComponent={({ row }) => (
              <ViewButton
                text="View"
                hideIcon
                onClick={() => {
                  onClickTile?.(row.original.id);
                  setWellsAndWellbores([]);
                }}
              />
            )}
            renderRowSubComponent={SubComponent}
          />
        </WellboreTableWrapper>
      </Modal>
    </>
  );
};
