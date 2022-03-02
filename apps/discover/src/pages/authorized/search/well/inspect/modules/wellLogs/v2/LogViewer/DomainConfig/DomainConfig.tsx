import React, { useState } from 'react';

import styled from 'styled-components/macro';

import { Input } from '@cognite/cogs.js';

import ClickAwayListener from 'components/clickAwayListener';
import { FlexRow, sizes, Relative } from 'styles/layout';

import { Panel, Row, Seperator } from './elements';

export type Domain = {
  name: string;
  min: number;
  max: number;
};

export const NumberInputWrapper = styled(FlexRow)`
  margin-right: ${sizes.small};
  input {
    width: 100px;
  }
  max-width: 101px;
`;

export type DomainMap = { [key: string]: number[] };

interface Props {
  /** An array of selectable options (NB: when using standard render, the objects needs to include a selected field.) */
  domainList: Domain[];
  /** This functions handles the single select click */
  handleChange: (row: string, minMax: string, value: number) => void;
}
export const DomainConfig: React.FC<Props> = ({
  children,
  domainList = [],
  handleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDisplayToggle = () => {
    setIsOpen((v) => !v);
  };
  const handleClose = () => setIsOpen(false);

  return (
    <Relative>
      {React.isValidElement(children) &&
        React.cloneElement(children, { onClick: handleDisplayToggle })}

      {isOpen && (
        <ClickAwayListener onClickAway={handleClose}>
          <div>
            <Panel elevation={6}>
              {domainList.map((item) => {
                return (
                  <Row key={item.name}>
                    <NumberInputWrapper>
                      <Input
                        title={item.name}
                        type="number"
                        value={item.min}
                        onChange={(event: any) =>
                          handleChange(
                            item.name,
                            'min',
                            Number(event.target.value)
                          )
                        }
                      />
                    </NumberInputWrapper>
                    <Seperator />
                    <NumberInputWrapper>
                      <Input
                        title="&nbsp;"
                        type="number"
                        value={item.max}
                        onChange={(event: any) =>
                          handleChange(
                            item.name,
                            'max',
                            Number(event.target.value)
                          )
                        }
                      />
                    </NumberInputWrapper>
                  </Row>
                );
              })}
            </Panel>
          </div>
        </ClickAwayListener>
      )}
    </Relative>
  );
};
