/* Keeping this file around as long as we want to keep the inspector view */

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ViewButton } from 'components/buttons';
import { showErrorMessage } from 'components/toast';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { usePreviewedDocuments } from 'modules/documentSearch/selectors';
import { clearSelectedDocument } from 'modules/map/actions';

import { BUTTON_TEXT, NO_ITEMS_ADDED_TEXT } from './constants';

export const InspectButton: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const previewedDocuments = usePreviewedDocuments();
  const metrics = useGlobalMetrics('documents');
  const { t } = useTranslation('Search');

  const handleClick = () => {
    if (previewedDocuments.length === 0) {
      showErrorMessage(t(NO_ITEMS_ADDED_TEXT));
    } else {
      dispatch(clearSelectedDocument());
      history.push(navigation.SEARCH_DOCUMENTS_INSPECT);
      metrics.track('click-open-document-inspector-button');
    }
  };

  return (
    <ViewButton
      variant="inverted"
      text={t(BUTTON_TEXT)}
      tooltip={t('Inspect the selected documents')}
      onClick={handleClick}
      data-testid="document-inspect-button"
      aria-label="Inspect Document"
    />
  );
};
