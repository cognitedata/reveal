import { ButtonProps, Input, SegmentedControl } from '@cognite/cogs.js';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
  totalPages: number;
  pageSize: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
}) => {
  const { currentPage, totalPages, pageSize, setCurrentPage, setPageSize } =
    props;
  const [tempCurrentPage, setTempCurrentPage] = useState(currentPage);
  const pageOptionButtons = getPageOptionButtons(currentPage, totalPages);

  const handleButtonClicked = (key: string | number) => {
    switch (key) {
      case 'Start':
        setCurrentPage(1);
        setTempCurrentPage(1);
        break;
      case 'End':
        setCurrentPage(totalPages);
        setTempCurrentPage(totalPages);
        break;
      default:
        setCurrentPage(+key);
        setTempCurrentPage(+key);
    }
  };

  useEffect(() => {
    if (tempCurrentPage > 0 && tempCurrentPage <= totalPages)
      setCurrentPage(tempCurrentPage);
  }, [tempCurrentPage]);

  return (
    <Container>
      <SegmentedControl
        onButtonClicked={handleButtonClicked}
        currentKey={`${currentPage}`}
        style={{ height: '26px' }}
      >
        {pageOptionButtons}
      </SegmentedControl>
      <Input
        type="number"
        width={64}
        size="small"
        style={{ height: '26px', MozAppearance: 'textfield' }}
        value={tempCurrentPage}
        min={1}
        max={totalPages}
        step={1}
        setValue={setTempCurrentPage}
        onChange={(newValue) =>
          setTempCurrentPage(parseInt(newValue.target.value, 10))
        }
      />
      <Input
        type="number"
        width={64}
        size="small"
        style={{ height: '26px', MozAppearance: 'textfield' }}
        value={pageSize}
        min={CONSTS.MIN_PAGE_SIZE}
        max={CONSTS.MAX_PAGE_SIZE}
        step={1}
        setValue={setPageSize}
        onChange={(newValue) => {
          setPageSize(parseInt(newValue.target.value, 10));
        }}
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
