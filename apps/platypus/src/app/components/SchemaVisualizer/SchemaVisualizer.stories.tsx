import React from 'react';
import { Story } from '@storybook/react';
import { SchemaVisualizer } from './SchemaVisualizer';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';

export default {
  title: 'Schema/Schema Visualizer',
  component: SchemaVisualizer,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaVisualizer>[0]> = (args) => (
  <SchemaVisualizer {...args} />
);

export const Default = Template.bind({});

Default.args = {
  graphQLSchemaString: mockComplexGraphqlModel.concat(`
  type Well @template {
    labels: [String!]
    deferments(
      startTime: Long
      endTime: Long
      activeFrom: Long
      activeTo: Long
    ): [Deferment!]!
    advisors: [String!]!
  }`),
  isVisualizerOn: true,
};

export const BigModel = Template.bind({});

BigModel.args = {
  graphQLSchemaString: `
  type Project {
    Id: String
    Code: String
    Name: String
    Owner: User
    LocationLatitude: Float
    LocationLongitude: Float
    Country: Country
    Portfolio: String
    EnergyType: String
    EnergyType2: String
    EnergyType3: String
    Stage: String
    Status: String
    NumericMetrics: [ProjectNumericMetric]
    StringMetrics: [ProjectStringMetric]
    ContextDocuments: [Document]
    ActivityLog: [Activity]
    ProjectVersions: [ProjectVersion]
    Layers: [Layer]
  }
  type Document {
    Title: String
    Author: String
    Type: String
    Reference: String
    WBS: String
    CreatedTimeStamp: Timestamp
    UpdatedTimeStamp: Timestamp
    LastEditor: String
    SecurityClassification: String
    Version: String
    SharepointLink: String
    Project: Project
  }
  type Country {
    Name: String
    Latitude: Float
    Longitude: Float
    ZoomFactor: Int
    Region: String
    Code: String
    Projects: [Project]
  }
  type User {
    Name: String
    Email: String
    Id: String
    Favorites: [Project]
  }
  type Activity {
    User: User
    Action: String
    TimeStamp: Timestamp
    Message: String
    Project: Project
  }
  type Layer {
    Name: String
    Documents: [Document]
    FilesToBeSynched: [GeospacialFile]
    Versions: [GeospacialFile]
    SignOffDetails: [SignOffDetail]
    Project: Project
  }
  type ProjectVersion {
    Version: String
    Title: String
    SignedOff: Boolean
    SignedOffBy: User
    SignedOffTime: Timestamp
    Summary: String
    LayerMappings: [LayerMapping]
    CommentAreas: [CommentArea]
    Project: Project
  }
  type LayerMapping {
    Layer: Layer
    SignedOffLayerVersion: SignOffDetail
    LatestLayerVersionTimestamp: Timestamp
  }
  type SignOffDetail {
    SignedOffBy: User
    SignedOffTime: Timestamp
    SignedOfLayerVersion: GeospacialFile
  }
  type GeospacialFile {
    Name: String
    Type: String
    Author: String
    CreatedTimeStamp: Timestamp
    FileExternalId: String
    SyncTimestamp: Timestamp
    Ischecked: Boolean
  }
  type CommentArea {
    Points: [PolygonPoint]
    GeospacialFile: GeospacialFile
    Comments: [Comment]
  }
  type Comment {
    Text: String
    Author: User
    Timestamp: Timestamp
    UpdateTimeStamp: Timestamp
    EditTimeStamp: Timestamp
  }
  type ProjectNumericMetric {
    Name: String
    UnitOfMeasurement: String
    Value: Float
    Project: Project
  }
  type ProjectStringMetric {
    Name: String
    Value: String
    Project: Project
  }
  type PolygonPoint {
    Longitude: Float
    Latitude: Float
  }
  type SuperUser
  {
    Name: String
    Email: String
  }`,
  isVisualizerOn: true,
};
export const Empty = Template.bind({});

Empty.args = {
  graphQLSchemaString: '',
  isVisualizerOn: true,
};
export const Off = Template.bind({});

Off.args = {
  graphQLSchemaString: '',
  isVisualizerOn: false,
};
