import globalServices from '@platypus-app/di';

// created local di because we needed to share same instance between
// pages in data model module
const dataModelService = globalServices().solutionDataModelService;

export default {
  dataModelService,
};
