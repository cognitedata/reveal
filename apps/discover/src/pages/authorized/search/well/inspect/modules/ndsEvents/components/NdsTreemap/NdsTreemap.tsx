import React, { useState } from 'react';

import { ViewButton } from 'components/Buttons';
import { Modal } from 'components/Modal';
import { Table } from 'components/Tablev3';
import { Treemap, TreeMapData } from 'components/Treemap';

import { WellboreTableWrapper } from './elements';
import { NdsTreemapProps, NdsTreemapWellboreData } from './types';

export const NdsTreemap: React.FC<NdsTreemapProps> = ({
  data,
  onClickTile,
  tileCursor,
}) => {
  const [otherWellbores, setOtherWellbores] = useState<
    NdsTreemapWellboreData[]
  >([]);

  const handleTileClicked = (treemapData: TreeMapData) => {
    const { id, wellbores, wellboreId } = treemapData;

    if (id === 'other') {
      setOtherWellbores(wellbores as NdsTreemapWellboreData[]);
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
        visible={!!otherWellbores.length}
        title="Other"
        width={1000}
        onCancel={() => setOtherWellbores([])}
        footer={null}
      >
        <WellboreTableWrapper data-testid="nds-wellbore-table">
          <Table<NdsTreemapWellboreData>
            id="nds-modal-wellbores"
            data={otherWellbores}
            columns={[
              {
                Header: 'Wellbore name',
                accessor: 'name',
                width: 'auto',
              },
              {
                Header: 'Number of NDS events',
                accessor: 'numberOfEvents',
                width: '250px',
              },
            ]}
            options={{
              flex: false,
            }}
            renderRowHoverComponent={({ row }) => (
              <ViewButton
                text="View"
                hideIcon
                onClick={() => {
                  onClickTile?.(row.original.id);
                  setOtherWellbores([]);
                }}
              />
            )}
          />
        </WellboreTableWrapper>
      </Modal>
    </>
  );
};
