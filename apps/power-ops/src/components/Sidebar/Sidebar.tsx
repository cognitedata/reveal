import { Button, Detail } from '@cognite/cogs.js';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  Header,
  PanelContent,
  StyledPanel,
  StyledSearch,
  StyledButton,
  Footer,
} from './elements';

type Props = {
  open: boolean;
  onOpenCloseClick: () => void;
  onNavigate?: (section: 'total' | 'price-scenarios' | string) => void;
  onSearch?: (term: string, clear?: boolean) => void;
  total: { url: string; current: boolean };
  priceScenarios: { url: string; current: boolean };
  plants: {
    name: string;
    externalId: string;
    url: string;
    current: boolean;
  }[];
};

export const Sidebar = ({
  open,
  plants,
  total,
  priceScenarios,
  onSearch,
  onOpenCloseClick,
  onNavigate,
}: Props) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [resize, setResize] = useState(false);

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
    <StyledPanel sidePanelOpened={open}>
      <Header>
        {open ? (
          <StyledSearch
            data-testid="plant-search-input"
            icon="Search"
            placeholder="Search plants"
            autoFocus={focused}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            value={query}
            clearable={{
              callback: handleClearQuery,
            }}
          />
        ) : (
          <Button
            type="secondary"
            aria-label="Open search field"
            icon={open ? 'PanelLeft' : 'PanelRight'}
            onClick={() => {
              onOpenCloseClick();
              setFocused(true);
            }}
          />
        )}
      </Header>
      {open && (
        <PanelContent>
          <Detail>Price area overview</Detail>
          <NavLink to={total.url} onClick={() => handleNavigate('total')}>
            <StyledButton toggled={total.current} key="total">
              <p>Total</p>
            </StyledButton>
          </NavLink>
          <NavLink
            to={priceScenarios.url}
            onClick={() => handleNavigate('price-scenarios')}
          >
            <StyledButton
              toggled={priceScenarios.current}
              key="price-scenarios"
            >
              <p>Price Scenarios</p>
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
      )}
      <Footer onTransitionEnd={() => setResize(!resize)}>
        <Button
          type="secondary"
          aria-label="Show or hide sidebar"
          icon={open ? 'PanelLeft' : 'PanelRight'}
          onClick={() => {
            onOpenCloseClick();
            setFocused(false);
          }}
        >
          {open && 'Hide'}
        </Button>
      </Footer>
    </StyledPanel>
  );
};
