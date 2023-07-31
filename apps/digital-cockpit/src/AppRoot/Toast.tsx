import { Button } from '@cognite/cogs.js';
import { ToastActionType } from 'store/notification/types';

type Props = {
  title: string;
  message?: string;
  actions?: ToastActionType[];
};

const Toast = (props: Props) => {
  const { actions = [], title, message = '' } = props;
  const hasActions = !!actions?.length;
  const renderActionButton = (action: ToastActionType) => {
    if (action === 'reload') {
      return (
        <Button
          onClick={() => document.location.reload()}
          style={{ margin: '10px 4px 0' }}
          type="primary"
          key={new Date().getTime()}
        >
          Reload
        </Button>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <h3>{title}</h3>
      <h4>{message}</h4>
      {hasActions && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {actions.map((act) => renderActionButton(act))}
        </div>
      )}
    </div>
  );
};

export default Toast;
