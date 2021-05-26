import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  SegmentedControl,
  Tabs,
} from '@cognite/cogs.js';
import { DataExplorationProvider } from '@cognite/data-exploration';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AssetSelector } from 'src/modules/Review/Components/AssetSelector/AssetSelector';
import styled from 'styled-components';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsTagDetection } from 'src/api/types';
import { RootState } from 'src/store/rootReducer';
import { setParamsTagDetection } from '../../processSlice';

export const description = () => {
  return (
    <Detail>
      Looks for strings of text and numbers and matches with assets in CDF.
    </Detail>
  );
};
export const badge = () => {
  return (
    <Button
      icon="ResourceAssets"
      style={{
        backgroundColor: '#F4DAF8',
        color: '#C945DB',
      }}
    >
      Asset tag detection
    </Button>
  );
};

export const content = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();

  const params: ParamsTagDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.detectionModelParameters.tagDetection
  );

  const onUseCacheChange = (key: string) => {
    const newParams: ParamsTagDetection = {
      useCache: key === 'true',
      partialMatch: params.partialMatch,
      assetSubtreeIds: params.assetSubtreeIds,
    };
    dispatch(setParamsTagDetection(newParams));
  };

  const onPartialMatchChange = (key: string) => {
    const newParams: ParamsTagDetection = {
      useCache: params.useCache,
      partialMatch: key === 'true',
      assetSubtreeIds: params.assetSubtreeIds,
    };
    dispatch(setParamsTagDetection(newParams));
  };

  const onAssetSubtreeIdsChange = (assets: number[] | undefined) => {
    const newParams: ParamsTagDetection = {
      useCache: params.useCache,
      partialMatch: params.partialMatch,
      assetSubtreeIds: assets || [],
    };
    dispatch(setParamsTagDetection(newParams));
  };

  return (
    <Container>
      <Tabs defaultActiveKey="config">
        <Tabs.TabPane key="config" tab="Model configuration">
          <table>
            <tbody>
              <tr>
                <td>
                  <Detail>Use cached results</Detail>
                  <PrimaryTooltip
                    tooltipTitle=""
                    tooltipText="If True, uses cached result if the file has previously been analyzed."
                  >
                    <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                  </PrimaryTooltip>
                </td>
                <th>
                  <SegmentedControl
                    style={{ marginRight: 24 }}
                    currentKey={params.useCache ? 'true' : 'false'}
                    onButtonClicked={onUseCacheChange}
                  >
                    <SegmentedControl.Button key="true">
                      True
                    </SegmentedControl.Button>
                    <SegmentedControl.Button key="false">
                      False
                    </SegmentedControl.Button>
                  </SegmentedControl>
                </th>
              </tr>
              <tr>
                <td>
                  <Detail>Allow partial match </Detail>
                  <PrimaryTooltip
                    tooltipTitle=""
                    tooltipText="Allow partial (fuzzy) matching of detected external IDs in the file. Will only match when it is possible to do so unambiguously."
                  >
                    <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                  </PrimaryTooltip>
                </td>
                <th>
                  <SegmentedControl
                    style={{ marginRight: 24 }}
                    currentKey={params.partialMatch ? 'true' : 'false'}
                    onButtonClicked={onPartialMatchChange}
                  >
                    <SegmentedControl.Button key="true">
                      True
                    </SegmentedControl.Button>
                    <SegmentedControl.Button key="false">
                      False
                    </SegmentedControl.Button>
                  </SegmentedControl>
                </th>
              </tr>
              <tr>
                <td>
                  <Detail>Search within asset subtree</Detail>
                  <PrimaryTooltip
                    tooltipTitle=""
                    tooltipText="Search for external ID of assets that are in a subtree rooted at one of the assetSubtreeIds (including the roots given).
                    "
                  >
                    <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                  </PrimaryTooltip>
                </td>
                <th>
                  <DataExplorationProvider sdk={sdk}>
                    <QueryClientProvider client={queryClient}>
                      <AssetSelector
                        assets={params.assetSubtreeIds}
                        onSelectAssets={onAssetSubtreeIdsChange}
                        hideTitle
                      />
                    </QueryClientProvider>
                  </DataExplorationProvider>
                </th>
              </tr>
            </tbody>
          </table>
        </Tabs.TabPane>
        {/* <Tabs.TabPane key="style" tab="Look and feel">
          View is here
        </Tabs.TabPane> */}
      </Tabs>
    </Container>
  );
};

const Container = styled.div`
  display: inline-table;

  table {
    width: 100%;
    height: 100%;
    font-size: smaller;
    margin-top: 12px;

    td {
      padding: 16px;
    }
  }
`;
