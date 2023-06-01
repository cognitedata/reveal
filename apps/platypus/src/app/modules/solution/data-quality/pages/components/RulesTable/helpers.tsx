import { RuleSeverity } from '@data-quality/codegen';

import { Body, Chip } from '@cognite/cogs.js';

export const renderNameColumn = (ruleName: string) => {
  return <Body level={2}>{ruleName}</Body>;
};

export const renderSeverityColumn = (severity: RuleSeverity) => {
  switch (severity) {
    case 'Critical':
      return <Chip icon="Error" label={severity} type="danger" />;
    case 'High':
      return <Chip icon="Warning" label={severity} type="warning" />;
    case 'Medium':
      return <Chip label={severity} type="warning" />;
    case 'Low':
      return <Chip label={severity} type="neutral" />;
    default:
      return <Chip label={severity} />;
  }
};
