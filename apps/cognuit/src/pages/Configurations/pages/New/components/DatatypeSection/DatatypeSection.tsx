import { useState, useEffect } from 'react';
import { Badge, Icon, Input, Checkbox } from '@cognite/cogs.js';
import { ObjectsRevisionsResponse } from 'types/ApiInterface';

import { CollapsePanel, Container, ExpandButton, Header } from './elements';

type Props = {
  name: string;
  onChange: (selected: number[]) => void;
  objects: ObjectsRevisionsResponse[];
  selectedObjects: number[];
};

const DatatypeSection = ({
  name,
  onChange,
  objects,
  selectedObjects,
}: Props) => {
  const [_filteredObjects, setFilteredObjects] = useState(objects);
  const [expanded, setExpanded] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  useEffect(() => {
    if (filterValue.length === 0) {
      setFilteredObjects(objects);
    } else {
      setFilteredObjects(
        objects.filter((item) => item.name.includes(filterValue))
      );
    }
  }, [filterValue, objects]);
  const expandIcon = (isActive: boolean) => (
    <Icon
      type="ChevronDownCompact"
      style={{
        marginRight: 8,
        transition: 'transform .2s',
        transform: `rotate(${!isActive ? 0 : -180}deg)`,
      }}
    />
  );
  return (
    <Container>
      <Header>
        <Checkbox
          onChange={(nextState: boolean) => {
            if (nextState) {
              onChange(objects.map((item) => item.id));
            } else {
              onChange([]);
            }
          }}
          name={name}
          checked={selectedObjects.length > 0}
        >
          {name}
        </Checkbox>
        <Badge
          text={selectedObjects.length.toString()}
          background="greyscale-grey3"
        />
        <ExpandButton
          aria-label="Expand to see objects"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expandIcon(expanded)}
        </ExpandButton>
      </Header>
      <CollapsePanel expanded={expanded} objectsCount={objects.length}>
        <Input
          variant="noBorder"
          icon="Search"
          iconPlacement="left"
          placeholder="Filter"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          disabled
        />
        {/* Remove tooltip and disabled prop on Checkbox.Group when API is ready */}
        <h4>
          Object selection feature is not implemented yet, but will be in later
          release
        </h4>
        {/* <Tooltip content="Object selection feature is not implemented yet, but will be in later release">
          <Checkbox.Group
            options={filteredObjects.map((object) => ({
              label: object.name,
              value: object.id,
            }))}
            onChange={(value: any) => onChange(value)}
            value={selectedObjects}
            disabled
          />
        </Tooltip> */}
      </CollapsePanel>
    </Container>
  );
};

export default DatatypeSection;
