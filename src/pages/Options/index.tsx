import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import { RootState } from 'store';
import { Button, Checkbox, Input, Title } from '@cognite/cogs.js';
import { Card } from 'antd';
import { v4 as uuid } from 'uuid';
import {
  setOptions,
  resetPnidParsingPipeline,
} from 'modules/contextualization/pnidPipeline';
import { Flex } from 'components/Common';
import StickyBottomRow from 'components/StickyBottomRow';

export default function Options() {
  const history = useHistory();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const [optionsChanged, setOptionsChanged] = useState(false);

  const { filesDataKitId, assetsDataKitId } = useParams<{
    filesDataKitId: string;
    assetsDataKitId: string;
  }>();

  const { partialMatch, grayscale, minTokens } = useSelector(
    (state: RootState) => state.fileContextualization.pnidOption
  );

  const summarizePnID = () => {
    const optionsId = uuid();
    if (optionsChanged) {
      dispatch(resetPnidParsingPipeline(filesDataKitId, assetsDataKitId));
    }
    history.push(`${match.url}/${optionsId}`);
  };

  return (
    <>
      <Title level={2}>P&ID options</Title>
      <Flex row grow>
        <Card style={{ marginRight: '8px ' }}>
          <Card.Meta
            title={
              <Checkbox
                name="checkbox-partial"
                value={partialMatch}
                onChange={(checked: boolean) => {
                  dispatch(setOptions({ partialMatch: checked }));
                  setOptionsChanged(true);
                }}
              >
                Allow partial matches
              </Checkbox>
            }
            description="Select to include matches where the P&ID tag names do not exactly match the asset list. 
            CDF finds matches by comparing similar characters, such as 0 and O, 8 and B. 
            Clear this option to only allow exact matches."
          />
        </Card>
        <Card style={{ marginRight: '8px ' }}>
          <Card.Meta
            title={
              <Checkbox
                name="checkbox-grayscale"
                value={grayscale}
                onChange={(checked: boolean) => {
                  dispatch(setOptions({ grayscale: checked }));
                  setOptionsChanged(true);
                }}
              >
                Grayscale P&ID
              </Checkbox>
            }
            description="Select Grayscale P&ID to increase the speed of the matching and create SVG 
            files with smaller file size. Clear this option to generate SVG files with the 
            original source colors."
          />
        </Card>
        <Card>
          <Card.Meta
            title={
              <Input
                name="input-min_tokens"
                value={minTokens}
                type="number"
                placeholder="Minimum Tokens for Matching"
                label="Minimum Tokens for Matching"
                min={1}
                step={1}
                onChange={(ev) => {
                  dispatch(setOptions({ minTokens: Number(ev.target.value) }));
                  setOptionsChanged(true);
                }}
              />
            }
            description="Each detected asset must match the matched entity on at least this number of tokens. That is, substrings of consecutive letters or consecutive digits."
          />
        </Card>
      </Flex>

      <StickyBottomRow justify="space-between">
        <Button size="large" type="secondary" onClick={() => history.goBack()}>
          Back
        </Button>
        <Button size="large" type="primary" onClick={summarizePnID}>
          Next
        </Button>
      </StickyBottomRow>
    </>
  );
}
