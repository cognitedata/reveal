import React, { useState } from 'react';
import { Input, Button, Row } from '@cognite/cogs.js';
import { CogniteSeismicClient } from '@cognite/seismic-sdk-js';
import {
  SyntheticSubSurfaceModule,
  ThreeModule,
  Modules,
  NodeVisualizer,
} from '@cognite/node-visualizer';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import {
  NodeVisualizerProps,
  ExplorerPropType,
  VisualizerToolbarProps,
} from '../../src';

import { store } from './node-visualizer.store';

const StyledRow = styled(Row)`
  margin-bottom: 5px;
`;

interface AuthWrapperProps {
  explorer?: React.ComponentType<ExplorerPropType>;
  toolbar?: React.ComponentType<VisualizerToolbarProps>;
}

const defaultFormValue = {
  apiKey: '',
  fileId: '',
  apiUrl: 'https://api.cognitedata.com',
};

export const AuthWrapper: React.FC<AuthWrapperProps> = (props) => {
  const [formValue, setFormValue] = useState({ ...defaultFormValue });
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [fileId, setFileId] = useState('');

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValue({ ...formValue, [name]: value });
  };

  const onFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { apiKey: key, apiUrl: url, fileId: id } = formValue;

    setApiKey(key);
    setApiUrl(url);
    setFileId(id);

    setFormValue({ ...defaultFormValue });
  };

  return (
    <div>
      {apiKey && fileId && apiUrl ? (
        <NodeVisualizerWrapper
          apiKey={apiKey}
          apiUrl={apiUrl}
          fileId={fileId}
          {...props}
        />
      ) : (
        <form name="basic" onSubmit={onFormSubmit}>
          <StyledRow>
            <Input
              name="apiKey"
              variant="default"
              placeholder="Api key"
              size="default"
              onChange={onInputChange}
              value={formValue.apiKey}
              type="password"
            />
          </StyledRow>
          <StyledRow>
            <Input
              name="fileId"
              variant="default"
              placeholder="File ID"
              size="default"
              onChange={onInputChange}
              value={formValue.fileId}
            />
          </StyledRow>
          <StyledRow>
            <Input
              name="apiUrl"
              variant="default"
              placeholder="Api URL"
              size="default"
              onChange={onInputChange}
              value={formValue.apiUrl}
            />
          </StyledRow>
          <StyledRow>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </StyledRow>
        </form>
      )}
    </div>
  );
};

interface NodeVisualizerWrapperProps extends AuthWrapperProps {
  apiKey: string;
  apiUrl: string;
  fileId: string;
}

const NodeVisualizerWrapper: React.FC<NodeVisualizerWrapperProps> = ({
  apiKey,
  apiUrl,
  fileId,
  ...nodeVisualizerProps
}) => {
  const modules = Modules.instance;

  modules.clearModules();
  modules.add(new ThreeModule());

  const syntheticModule = new SyntheticSubSurfaceModule();
  syntheticModule.addSeismicCube(
    new CogniteSeismicClient({
      api_url: apiUrl || '',
      api_key: apiKey || '',
      debug: true,
    }),
    fileId || ''
  );
  modules.add(syntheticModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '1000px', height: '600px' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} {...nodeVisualizerProps} />
      </Provider>
    </div>
  );
};

export const NodeVisualizerComponent: React.FC<NodeVisualizerProps> = (
  props
) => <NodeVisualizer {...props} />;

export const NodeVisualizerExplorer: React.FC<ExplorerPropType> = (_) => <></>;

export const NodeVisualizerToolbar: React.FC<VisualizerToolbarProps> = (_) => (
  <></>
);
