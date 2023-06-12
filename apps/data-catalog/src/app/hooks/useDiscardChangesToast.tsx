import { Button, toast } from '@cognite/cogs.js';
import { useTranslation } from 'common/i18n';
import styled from 'styled-components';

export default ({ onDiscardClick }: { onDiscardClick: () => void }) => {
  const { t } = useTranslation();

  const DiscardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="destructive"
        size="small"
        onClick={() => {
          onDiscardClick();
          toast.dismiss('navigateAway');
        }}
      >
        {t('discard-changes')}
      </Button>
    </div>
  );

  const ButtonCloseDiscardChangesToast = ({
    closeToast,
  }: {
    closeToast: () => void;
  }) => (
    <StyledToastCloseButton
      aria-label="Keep editing"
      onClick={closeToast}
      size="small"
      icon="Close"
      type="ghost"
    />
  );

  const open = () => {
    toast.warning(
      <div>
        <h3>Warning</h3>
        {t('you-have-unsaved-changes-are-you-sure-you-want-to-navigate-away')}
        {DiscardChangesButton}
      </div>,
      {
        autoClose: false,
        closeButton: ButtonCloseDiscardChangesToast,
        closeOnClick: false,
        toastId: 'navigateAway',
      }
    );
  };

  return open;
};

/* 
Using two unfortunate hacks here to override the Toast's styles which set color on all
icons inside the toast and make our close icon orange:
1. && makes the styles more specific
2. selecting .cogs-icon class sets the proper color on the close icon

Fortunately there's a new Cogs Toast component in the works
*/
const StyledToastCloseButton = styled(Button)`
  align-self: flex-start;

  && {
    .cogs-icon {
      color: var(--cogs-text-icon--strong);
    }
  }
`;
