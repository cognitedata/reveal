import { useParams } from 'react-router-dom';

import { useTranslation } from '@transformations/common';
import { createInternalLink } from '@transformations/utils';
import { useCdfUserHistoryService } from '@user-history';

import { Menu } from '@cognite/cogs.js';

type Props = {
  transformationId: number;
  transformationName: string;
  onClick: () => void;
};

export const RunNowItem = ({
  transformationId,
  transformationName,
  onClick,
}: Props) => {
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const { t } = useTranslation();
  const userHistoryService = useCdfUserHistoryService();

  const handleLogNewResourceEdit = () => {
    if (subAppPath && transformationName) {
      userHistoryService.logNewResourceEdit({
        application: subAppPath,
        name: transformationName,
        path: createInternalLink(`${transformationId}`),
      });
    }
  };

  return (
    <Menu.Item
      key="personal-credentials"
      onClick={() => {
        onClick();
        handleLogNewResourceEdit();
      }}
    >
      {t('run-as-current-user')}
    </Menu.Item>
  );
};
