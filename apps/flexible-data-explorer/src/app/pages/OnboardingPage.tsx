import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { DataModelSelectorModal } from '../containers/modals/DataModelSelectorModal';
import { Page } from '../containers/page/Page';
import { useDataModelLocalStorage } from '../hooks/useLocalStorage';
import { useNavigation } from '../hooks/useNavigation';
import { useTranslation } from '../hooks/useTranslation';

export const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const [selectedDataModel] = useDataModelLocalStorage();
  const [siteSelectionVisible, setSiteSelectionVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (selectedDataModel) {
      navigate.toHomePage(
        selectedDataModel.space,
        selectedDataModel.dataModel,
        selectedDataModel.version
      );
    } else {
      setSiteSelectionVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataModel]);

  return (
    <Page>
      <Page.Body>
        <Container>
          <Button
            type="secondary"
            onClick={() => setSiteSelectionVisible(true)}
          >
            {t('ONBOARDING_PAGE_TOGGLE_DATA_MODEL_BUTTON')}
          </Button>
        </Container>
      </Page.Body>

      <DataModelSelectorModal
        isVisible={siteSelectionVisible}
        onModalClose={() => setSiteSelectionVisible(false)}
        isClosable
      />
    </Page>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
