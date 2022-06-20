import React, { useState } from 'react';

import { Table } from '@cognite/cogs.js';

import { Modal } from 'components/Modal';
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
        onOk={() => setOtherWellbores([])}
        onCancel={() => setOtherWellbores([])}
        footer={null}
      >
        <WellboreTableWrapper>
          <Table<NdsTreemapWellboreData>
            dataSource={otherWellbores}
            columns={[
              {
                Header: 'Wellbore name',
                accessor: 'name',
              },
              {
                Header: 'Number of NDS events',
                accessor: 'numberOfEvents',
                width: 150,
              },
            ]}
            pagination={false}
            flexLayout={{
              minWidth: 100,
              width: 500,
              maxWidth: 500,
            }}
          />
        </WellboreTableWrapper>
      </Modal>
    </>
  );
};
