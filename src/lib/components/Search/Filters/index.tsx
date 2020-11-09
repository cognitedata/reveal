import React from 'react';
import { Colors } from '@cognite/cogs.js';

import { ResourceType } from 'lib/types';
import FilterBody from './FilterBody';

const TRANSITION_TIME = 300;
export const SearchResultFilters = ({
  visible,
  currentResourceType,
}: {
  visible: boolean;
  currentResourceType: ResourceType;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        width: visible ? 260 : 0,
        marginTop: 16,
        marginLeft: 1,
        paddingRight: visible ? 16 : 0,
        marginRight: visible ? 16 : 0,
        borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease, padding-right ${TRANSITION_TIME}ms ease, margin-right ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible ? <FilterBody resourceType={currentResourceType} /> : null}
    </div>
  );
};
