import { Detail } from '@cognite/cogs.js';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SECTIONS } from 'types';

import { Header, PanelContent, StyledSearch, StyledButton } from './elements';

type Props = {
  onNavigate?: (
    section: typeof SECTIONS.TOTAL | typeof SECTIONS.PRICE_SCENARIOS | string
  ) => void;
  onSearch?: (term: string, clear?: boolean) => void;
  total: { url: string; current: boolean };
  priceScenarios: { url: string; current: boolean };
  methodPerformance: { url: string; current: boolean };
  plants: {
    name: string;
    externalId: string;
    url: string;
    current: boolean;
  }[];
};

export const Sidebar = ({
  plants,
  total,
  priceScenarios,
  methodPerformance,
  onSearch,
  onNavigate,
}: Props) => {
  const [query, setQuery] = useState('');

  const filteredPlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleClearQuery = () => {
    if (query === '') return;
    onSearch?.('', true);
    setQuery('');
  };

  const handleNavigate = (section: string) => {
    handleClearQuery();
    onNavigate?.(section);
  };

  return (
    <>
      <Header>
        <StyledSearch
          data-testid="plant-search-input"
          icon="Search"
          placeholder="Search plants"
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          value={query}
          clearable={{ callback: handleClearQuery }}
        />
      </Header>
      <PanelContent>
        <Detail>Price area overview</Detail>
        <NavLink to={total.url} onClick={() => handleNavigate(SECTIONS.TOTAL)}>
          <StyledButton toggled={total.current} key={SECTIONS.TOTAL}>
            <p>Total</p>
          </StyledButton>
        </NavLink>
        <NavLink
          to={priceScenarios.url}
          onClick={() => handleNavigate(SECTIONS.PRICE_SCENARIOS)}
        >
          <StyledButton
            toggled={priceScenarios.current}
            key={SECTIONS.PRICE_SCENARIOS}
          >
            <p>Price Scenarios</p>
          </StyledButton>
        </NavLink>
        <NavLink
          to={methodPerformance.url}
          onClick={() => handleNavigate(SECTIONS.BENCHMARKING)}
        >
          <StyledButton
            toggled={methodPerformance.current}
            key={SECTIONS.BENCHMARKING}
          >
            <p>Method Performance</p>
          </StyledButton>
        </NavLink>
        <Detail>Plants</Detail>
        {filteredPlants.map(({ name, url, current, externalId }) => (
          <NavLink
            to={url}
            key={externalId}
            onClick={() => handleNavigate(externalId)}
          >
            <StyledButton toggled={current} key={externalId}>
              <p>{name}</p>
            </StyledButton>
          </NavLink>
        ))}
      </PanelContent>
    </>
  );
};
