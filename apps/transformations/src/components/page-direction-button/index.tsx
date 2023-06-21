import { useTranslation } from '@transformations/common';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

const PageDirectionButton = (): JSX.Element => {
  const { t } = useTranslation();

  const { pageDirection, setPageDirection } = useTransformationContext();

  return (
    <Dropdown
      hideOnSelect={{
        hideOnContentClick: true,
        hideOnOutsideClick: true,
      }}
      content={
        <Menu>
          <Menu.Item
            icon="SplitView"
            iconPlacement="left"
            onClick={() => setPageDirection('horizontal')}
            toggled={pageDirection === 'horizontal'}
          >
            {t('vertical-view')}
          </Menu.Item>
          <Menu.Item
            icon="SplitViewHorizontal"
            iconPlacement="left"
            onClick={() => setPageDirection('vertical')}
            toggled={pageDirection === 'vertical'}
          >
            {t('horizontal-view')}
          </Menu.Item>
        </Menu>
      }
    >
      <Button icon="Boards" size="small" />
    </Dropdown>
  );
};

export default PageDirectionButton;
