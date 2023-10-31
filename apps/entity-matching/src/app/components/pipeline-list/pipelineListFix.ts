import { Pipeline } from '../../hooks/entity-matching-pipelines';

// "Failed" | "Queued" | "Running" | "Completed"

export const pipelineListFix: Pipeline[] = [
  {
    id: 1,
    name: 'Data Processing Pipeline',
    description:
      'A pipeline for processing and transforming raw data into usable formats',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635764000,
      jobId: 987654321,
      startTime: 1635764100,
      status: 'Running',
      statusTime: 1635764200,
    },
  },
  {
    id: 2,
    name: 'Analytics Automation Pipeline',
    description:
      'Automates data analytics and reporting processes to gain insights from data',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635765000,
      jobId: 123456789,
      startTime: 1635765100,
      status: 'Queued',
      statusTime: 1635765200,
    },
  },
  {
    id: 3,
    name: 'Machine Learning Pipeline',
    description:
      'Uses machine learning algorithms to build predictive models and make data-driven decisions',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635766000,
      jobId: 456789123,
      startTime: 1635766100,
      status: 'Failed',
      statusTime: 1635766200,
    },
  },
  {
    id: 4,
    name: 'E-commerce Recommendation Pipeline',
    description:
      'Generates product recommendations for e-commerce platforms based on user behavior',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635767000,
      jobId: 789123456,
      startTime: 1635767100,
      status: 'Completed',
      statusTime: 1635767200,
    },
  },
  {
    id: 5,
    name: 'Inventory Management Pipeline',
    description:
      'Optimizes inventory levels and ensures efficient supply chain management',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635768000,
      jobId: 987654321,
      startTime: 1635768100,
      status: 'Completed',
      statusTime: 1635768200,
    },
  },
  {
    id: 6,
    name: 'Quality Control Pipeline',
    description:
      'Monitors and maintains the quality of products in a manufacturing process',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635769000,
      jobId: 123456789,
      startTime: 1635769100,
      status: 'Failed',
      statusTime: 1635769200,
    },
  },
  {
    id: 7,
    name: 'Customer Segmentation Pipeline',
    description:
      'Segments customers based on their preferences and behaviors for targeted marketing',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635770000,
      jobId: 456789123,
      startTime: 1635770100,
      status: 'Completed',
      statusTime: 1635770200,
    },
  },
  {
    id: 8,
    name: 'Financial Data Analysis Pipeline',
    description:
      'Analyzes financial data to make informed investment and financial decisions',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635771000,
      jobId: 789123456,
      startTime: 1635771100,
      status: 'Completed',
      statusTime: 1635771200,
    },
  },
  {
    id: 9,
    name: 'Supply Chain Optimization Pipeline',
    description:
      'Optimizes the supply chain to reduce costs and improve efficiency',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635772000,
      jobId: 987654321,
      startTime: 1635772100,
      status: 'Failed',
      statusTime: 1635772200,
    },
  },
  {
    id: 10,
    name: 'Sensor Data Processing Pipeline',
    description:
      'Processes and analyzes data from sensors for various applications such as IoT',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635773000,
      jobId: 123456789,
      startTime: 1635773100,
      status: 'Completed',
      statusTime: 1635773200,
    },
  },
  {
    id: 11,
    name: 'Image Recognition Pipeline',
    description: 'Utilizes computer vision to recognize and categorize images',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635774000,
      jobId: 456789123,
      startTime: 1635774100,
      status: 'Completed',
      statusTime: 1635774200,
    },
  },
  {
    id: 12,
    name: 'Social Media Analytics Pipeline',
    description: 'Analyzes social media data to track trends and sentiments',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635775000,
      jobId: 789123456,
      startTime: 1635775100,
      status: 'Failed',
      statusTime: 1635775200,
    },
  },
  {
    id: 13,
    name: 'Energy Consumption Optimization Pipeline',
    description: 'Optimizes energy consumption in buildings for sustainability',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635776000,
      jobId: 987654321,
      startTime: 1635776100,
      status: 'Completed',
      statusTime: 1635776200,
    },
  },
  {
    id: 14,
    name: 'Healthcare Data Processing Pipeline',
    description:
      'Processes healthcare data for research and patient care improvement',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635777000,
      jobId: 123456789,
      startTime: 1635777100,
      status: 'Completed',
      statusTime: 1635777200,
    },
  },
  {
    id: 15,
    name: 'Logistics Routing Optimization Pipeline',
    description: 'Optimizes delivery routes for logistics companies',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635778000,
      jobId: 789123456,
      startTime: 1635778100,
      status: 'Failed',
      statusTime: 1635778200,
    },
  },
  {
    id: 16,
    name: 'Weather Forecasting Pipeline',
    description: 'Uses meteorological data for accurate weather forecasts',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635779000,
      jobId: 987654321,
      startTime: 1635779100,
      status: 'Completed',
      statusTime: 1635779200,
    },
  },
  {
    id: 17,
    name: 'Text Analysis Pipeline',
    description:
      'Analyzes text data for sentiment analysis and content classification',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635780000,
      jobId: 123456789,
      startTime: 1635780100,
      status: 'Completed',
      statusTime: 1635780200,
    },
  },
  {
    id: 18,
    name: 'Data Security Pipeline',
    description:
      'Ensures data security and privacy through encryption and access control',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635781000,
      jobId: 789123456,
      startTime: 1635781100,
      status: 'Failed',
      statusTime: 1635781200,
    },
  },
  {
    id: 19,
    name: 'Customer Support Chatbot Pipeline',
    description: 'Develops chatbots for handling customer support inquiries',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635782000,
      jobId: 987654321,
      startTime: 1635782100,
      status: 'Completed',
      statusTime: 1635782200,
    },
  },
  {
    id: 20,
    name: 'Fraud Detection Pipeline',
    description: 'Detects fraudulent activities in financial transactions',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635783000,
      jobId: 123456789,
      startTime: 1635783100,
      status: 'Completed',
      statusTime: 1635783200,
    },
  },
  {
    id: 21,
    name: 'Sentiment Analysis Pipeline',
    description:
      'Analyzes social media data for sentiment and emotion analysis',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635784000,
      jobId: 789123456,
      startTime: 1635784100,
      status: 'Failed',
      statusTime: 1635784200,
    },
  },
  {
    id: 22,
    name: 'Recommendation Engine Pipeline',
    description: 'Generates personalized recommendations for users',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635785000,
      jobId: 987654321,
      startTime: 1635785100,
      status: 'Completed',
      statusTime: 1635785200,
    },
  },
  {
    id: 23,
    name: 'Data Backup and Recovery Pipeline',
    description:
      'Manages data backup and recovery processes for disaster recovery',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635786000,
      jobId: 123456789,
      startTime: 1635786100,
      status: 'Completed',
      statusTime: 1635786200,
    },
  },
  {
    id: 24,
    name: 'Content Generation Pipeline',
    description:
      'Generates content automatically, such as articles and reports',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635787000,
      jobId: 789123456,
      startTime: 1635787100,
      status: 'Failed',
      statusTime: 1635787200,
    },
  },
  {
    id: 25,
    name: 'Inventory Forecasting Pipeline',
    description:
      'Forecasts inventory requirements based on historical data and demand patterns',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635788000,
      jobId: 987654321,
      startTime: 1635788100,
      status: 'Completed',
      statusTime: 1635788200,
    },
  },
  {
    id: 26,
    name: 'Energy Consumption Analysis Pipeline',
    description:
      'Analyzes energy consumption data to identify opportunities for efficiency improvement',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635790000,
      jobId: 123456789,
      startTime: 1635790100,
      status: 'Completed',
      statusTime: 1635790200,
    },
  },
  {
    id: 27,
    name: 'Log Analysis Pipeline',
    description:
      'Analyzes logs and log files for system monitoring and troubleshooting',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635791000,
      jobId: 987654321,
      startTime: 1635791100,
      status: 'Completed',
      statusTime: 1635791200,
    },
  },
  {
    id: 28,
    name: 'Retail Sales Forecasting Pipeline',
    description:
      'Forecasts retail sales based on historical sales data and market trends',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635792000,
      jobId: 123456789,
      startTime: 1635792100,
      status: 'Completed',
      statusTime: 1635792200,
    },
  },
  {
    id: 29,
    name: 'Social Network Analytics Pipeline',
    description:
      'Analyzes social network data for user behavior and network insights',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635793000,
      jobId: 987654321,
      startTime: 1635793100,
      status: 'Completed',
      statusTime: 1635793200,
    },
  },
  {
    id: 30,
    name: 'Product Lifecycle Management Pipeline',
    description:
      'Manages product development and lifecycle from concept to retirement',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635794000,
      jobId: 123456789,
      startTime: 1635794100,
      status: 'Completed',
      statusTime: 1635794200,
    },
  },
  {
    id: 31,
    name: 'Agricultural Data Analysis Pipeline',
    description:
      'Analyzes agricultural data for crop management and yield optimization',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635795000,
      jobId: 987654321,
      startTime: 1635795100,
      status: 'Completed',
      statusTime: 1635795200,
    },
  },
  {
    id: 32,
    name: 'Traffic Flow Analysis Pipeline',
    description:
      'Analyzes traffic data for optimizing traffic flow and congestion management',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635796000,
      jobId: 123456789,
      startTime: 1635796100,
      status: 'Completed',
      statusTime: 1635796200,
    },
  },
  {
    id: 33,
    name: 'Environmental Data Analysis Pipeline',
    description:
      'Analyzes environmental data for monitoring and sustainability efforts',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635797000,
      jobId: 987654321,
      startTime: 1635797100,
      status: 'Completed',
      statusTime: 1635797200,
    },
  },
  {
    id: 34,
    name: 'Document Classification Pipeline',
    description:
      'Classifies documents and files for organization and information retrieval',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635798000,
      jobId: 123456789,
      startTime: 1635798100,
      status: 'Completed',
      statusTime: 1635798200,
    },
  },
  {
    id: 35,
    name: 'Smart Home Automation Pipeline',
    description:
      'Automates smart home devices and appliances for convenience and energy savings',
    owner: 'sachith.deegala@cognite.com',
    sources: {
      dataSetIds: [
        {
          id: 6443330162907957,
        },
      ],
      resource: 'time_series',
    },
    targets: {
      dataSetIds: [
        {
          id: 5055841238230747,
        },
      ],
      resource: 'assets',
    },
    lastRun: {
      createdTime: 1635799000,
      jobId: 987654321,
      startTime: 1635799100,
      status: 'Completed',
      statusTime: 1635799200,
    },
  },
];
