import { ReactElement } from 'react';
import styled from 'styled-components';
import { Title, Flex, Button } from '@cognite/cogs.js';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { createLink, getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common/i18n';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
interface NewHeaderProps {
  title: string | JSX.Element;
  rightItem?: ReactElement;
  leftItem?: ReactElement;
  ornamentColor?: string;
  help?: string;
}

const NewHeader = ({ title, rightItem, help }: NewHeaderProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  const { appPath } = useParams<{ appPath?: string }>();

  const handleGoToDatasets = () => {
    if (location.key === 'default') {
      navigate(createLink(`/${appPath}`));
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <Flex justifyContent="space-between" style={{ padding: '10px 0' }}>
        <Flex alignItems="center" gap={8}>
          <Button
            icon="ArrowLeft"
            onClick={handleGoToDatasets}
            type="secondary"
          >
            {t('data-set_other')}
          </Button>
          <Title level="4">{title}</Title>
        </Flex>
        <Flex alignItems="center" gap={8}>
          {rightItem && <span>{rightItem}</span>}
          <Button
            icon="ExternalLink"
            type="ghost"
            href={help}
            target="_blank"
            onClick={() => {
              trackEvent('Applications.OperationSupport.Assets.Clicked help', {
                url: help,
                projectName: getProject(),
              });
            }}
          >
            {t('help')}
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default NewHeader;
