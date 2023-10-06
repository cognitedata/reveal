import React, { useRef, useState, useEffect } from 'react';

import styled from 'styled-components';

import { Menu, Button } from '@cognite/cogs.js';

import Layers from '../../../utils/zindex';

type FileMenuProps = {
  options: React.ReactNode[];
};

export const FilterMenu = ({ options }: FileMenuProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        onClick={() => {
          setShowFilterMenu(true);
        }}
        data-cy="more-filters-button"
      >
        More filters
      </Button>
      {showFilterMenu && (
        <StyledMenu>
          {options.map((option, index) => (
            <React.Fragment key={`menu-filter-${String(index)}`}>
              {option}
            </React.Fragment>
          ))}
        </StyledMenu>
      )}
    </div>
  );
};

const StyledMenu = styled(Menu)`
  position: absolute;
  z-index: ${Layers.POPOVER};
  & > :not(:last-child) {
    margin-bottom: 8px;
  }
`;
