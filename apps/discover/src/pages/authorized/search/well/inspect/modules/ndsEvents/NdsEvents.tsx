import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { SegmentedControl, Table } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { Modal } from 'components/Modal';
import { Treemap, TreeMapData } from 'components/Treemap/Treemap';
import { useDeepEffect } from 'hooks/useDeep';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';

import { NdsControlWrapper, WellboreTableWrapper } from './elements';
import { NdsTable } from './table';
import { useNdsData } from './useNdsData';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';

type SelectedView = 'treemap' | 'table';

const NdsEvents: React.FC = () => {
  const { data, isLoading } = useNdsData();

  // data
  const { data: ndsEventsQuery } = useNdsEventsQuery();
  const selectedWellbores = useWellInspectSelectedWellbores();

  useDeepEffect(() => {
    setTreemapData(
      generateNdsTreemapData(selectedWellbores, ndsEventsQuery || {})
    );
  }, [selectedWellbores, ndsEventsQuery]);

  // state
  const [selectedView, setSelectedView] = useState<SelectedView>('treemap');
  const [treemapData, setTreemapData] = useState<TreeMapData | undefined>(
    undefined
  );
  const [otherWellbores, setOtherWellbores] = useState<
    { name: string; id: string; numberOfEvents: number }[]
  >([]);

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <NdsControlWrapper>
        <SegmentedControl
          currentKey={selectedView}
          onButtonClicked={(view) => setSelectedView(view as SelectedView)}
        >
          <SegmentedControl.Button key="treemap">
            Treemap
          </SegmentedControl.Button>
          <SegmentedControl.Button key="table">Table</SegmentedControl.Button>
        </SegmentedControl>
      </NdsControlWrapper>

      {selectedView === 'treemap' && treemapData && (
        <>
          <Treemap
            data={treemapData}
            onTileClicked={(d) => {
              if (d.id === 'other') {
                setOtherWellbores(d.wellbores as any);
              }
            }}
          />

          {/* The modal needs to be implemented properly, there is no design right now for this view so it's improvised */}
          <Modal
            visible={!!otherWellbores.length}
            title="List of wellbores"
            width={1000}
            onOk={() => setOtherWellbores([])}
            onCancel={() => setOtherWellbores([])}
          >
            <WellboreTableWrapper>
              <Table<{ name: string; id: string; numberOfEvents: number }>
                dataSource={otherWellbores}
                columns={[
                  {
                    Header: 'Wellbore name',
                    accessor: 'name',
                  },
                  {
                    Header: 'Number of NDS events',
                    accessor: 'numberOfEvents',
                    width: 100,
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
      )}
      {selectedView === 'table' && <NdsTable data={data} />}
    </>
  );
};

export default NdsEvents;
