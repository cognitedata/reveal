import { Operation } from '@cognite/calculation-backend';
import { Menu } from '@cognite/cogs.js';
import FunctionsList from './FunctionsList';

const SearchResultMenu = ({
  phrase,
  categories,
  onFunctionClick,
  onInfoButtonClick,
}: {
  phrase: string;
  categories: {
    [key: string]: Operation[];
  };
  onFunctionClick: (event: React.MouseEvent, func: Operation) => void;
  onInfoButtonClick: (func: Operation) => void;
}) => (
  <Menu>
    {Object.keys(categories).map((category: string) => {
      const filtered = categories[category].filter(
        ({ name, category: functionCategory, description }) =>
          `${name} ${functionCategory} ${description}`
            ?.toLowerCase()
            .includes(phrase?.toLowerCase())
      );

      return (
        !!filtered.length && (
          <FunctionsList
            key={category}
            category={category}
            toolFunctions={filtered}
            onFunctionClick={onFunctionClick}
            onInfoButtonClick={onInfoButtonClick}
          />
        )
      );
    })}
  </Menu>
);

export default SearchResultMenu;
