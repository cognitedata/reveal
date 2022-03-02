import React, { useState } from 'react';

import ClickAwayListener from 'components/clickAwayListener';
import { Relative } from 'styles/layout';

import { DomainFilterRow } from './DomainFilterRow';
import { Panel } from './elements';
import { DomainFilterProps } from './types';

export const DomainFilter: React.FC<DomainFilterProps> = ({
  domainList = [],
  onChangeDomain,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDisplayToggle = () => {
    setIsOpen((isOpen) => !isOpen);
  };
  const handleClose = () => setIsOpen(false);

  return (
    <Relative data-testid="domain-filter">
      {React.isValidElement(children) &&
        React.cloneElement(children, { onClick: handleDisplayToggle })}

      {isOpen && (
        <ClickAwayListener onClickAway={handleClose}>
          <Panel elevation={6}>
            {domainList.map((domainListItem) => {
              return (
                <DomainFilterRow
                  key={domainListItem.columnExternalId}
                  domainListItem={domainListItem}
                  onChangeDomain={onChangeDomain}
                />
              );
            })}
          </Panel>
        </ClickAwayListener>
      )}
    </Relative>
  );
};
