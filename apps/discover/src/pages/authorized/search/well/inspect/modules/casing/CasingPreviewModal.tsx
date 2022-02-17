import React from 'react';

import { BaseButton } from 'components/buttons';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useNptEventsForCasings } from 'modules/wellSearch/selectors';

import CasingView from './CasingView/CasingView';
import { CasingPreviewFooter, CasingPreviewModalWrapper } from './elements';
import { FormattedCasings } from './interfaces';

type Props = {
  onClose: () => void;
  casing: FormattedCasings;
};

export const CasingPreviewModal: React.FC<Props> = ({ onClose, casing }) => {
  const { isLoading: isEventsLoading, events } = useNptEventsForCasings();
  const { data: preferredUnit } = useUserPreferencesMeasurement();

  const footer = (
    <CasingPreviewFooter>
      <BaseButton
        type="secondary"
        text="Close"
        aria-label="Close"
        onClick={onClose}
      />
    </CasingPreviewFooter>
  );

  return (
    <CasingPreviewModalWrapper
      appElement={document.getElementById('root') || undefined}
      visible
      onCancel={onClose}
      footer={footer}
    >
      {preferredUnit && (
        <CasingView
          key={`${casing.key}-casing-key`}
          wellName={casing.wellName}
          wellboreName={casing.wellboreName}
          casings={casing.casings}
          unit={preferredUnit}
          events={events[casing.key]}
          isEventsLoading={isEventsLoading}
        />
      )}
    </CasingPreviewModalWrapper>
  );
};

export default CasingPreviewModal;
