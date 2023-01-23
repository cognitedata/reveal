import {
  Button,
  Detail,
  Icon,
  Tooltip,
  Row,
  SegmentedControl,
  Title,
} from '@cognite/cogs.js';
import { InputNumber } from 'antd';
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
      icon="Assets"
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

  const isValidThreshold = params.threshold >= 0.4 && params.threshold <= 1.0;

  const onThresholdChange = (value: number) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
          threshold: value,
          partialMatch: params.partialMatch,
          assetSubtreeIds: params.assetSubtreeIds,
        },
      };
      dispatch(setUnsavedDetectionModelSettings(newParams));
    }
  };
  const onPartialMatchChange = (key: string) => {
    const newParams = {
      modelIndex,
      params: {
        threshold: params.threshold,
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
        threshold: params.threshold,
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
                    <Detail>Confidence threshold</Detail>
                    <Tooltip
                      wrapped
                      content="Threshold for minimum confidence the model has on a detected object"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </Tooltip>
                  </td>
                  <th>
                    <Row>
                      <input
                        type="range"
                        min={0.4}
                        max={1}
                        value={params.threshold}
                        onChange={(e) =>
                          onThresholdChange(parseFloat(e.target.value))
                        }
                        step={0.05}
                      />
                      <InputNumber
                        type="number"
                        min={0.4}
                        max={1}
                        step={0.05}
                        value={params.threshold}
                        onChange={onThresholdChange}
                        // TODO: switch back to the Input component in cogs.js once the issue in
                        // https://cognitedata.slack.com/archives/C011E10CW2F/p1655890641506019?thread_ts=1655888255.471469&cid=C011E10CW2F
                        // is resolved
                        // size="large"
                        // width={80}
                        // style={{ height: '40px', MozAppearance: 'textfield' }}
                      />
                    </Row>
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Allow partial match </Detail>
                    <Tooltip
                      wrapped
                      content="Allow partial (fuzzy) matching of detected external IDs in the file. Will only match when it is possible to do so unambiguously."
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </Tooltip>
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
                    <Tooltip
                      wrapped
                      content="Search for external ID of assets that are in a subtree rooted at one of the assetSubtreeIds (including the roots given).
                    "
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </Tooltip>
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
