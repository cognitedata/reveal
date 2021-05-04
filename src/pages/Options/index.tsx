import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from 'store';
import { Button, Checkbox, Input } from '@cognite/cogs.js';
import { Card } from 'antd';
import { moveToStep, changeOptions, WorkflowStep } from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';
import { Flex, PageTitle } from 'components/Common';
import StickyBottomRow from 'components/StickyBottomRow';
import { reviewPage } from 'routes/paths';

type Props = {
  step: WorkflowStep;
};
export default function Options(props: Props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { step } = props;

  const { tenant, workflowId } = useActiveWorkflow(step);
  const { partialMatch, grayscale, minTokens } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );

  const summarizePnID = () => {
    history.push(reviewPage.path(tenant, workflowId));
  };

  useEffect(() => {
    dispatch(moveToStep('config'));
  }, [dispatch]);

  return (
    <Flex column style={{ width: '100%' }}>
      <PageTitle>P&ID options</PageTitle>
      <Flex row grow style={{ marginTop: '24px' }}>
        <Card style={{ marginRight: '8px ' }}>
          <Card.Meta
            title={
              <Checkbox
                name="checkbox-partial"
                value={partialMatch}
                onChange={(checked: boolean) => {
                  dispatch(changeOptions({ partialMatch: checked }));
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
                  dispatch(changeOptions({ grayscale: checked }));
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
                  dispatch(
                    changeOptions({ minTokens: Number(ev.target.value) })
                  );
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
    </Flex>
  );
}
