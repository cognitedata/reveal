import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  Row,
  SegmentedControl,
  Title,
} from '@cognite/cogs.js';
import React from 'react';
import { setUnsavedDetectionModelSettings } from 'src/modules/Process/store/slice';
import { AssetSelector } from 'src/modules/Review/Components/AssetSelector/AssetSelector';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsTagDetection } from 'src/api/vision/detectionModels/types';
import { RootState } from 'src/store/rootReducer';
import { ColorsTagDetection } from 'src/constants/Colors';
import TagdetectionIllustration from 'src/assets/visualDescriptions/TagdetectionIllustration.svg';

import {
  ColorBox,
  NameContainer,
  ModelDetailSettingContainer,
  StyledCol,
  TableContainer,
} from './modelDetailsStyles';

export const description = () => {
  return (
    <Detail>
      Looks for strings of text and numbers and matches with assets in CDF.
    </Detail>
  );
};
export const badge = (modelName: string, hideText: boolean = false) => {
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

export const content = (modelIndex: number) => {
  const dispatch = useDispatch();

  const modelName = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex].modelName
  );

  const params: ParamsTagDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsTagDetection
  );

  const onUseCacheChange = (key: string) => {
    const newParams = {
      modelIndex,
      params: {
        useCache: key === 'true',
        partialMatch: params.partialMatch,
        assetSubtreeIds: params.assetSubtreeIds,
      },
    };
    dispatch(setUnsavedDetectionModelSettings(newParams));
  };

  const onPartialMatchChange = (key: string) => {
    const newParams = {
      modelIndex,
      params: {
        useCache: params.useCache,
        partialMatch: key === 'true',
        assetSubtreeIds: params.assetSubtreeIds,
      },
    };
    dispatch(setUnsavedDetectionModelSettings(newParams));
  };

  const onAssetSubtreeIdsChange = (assets: number[] | undefined) => {
    const newParams = {
      modelIndex,
      params: {
        useCache: params.useCache,
        partialMatch: params.partialMatch,
        assetSubtreeIds: assets || [],
      },
    };
    dispatch(setUnsavedDetectionModelSettings(newParams));
  };

  return (
    <ModelDetailSettingContainer>
      <Row cols={2}>
        <StyledCol span={1}>
          <TableContainer>
            <table>
              <tbody>
                <tr>
                  <td>
                    <Title level={5}> Key</Title>
                  </td>
                  <th>
                    <Title level={5}> Value</Title>
                  </th>
                </tr>
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
                      maxMenuHeight={100}
                    />
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Color</Detail>
                  </td>
                  <th>
                    <div style={{ display: 'flex' }}>
                      <ColorBox color={ColorsTagDetection.color} />
                    </div>
                  </th>
                </tr>
              </tbody>
            </table>
          </TableContainer>
        </StyledCol>
        <StyledCol span={1}>
          <div>
            <NameContainer>
              {badge(modelName)}
              {description()}
            </NameContainer>
            <img
              src={TagdetectionIllustration}
              alt="TagdetectionIllustration"
            />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
