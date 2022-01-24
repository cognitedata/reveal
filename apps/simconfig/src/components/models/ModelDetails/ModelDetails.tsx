import { useContext, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';

import styled from 'styled-components/macro';

import {
  Button,
  Icon,
  Popconfirm,
  SegmentedControl,
  Skeleton,
  Tabs,
  toast,
} from '@cognite/cogs.js';
import type { Simulator } from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelFileQuery,
  useRunModelCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { ModelForm } from 'components/forms/ModelForm';
import { CalculationList, ModelVersionList } from 'components/models';
import { useTitle } from 'hooks/useTitle';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { isSuccessResponse } from 'utils/responseUtils';

import type { AppLocationGenerics } from 'routes';

interface ModelDetailsProps {
  selectedTab?: string;
  project: string;
  modelName: string;
  simulator: Simulator;
}

export function ModelDetails({
  selectedTab = 'model-versions',
  project,
  modelName,
  simulator,
}: ModelDetailsProps) {
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const navigate = useNavigate();
  const [showCalculations, setShowCalculations] = useState('configured');
  const { authState } = useContext(CdfClientContext);

  const [runModelCalculations] = useRunModelCalculationMutation();

  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery({ project, modelName, simulator });

  useTitle(modelFile?.metadata.modelName);

  if (!isFetchingModelFile && !modelFile) {
    // Uninitialized state
    return null;
  }

  if (isFetchingModelFile) {
    return <Skeleton.List lines={2} />;
  }

  if (!modelFile) {
    // No model file returned
    throw new Error('No model file returned from backend');
  }

  const onClickRunAll = async () => {
    if (!authState?.email) {
      throw new Error('No user email found');
    }

    const response = await runModelCalculations({
      modelName,
      project,
      simulator,
      runModelCalculationRequestModel: {
        userEmail: authState.email,
      },
    });
    if (!isSuccessResponse(response)) {
      toast.error('Running calculation failed, try again');
    }
  };

  const extraContent: Record<string, JSX.Element | undefined> = {
    'model-versions': (
      <Link to="../new-version">
        <Button icon="Add" size="small" type="tertiary">
          New version
        </Button>
      </Link>
    ),
    'calculations': (
      <>
        <SegmentedControl
          currentKey={showCalculations}
          size="small"
          onButtonClicked={setShowCalculations}
        >
          <SegmentedControl.Button key="configured">
            Configured
          </SegmentedControl.Button>
          <SegmentedControl.Button key="not-configured">
            Not configured
          </SegmentedControl.Button>
        </SegmentedControl>
        <Popconfirm
          content="Run all calculations?"
          disabled={showCalculations === 'not-configured'}
          theme="cogs"
          onConfirm={onClickRunAll}
        >
          <Button
            disabled={showCalculations === 'not-configured'}
            icon="Play"
            size="small"
            type="tertiary"
            // loading
          >
            Run all
          </Button>
        </Popconfirm>
      </>
    ),
  };

  return (
    <ModelDetailsContainer>
      <div className="metadata">
        <h2>
          <strong>{modelFile.metadata.modelName}</strong>
        </h2>
        <ul>
          <li>
            <Icon size={12} type="OutputData" />
            {definitions?.type.simulator[modelFile.metadata.simulator]}
          </li>
          <li>
            <Icon size={12} type="Wrench" />
            {definitions?.type.unitSystem[modelFile.metadata.unitSystem]}
          </li>
        </ul>
      </div>
      <Tabs
        activeKey={selectedTab}
        tabBarExtraContent={extraContent[selectedTab] ?? null}
        onChange={(tab) => {
          navigate({ to: `../${tab}` });
        }}
      >
        <Tabs.TabPane
          key="model-versions"
          tab={
            <>
              <Icon type="DataSource" /> Model versions
            </>
          }
        >
          <ModelVersionList
            modelName={modelFile.metadata.modelName}
            simulator={modelFile.metadata.simulator}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="calculations"
          tab={
            <>
              <Icon type="Timeseries" /> Calculations
            </>
          }
        >
          <CalculationList
            modelName={modelName}
            showConfigured={showCalculations === 'configured'}
            simulator={simulator}
          />
        </Tabs.TabPane>
        {selectedTab === 'new-version' && (
          <Tabs.TabPane
            key="new-version"
            tab={
              <>
                <Icon type="Add" /> New version
              </>
            }
          >
            <ModelForm
              initialModelFormState={{
                fileInfo: {
                  ...modelFile,
                },
                metadata: {
                  ...modelFile.metadata,
                },
                boundaryConditions: [],
              }}
              onUpload={() => {
                navigate({ to: '../model-versions' });
                // TODO(SIM-209): Invalidate model list
              }}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
    </ModelDetailsContainer>
  );
}

const ModelDetailsContainer = styled.main`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 auto;
  overflow: auto;
  padding: 24px 0 0 24px;
  .metadata {
    margin-bottom: 12px;
    display: flex;
    align-items: baseline;
    gap: 12px;
    h2 {
      margin: 0;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: baseline;
      gap: 12px;
      font-size: var(--cogs-detail-font-size);
      li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
  .rc-tabs-nav {
    margin: 0 0 12px 0;
  }
  .rc-tabs {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column nowrap;
    .rc-tabs-extra-content {
      margin: 0 24px 0 0;
      display: flex;
      align-items: center;
      .cogs-btn-tertiary {
        font-size: var(--cogs-detail-font-size);
        border-color: var(--cogs-primary);
        color: var(--cogs-primary);
      }
    }
    .rc-tabs-content-holder {
      overflow: auto;
      padding: 0 24px 24px 0;
    }
  }
  .rc-tabs-extra-content {
    gap: 12px;
  }

  // Missing popconfirm styles in the current version of cogs.js (5.2.1)
  .tippy-box[data-theme='cogs'] {
    background-color: var(--cogs-greyscale-grey9);
    border-radius: var(--cogs-border-radius--small);
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
    outline: 0;
  }
  .tippy-box[data-theme='cogs'] .tippy-arrow {
    color: var(--cogs-greyscale-grey9);
  }
`;
