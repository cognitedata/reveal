import React, { useState } from 'react';
import styled from 'styled-components';
import { DatePicker } from './DatePicker';

export default {
  title: 'Component/DatePicker',
  component: DatePicker,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const [date, setDate] = useState<Date>(new Date());
  return <DatePicker initialDate={date} onDateChanged={setDate} />;
};

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
