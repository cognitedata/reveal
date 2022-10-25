import { PropsWithChildren } from 'react';
import { CogDataList } from './cog-data-list';
import { v4 as generateId } from 'uuid';

export default {
  title: 'Basic components/CogDataList',
  component: CogDataList,
};

const Wrapper = (props: PropsWithChildren) => {
  return (
    <div
      style={{
        height: '600px',
        width: '328px',
      }}
    >
      {props.children}
    </div>
  );
};

export const Base = () => {
  const values = Array.from({ length: 100 }, () => generateId());

  return (
    <Wrapper>
      <CogDataList listData={values} />
    </Wrapper>
  );
};

export const FewerValues = () => {
  const values = Array.from({ length: 5 }, () => generateId());

  return (
    <Wrapper>
      <CogDataList listData={values} />
    </Wrapper>
  );
};
