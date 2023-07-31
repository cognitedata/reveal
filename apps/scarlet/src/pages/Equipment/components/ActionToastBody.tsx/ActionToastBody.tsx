import { ToastContentProps } from 'react-toastify';
import { Button } from '@cognite/cogs.js';

type Props = { toastProps: ToastContentProps; action: () => void };

export const ActionToastBody = ({ toastProps, action }: Props) => (
  <div>
    <h3>Failed to load documents</h3>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        type="secondary"
        onClick={() => {
          if (toastProps.closeToast) {
            toastProps.closeToast();
          }
        }}
        style={{ marginRight: 8 }}
      >
        Cancel
      </Button>
      <Button type="primary" onClick={action}>
        Retry
      </Button>
    </div>
  </div>
);
