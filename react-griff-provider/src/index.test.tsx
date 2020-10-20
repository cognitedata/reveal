import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { DataProvider, useDataContext, useScalerContext } from '.';

describe('DataProvider tests', () => {
  it('Should find the correct exports', () => {
    expect(DataProvider).toBeDefined();
  });

  it('should be able to create basic DataProvider with hook', async () => {
    const MyApp: React.FC = () => {
      const dataContext = useDataContext();
      const scalerContext = useScalerContext();
      useEffect(() => {
        dataContext.registerSeries({
          id: '1',
          data: [],
          xAccessor: (d) => d.x as number,
          yAccessor: (d) => d.value as number,
          timeAccessor: (d) => d.timestamp as number,
          loader: () =>
            Promise.resolve({
              id: '1',
              data: [],
              xAccessor: (d) => d.x as number,
              yAccessor: (d) => d.value as number,
              timeAccessor: (d) => d.timestamp as number,
            }),
        });
        scalerContext.updateDomains({}, () => null);
      }, []);
      return (
        <div>
          {`${dataContext.series.length.toString()}-${scalerContext.series.length.toString()}`}
        </div>
      );
    };

    const App: React.FC = () => (
      <DataProvider timeDomain={[0, 1]}>
        <MyApp />
      </DataProvider>
    );

    render(<App />);

    const elm = await screen.findAllByText(/1-1/); // <div>1-1</div> <- we print series length for both data and scaler

    expect(elm).toHaveLength(1);
  });
});
