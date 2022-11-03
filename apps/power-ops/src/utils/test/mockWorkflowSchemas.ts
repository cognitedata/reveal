import {
  PROCESS_TYPES,
  WorkflowSchemaWithProcesses,
  WORKFLOW_TYPES,
} from '@cognite/power-ops-api-types';

export const mockWorkflowSchemas: WorkflowSchemaWithProcesses[] = [
  {
    id: 1,
    name: 'Day-Ahead Bid Matrix Calculation',
    triggeredBy: ['POWEROPS_BID_PROCESS'],
    workflowType: WORKFLOW_TYPES.DAY_AHEAD_BID_MATRIX_CALCULATION,
    cdfProject: '',
    processes: [
      {
        processType: PROCESS_TYPES.COLLECTION,
        metadata: {
          collection_config_prefix: 'SHOP_COLLECTION_CONFIG',
        },
      },
      {
        processType: PROCESS_TYPES.COLLECTION,
        metadata: {
          collection_config_prefix: 'PARTIAL_MATRIX_COLLECTION_CONFIG',
        },
      },
      {
        processType: PROCESS_TYPES.COLLECTION,
        metadata: {
          collection_config_prefix: 'TOTAL_MATRIX_COLLECTION_CONFIG',
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Create Bid Process Data',
    triggeredBy: ['FDM_IMPORT_PRICE_PREDICTIONS', 'SMG_IMPORT_PRICE_SCENARIOS'],
    workflowType: 'PREPARE_BID_PROCESS_DATA',
    cdfProject: '',
    processes: [
      {
        processType: PROCESS_TYPES.FUNCTION_CALL,
        metadata: {
          function_external_id: 'create_bid_process_event',
        },
      },
    ],
  },
  {
    id: 3,
    name: 'Prepare Benchmarking of Day-Ahead Bid',
    triggeredBy: ['SMG_IMPORT_DAY_AHEAD_RESULT', 'SMG_IMPORT_DAY_AHEAD_PRICES'],
    workflowType: 'PREPARE_BID_PROCESS_DATA',
    cdfProject: '',
    processes: [
      {
        processType: PROCESS_TYPES.FUNCTION_CALL,
        metadata: {
          function_external_id: 'prepare_benchmarking_of_dayahead_bid',
        },
      },
    ],
  },
  {
    id: 4,
    name: 'Create RKOM collection config',
    triggeredBy: ['POWEROPS_RKOM_TRIGGER'],
    workflowType: 'POWEROPS_RKOM_PROCESS',
    cdfProject: '',
    processes: [
      {
        processType: PROCESS_TYPES.FUNCTION_CALL,
        metadata: {
          function_external_id: 'create_RKOM_collection_config',
        },
      },
      {
        processType: PROCESS_TYPES.COLLECTION,
        metadata: {
          collection_config_prefix: 'RKOM_COLLECTION_CONFIG',
        },
      },
      {
        processType: PROCESS_TYPES.FUNCTION_CALL,
        metadata: {
          function_external_id: 'calculate_RKOM_bid',
        },
      },
    ],
  },
];
