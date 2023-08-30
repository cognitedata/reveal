import styled from 'styled-components';

import { Button, ButtonProps, Chip, Flex, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';
import { Section } from '../../types';
import { trackUsage } from '../../utils/metrics';

import { CategoryId, ItemWithSection } from './types';

type CategoriesProps = {
  items: ItemWithSection[];
  onChange: (section: CategoryId) => void;
  sections: Section['internalId'][];
  selected: CategoryId;
};

const Categories = ({
  items,
  onChange,
  sections,
  selected,
}: CategoriesProps) => {
  const { t } = useTranslation();

  const handleCategoryItemClick = (section: CategoryId) => {
    trackUsage({ e: 'Navigation.AllApps.Filter.Click', filter: section });
    onChange(section);
  };

  return (
    <StyledContainer>
      <Title level={6}>{t('categories')}</Title>
      <Flex gap={4} direction="column">
        <CategoryItem
          onClick={() => handleCategoryItemClick('All')}
          toggled={selected === 'All'}
          count={items.length}
          title={t('text-all')}
        />
        {sections.map((section) => {
          const count = items.filter((it) => it.section === section).length;
          return (
            <CategoryItem
              disabled={!count}
              onClick={() => handleCategoryItemClick(section)}
              toggled={selected === section}
              count={count}
              title={t(`section-navtitle-${section}`)}
              key={`cdf-app-category-${section}`}
            />
          );
        })}
      </Flex>
    </StyledContainer>
  );
};

type ItemProps = {
  count: number;
  title: string;
} & Pick<ButtonProps, 'disabled' | 'onClick' | 'toggled'>;

const CategoryItem = ({
  count,
  disabled,
  onClick,
  title,
  toggled,
}: ItemProps) => (
  <StyledButton
    disabled={disabled}
    onClick={onClick}
    toggled={toggled}
    type="ghost"
  >
    <span>{title}</span>
    <Chip label={`${count}`} selectable size="x-small" />
  </StyledButton>
);

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 270px;
  width: 270px;
`;

const StyledButton = styled(Button)`
  &&& {
    display: flex;
    justify-content: space-between;
  }
`;

export default Categories;
