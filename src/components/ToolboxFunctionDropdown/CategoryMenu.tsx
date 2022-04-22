import { Operation } from '@cognite/calculation-backend';
import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { sortBy } from 'lodash';
import { useCanvasSize } from 'components/NodeEditor/V2/CanvasContext';
import FunctionsList from './FunctionsList';

const CategoryMenu = ({
  selectedCategory,
  categories,
  setSelectedCategory,
  onFunctionClick,
  onInfoButtonClick,
}: {
  selectedCategory?: string;
  categories: { [key: string]: Operation[] };
  setSelectedCategory: (category: string) => void;
  onFunctionClick: (event: React.MouseEvent, func: Operation) => void;
  onInfoButtonClick: (func: Operation) => void;
}) => {
  const functionsByCategory = Object.entries(categories).map(
    ([category, toolFunctions]) => ({
      category,
      toolFunctions,
    })
  );

  const sortedFunctionsByCategory = sortBy(functionsByCategory, ['category']);

  const canvasSize = useCanvasSize();
  const maxHeight =
    typeof canvasSize.height === 'number' ? canvasSize.height - 5 : 615;

  return (
    <Menu style={{ boxShadow: 'none' }}>
      {/* Recent category */}
      {!!categories.Recent.length && (
        <>
          <Menu.Submenu
            content={
              <Menu style={{ maxHeight, overflowY: 'auto' }}>
                <FunctionsList
                  category="Recent"
                  operations={categories.Recent}
                  onFunctionClick={onFunctionClick}
                  onInfoButtonClick={onInfoButtonClick}
                />
              </Menu>
            }
          >
            <span>Recent</span>
          </Menu.Submenu>
          <Menu.Divider />
        </>
      )}
      {/* Toolbox function categories */}
      {sortedFunctionsByCategory
        .filter(({ category }) => category !== 'Recent')
        .map(
          ({ category, toolFunctions }) =>
            !!toolFunctions.length && (
              <CategoryItemWrapper
                tabIndex={0}
                role="button"
                onClick={() => setSelectedCategory(category)}
                onKeyDown={() => setSelectedCategory(category)}
              >
                <Menu.Submenu
                  key={category}
                  visible={selectedCategory === category}
                  trigger={undefined}
                  content={
                    <Menu style={{ maxHeight, overflowY: 'auto' }}>
                      <FunctionsList
                        category={category}
                        operations={toolFunctions}
                        onFunctionClick={onFunctionClick}
                        onInfoButtonClick={onInfoButtonClick}
                      />
                    </Menu>
                  }
                >
                  <CategoryItem style={{ width: '100%', textAlign: 'left' }}>
                    {category}
                  </CategoryItem>
                </Menu.Submenu>
              </CategoryItemWrapper>
            )
        )}
    </Menu>
  );
};

const CategoryItemWrapper = styled.div``;

const CategoryItem = styled.div`
  height: 100%;
  width: 100%;
  text-align: left;
`;

export default CategoryMenu;
