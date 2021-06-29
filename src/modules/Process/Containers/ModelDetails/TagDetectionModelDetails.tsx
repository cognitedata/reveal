import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  SegmentedControl,
  Tabs,
} from '@cognite/cogs.js';
import React from 'react';
import { AssetSelector } from 'src/modules/Review/Components/AssetSelector/AssetSelector';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsTagDetection } from 'src/api/types';
import { RootState } from 'src/store/rootReducer';
import { ColorsTagDetection } from 'src/constants/Colors';
import { setParamsTagDetection } from '../../processSlice';
import { ModelDescription } from './ModelDescription';

const modelName = 'Asset tag detection';

export const description = () => {
  return (
    <Detail>
      Looks for strings of text and numbers and matches with assets in CDF.
    </Detail>
  );
};
export const badge = (hideText: boolean = false) => {
  return (
    <Button
      icon="ResourceAssets"
      size="small"
      style={{
        backgroundColor: ColorsTagDetection.backgroundColor,
        color: ColorsTagDetection.color,
      }}
    >
      {!hideText && modelName}
    </Button>
  );
};

export const content = () => {
  const dispatch = useDispatch();

  const params: ParamsTagDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.temporaryDetectionModelParameters.tagDetection
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
      <Tabs
        defaultActiveKey="config"
        style={{
          overflowY: 'auto',
          height: '100%',
        }}
      >
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
                <th style={{ maxWidth: '200px' }}>
                  <AssetSelector
                    assets={params.assetSubtreeIds}
                    onSelectAssets={onAssetSubtreeIdsChange}
                    hideTitle
                    maxMenuHeight={85}
                  />
                </th>
              </tr>
            </tbody>
          </table>
        </Tabs.TabPane>
        <Tabs.TabPane key="description" tab="Description">
          {ModelDescription({
            name: modelName,
            description: description(),
            icon: badge(true),
          })}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
};

const Container = styled.div`
  display: grid;

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
