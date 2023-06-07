import { Operation } from '@cognite/calculation-backend';
import { Menu } from '@cognite/cogs.js';
import compareVersions from 'compare-versions';
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
        ({ category: functionCategory, versions }) => {
          const latestVersionOfOperation = [...versions].sort((a, b) =>
            compareVersions(b.version, a.version)
          )[0];

          return `${latestVersionOfOperation.name} ${functionCategory} ${latestVersionOfOperation.description}`
            ?.toLowerCase()
            .includes(phrase?.toLowerCase());
        }
      );

      return (
        !!filtered.length && (
          <FunctionsList
            key={category}
            category={category}
            operations={filtered}
            onFunctionClick={onFunctionClick}
            onInfoButtonClick={onInfoButtonClick}
          />
        )
      );
    })}
  </Menu>
);

export default SearchResultMenu;
