import React, { useState } from 'react';
import { Input, Button, Row } from '@cognite/cogs.js';
import { CogniteSeismicClient } from '@cognite/seismic-sdk-js';
import {
  SyntheticSubSurfaceModule,
  SubSurfaceModule,
  ThreeModule,
  Modules,
  NodeVisualizer,
  NodeVisualizerProps,
  ExplorerPropType,
  VisualizerToolbarProps,
  mapMetadataKeys,
  MetadataKeyMapping,
  WellboreMetadata,
} from '@cognite/node-visualizer';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { CogniteGeospatialClient } from '@cognite/geospatial-sdk-js';

import { store } from './node-visualizer.store';
import {
  well,
  mappedWellbore,
  trajectory,
  trajectoryData,
} from '../../src/__mocks__/subsurface.mock';
import {
  bpWells,
  bpWellBores,
  bpTrajectories,
  bpTrajectoryData,
  bpCasings,
  bpLogs,
  bpLogsFrmTops,
  bpNdsEvents,
  bpNptEvents,
  noDataWells,
  noDataWellbores,
} from '../../src/__mocks__/subsurfaceWithEvents.mock';

const StyledRow = styled(Row)`
  margin-bottom: 5px;
`;

interface AuthWrapperProps {
  explorer?: React.ComponentType<ExplorerPropType>;
  toolbar?: React.ComponentType<VisualizerToolbarProps>;
}

const defaultFormValue = {
  apiKey: process.env.API_KEY || '',
  fileId: process.env.FILE_ID || '',
  apiUrl: process.env.API_URL || 'https://api.cognitedata.com',
  project: process.env.PROJECT || '',
  externalId: 'synthetic_horizon',
};

const defaultFormFields: FormField[] = [
  {
    name: 'apiKey',
    type: 'password',
    placeholder: 'Api key',
  },
  {
    name: 'fileId',
    type: 'text',
    placeholder: 'File ID',
  },
  {
    name: 'apiUrl',
    type: 'text',
    placeholder: 'Api URL',
  },
];

interface AuthFormValue {
  [key: string]: string;
}

interface FormField {
  name: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
}

interface AuthFormProps {
  fields: FormField[];
  onFormSubmit?: (data: AuthFormValue) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onFormSubmit, fields }) => {
  const [formValue, setFormValue] = useState<AuthFormValue>({
    ...defaultFormValue,
  });
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValue({ ...formValue, [name]: value });
  };
  const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onFormSubmit) {
      onFormSubmit({ ...formValue });
    }
  };

  return (
    <form name="basic" onSubmit={onSubmit}>
      {fields.map(({ name, placeholder, type }) => (
        <StyledRow key={name}>
          <Input
            name={name}
            variant="default"
            placeholder={placeholder || ''}
            type={type || 'text'}
            size="default"
            onChange={onInputChange}
            value={formValue[name]}
          />
        </StyledRow>
      ))}
      <StyledRow>
        <Button type="primary" htmlType="submit" block>
          Submit
        </Button>
      </StyledRow>
    </form>
  );
};

export const AuthWrapper: React.FC<AuthWrapperProps> = (props) => {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(process.env.API_URL || '');
  const [fileId, setFileId] = useState(process.env.FILE_ID || '');

  const onFormSubmit = (values: AuthFormValue) => {
    const { apiKey: key, apiUrl: url, fileId: id } = values;
    setApiKey(key);
    setApiUrl(url);
    setFileId(id);
  };

  return (
    <>
      {apiKey && fileId && apiUrl ? (
        <NodeVisualizerWrapper
          apiKey={apiKey}
          apiUrl={apiUrl}
          fileId={fileId}
          {...props}
        />
      ) : (
        <AuthForm onFormSubmit={onFormSubmit} fields={defaultFormFields} />
      )}
    </>
  );
};

interface NodeVisualizerWrapperProps extends AuthWrapperProps {
  apiKey: string;
  apiUrl: string;
  fileId: string;
}

export const NodeVisualizerWrapper: React.FC<NodeVisualizerWrapperProps> = ({
  apiKey,
  apiUrl,
  fileId,
  ...nodeVisualizerProps
}) => {
  const modules = Modules.instance;

  modules.clearModules();
  modules.add(new ThreeModule());

  const syntheticModule = new SyntheticSubSurfaceModule();

  if (apiKey && fileId) {
    syntheticModule.addSeismicCube(
      new CogniteSeismicClient({
        api_url: apiUrl || '',
        api_key: apiKey || '',
        debug: true,
      }),
      fileId || ''
    );
  }

  modules.add(syntheticModule);
  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} {...nodeVisualizerProps} />
      </Provider>
    </div>
  );
};

interface HorizonNodeVisualizerProps extends AuthWrapperProps {
  apiKey: string;
  apiUrl: string;
  project: string;
  externalId: string;
}

export const HorizonNodeVisualizer: React.FC<HorizonNodeVisualizerProps> = ({
  apiKey,
  apiUrl,
  project,
  externalId = 'synthetic_horizon',
}) => {
  const modules = Modules.instance;

  modules.clearModules();
  modules.add(new ThreeModule());

  const subSurfaceModule = new SubSurfaceModule();
  const client = CogniteGeospatialClient({
    project: process.env.PROJECT || project || '',
    api_key: process.env.API_KEY || apiKey || '',
    api_url: process.env.API_URL || apiUrl || '',
  });
  subSurfaceModule.addHorizonData(client, [externalId]);
  modules.add(subSurfaceModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} />
      </Provider>
    </div>
  );
};

const horizonsFormFields: FormField[] = [
  {
    name: 'apiKey',
    type: 'password',
    placeholder: 'Api key',
  },
  {
    name: 'apiUrl',
    type: 'text',
    placeholder: 'Api URL',
  },
  {
    name: 'project',
    type: 'text',
    placeholder: 'Project (Tenant)',
  },
  {
    name: 'externalId',
    type: 'text',
    placeholder: 'externalId to be shown for',
  },
];

export const AuthWrapperHorizons: React.FC<AuthWrapperProps> = (props) => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [apiUrl, setApiUrl] = useState(process.env.API_URL || '');
  const [project, setProject] = useState(process.env.project || '');
  const [externalId, setExternalId] = useState('synthetic_horizon');

  const onFormSubmit = (values: AuthFormValue) => {
    const { apiKey: key, apiUrl: url, project: prj, externalId: eid } = values;
    setApiKey(key);
    setApiUrl(url);
    setProject(prj);
    setExternalId(eid);
  };

  return (
    <>
      {apiKey && project && apiUrl ? (
        <HorizonNodeVisualizer
          apiKey={apiKey}
          apiUrl={apiUrl}
          project={project}
          externalId={externalId}
          {...props}
        />
      ) : (
        <AuthForm onFormSubmit={onFormSubmit} fields={horizonsFormFields} />
      )}
    </>
  );
};

export const NodeVisualizerComponent: React.FC<NodeVisualizerProps> = (
  props
) => <NodeVisualizer {...props} />;

export const NodeVisualizerExplorer: React.FC<ExplorerPropType> = (_) => <></>;

export const NodeVisualizerToolbar: React.FC<VisualizerToolbarProps> = (_) => (
  <></>
);

export const NodeVisualiserWithWells = () => {
  const mapping: MetadataKeyMapping<WellboreMetadata> = {
    elevation_type: 'e_type',
    elevation_value: 'e_value',
    elevation_value_unit: 'e_value_unit',
  };
  const modules = Modules.instance;
  modules.clearModules();
  modules.add(new ThreeModule());

  const subSurfaceModule = new SubSurfaceModule();

  subSurfaceModule.addWellData(
    {
      wells: [well],
      wellBores: [mappedWellbore],
      trajectories: [trajectory],
      trajectoryData: [trajectoryData],
    },
    {
      wellbore: {
        datasource: (wellboreData) => mapMetadataKeys(mapping, wellboreData),
      },
    }
  );
  modules.add(subSurfaceModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} />
      </Provider>
    </div>
  );
};

export const NodeVisualiserWithWellsAndEvents = () => {
  Modules.instance.clearModules();

  const modules = Modules.instance;
  modules.add(new ThreeModule());

  const subsurfaceModule = new SubSurfaceModule();

  subsurfaceModule.addWellData({
    wells: bpWells,
    wellBores: bpWellBores,
    trajectories: bpTrajectories,
    trajectoryData: bpTrajectoryData,
    casings: bpCasings,
    ndsEvents: bpNdsEvents,
    nptEvents: bpNptEvents,
    logs: bpLogs,
    logsFrmTops: bpLogsFrmTops,
  });

  modules.add(subsurfaceModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} />
      </Provider>
    </div>
  );
};

export const NodeVisualiserWithWellsAndEventsInMeter = () => {
  Modules.instance.clearModules();

  const modules = Modules.instance;
  modules.add(new ThreeModule());

  const subsurfaceModule = new SubSurfaceModule();

  const nptEventInMeter = bpNptEvents.map((event) => {
    return {
      ...event,
      metadata: {
        ...event.metadata,
        npt_md: event.npt_md / 0.0022046,
        npt_md_unit: 'meter',
      },
    };
  });

  subsurfaceModule.addWellData({
    wells: bpWells,
    wellBores: bpWellBores,
    trajectories: bpTrajectories,
    trajectoryData: bpTrajectoryData,
    casings: bpCasings,
    ndsEvents: bpNdsEvents,
    nptEvents: [
      {
        externalId: 'St7Pd',
        dataSetId: 7788182229523559,
        startTime: 1540350000000,
        endTime: 1540366200000,
        subtype: 'SFAL',
        description: 'OVER TORQUED CONNECTIONS.',
        metadata: {
          description: 'OVER TORQUED CONNECTIONS.',
          npt_level: '1.0',
          type: 'NPT',
          npt_code: 'SFAL',
          npt_detail_code: 'DSTH',
          total_npt_duration_hrs: '4.5',
          npt_md: '10845.02169',
          parentExternalId: 'USA0000620200',
          wellboreName: 'OCS-G 09981 /GC825-6 (SP5) ST00BP00',
          created_date: '2018-10-25T01:11:05',
          updated_date: '2018-10-25T01:17:48',
          failure_location: '',
          root_cause: '',
          npt_description:
            'UNABLE TO BREAK CONNECTIONS ON WORKSTRINGS RENTAL 6 5/8" 27# V150 XT-57 DRILL PIPE DUE TO OVER TORQUING. CONNECTIONS HAD TO BE HEATED USING ROSEBUD TORCH.',
        },
        assetIds: [3449261002359307],
        source: 'EDM-NPT',
        id: 8581525009611500,
        lastUpdatedTime: '2020-08-19T16:45:35.464Z',
        createdTime: '2020-05-12T22:05:33.519Z',
      },
    ],
    logs: bpLogs,
    logsFrmTops: bpLogsFrmTops,
  });

  modules.add(subsurfaceModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} />
      </Provider>
    </div>
  );
};

export const NodeVisualiserWellboresWithNoData = () => {
  Modules.instance.clearModules();

  const modules = Modules.instance;
  modules.add(new ThreeModule());

  const subsurfaceModule = new SubSurfaceModule();

  subsurfaceModule.addWellData({
    wells: noDataWells,
    wellBores: noDataWellbores,
    trajectories: [],
    trajectoryData: [],
    casings: [],
    ndsEvents: [],
    nptEvents: [],
    logs: {},
    logsFrmTops: {},
  });

  modules.add(subsurfaceModule);

  modules.install();

  const root = modules.createRoot();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Provider store={store}>
        <NodeVisualizer root={root} />
      </Provider>
    </div>
  );
};
