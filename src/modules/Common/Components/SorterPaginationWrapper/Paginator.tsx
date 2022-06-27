/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { ButtonProps, SegmentedControl } from '@cognite/cogs.js';
import { InputNumber } from 'antd';
import * as CONSTS from 'src/constants/PaginationConsts';
import styled from 'styled-components';

const getPageOptions = (currentPage: number, totalPages: number): number[] => {
  const options: number[] = [];
  const validatePageNumber = (page: number) => page > 0 && page <= totalPages;
  const addPage = (page: number) => {
    if (!options.includes(page) && validatePageNumber(page)) options.push(page);
  };
  for (let i = 1; ; i++) {
    addPage(currentPage - i);
    addPage(currentPage);
    addPage(currentPage + i);
    if (
      (totalPages < CONSTS.MAX_NUMBER_OF_PAGE_BTNS &&
        options.length === totalPages) ||
      options.length >= CONSTS.MAX_NUMBER_OF_PAGE_BTNS
    )
      return options.sort((a, b) => a - b);
  }
};

const getPageOptionButtons = (
  currentPage: number,
  totalPages: number
): React.ReactElement<ButtonProps>[] => {
  const pageOptions: number[] = getPageOptions(currentPage, totalPages);

  // add number buttons
  const pageOptionButtons: React.ReactElement<ButtonProps>[] = pageOptions.map(
    (page: number) =>
      (
        <SegmentedControl.Button
          key={page}
          title={`${page}`}
          size="small"
          style={{ height: '22px' }}
        >
          {page}
        </SegmentedControl.Button>
      ) as React.ReactElement<ButtonProps>
  );

  // add Start button
  pageOptionButtons.unshift(
    <SegmentedControl.Button
      key="Start"
      icon="ArrowLeft"
      title="Start"
      size="small"
      style={{ height: '22px' }}
      aria-label="start-only-icon"
      disabled={currentPage === 1}
    />
  );

  // add End button
  pageOptionButtons.push(
    <SegmentedControl.Button
      key="End"
      icon="ArrowRight"
      title="End"
      size="small"
      style={{ height: '22px' }}
      aria-label="end-only-icon"
      disabled={currentPage === totalPages}
    />
  );
  return pageOptionButtons;
};

export const Paginator = (props: {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}) => {
  const { currentPage, pageSize, totalPages, setCurrentPage, setPageSize } =
    props;
  const pageOptionButtons = getPageOptionButtons(currentPage, totalPages);

  const handleButtonClicked = (key: string | number) => {
    switch (key) {
      case 'Start':
        setCurrentPage(1);
        break;
      case 'End':
        setCurrentPage(totalPages);
        break;
      default:
        setCurrentPage(+key);
    }
  };

  return (
    <Container>
      <SegmentedControl
        onButtonClicked={handleButtonClicked}
        currentKey={`${currentPage}`}
        style={{ height: '26px', zIndex: 1 }}
      >
        {pageOptionButtons}
      </SegmentedControl>
      <InputNumber
        size="small"
        min={1}
        max={totalPages}
        defaultValue={currentPage}
        value={currentPage}
        onChange={setCurrentPage}
        style={{ backgroundColor: '#ffffff', width: '64px', fontSize: '12px' }}
      />
      <InputNumber
        size="small"
        min={CONSTS.MIN_PAGE_SIZE}
        max={CONSTS.MAX_PAGE_SIZE}
        defaultValue={pageSize}
        value={pageSize}
        onChange={setPageSize}
        style={{ backgroundColor: '#ffffff', width: '64px', fontSize: '12px' }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
`;
