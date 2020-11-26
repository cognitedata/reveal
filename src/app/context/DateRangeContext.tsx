import React, { useContext, useState } from 'react';
import { TIME_SELECT } from 'lib/containers/Timeseries/TimeseriesChart/TimeseriesChart';

export type DateRangeObserver = {
  range: [Date, Date];
  setRange: React.Dispatch<React.SetStateAction<[Date, Date]>>;
};

const DateRangeContext = React.createContext({
  range: TIME_SELECT['2Y'].getTime(),
  setRange: () => {},
} as DateRangeObserver);

export const useDateRange = (): [
  [Date, Date],
  React.Dispatch<React.SetStateAction<[Date, Date]>>
] => {
  const observer = useContext(DateRangeContext);
  return [observer.range, observer.setRange];
};

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [range, setRange] = useState<[Date, Date]>(TIME_SELECT['2Y'].getTime());
  return (
    <DateRangeContext.Provider
      value={{
        range,
        setRange,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};
export default DateRangeContext;
