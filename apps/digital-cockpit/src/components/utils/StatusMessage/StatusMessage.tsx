import { Graphic, Icon } from '@cognite/cogs.js';

import { StatusMessageWrapper } from './elements';

type StatusMessageProps = {
  type:
    | 'Loading'
    | 'Missing.Blueprints'
    | 'Missing.Documents'
    | 'Missing.Datapoints'
    | 'Missing.TimeSeries'
    | 'Missing.Events'
    | 'Missing.3D'
    | 'Error';
  message?: string;
};

const StatusMessage = ({ type, message }: StatusMessageProps) => {
  const renderGraphic = () => {
    switch (type) {
      case 'Missing.Blueprints':
      case 'Missing.Documents':
        return <Graphic type="Documents" />;

      case 'Missing.TimeSeries':
        return <Graphic type="Timeseries" />;

      case 'Missing.Events':
        return <Graphic type="Events" />;

      case 'Missing.Datapoints':
        return <Icon type="ExclamationMark" />;
      case 'Missing.3D':
        return <Icon type="Cube" />;
      case 'Loading':
        return <Icon type="Loader" />;
      case 'Error':
        return <Icon type="Warning" />;
      default:
        return null;
    }
  };
  return (
    <StatusMessageWrapper>
      <div className="image">{renderGraphic()}</div>
      <div className="message">{message}</div>
    </StatusMessageWrapper>
  );
};

export default StatusMessage;
