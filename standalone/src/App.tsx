import React, { useState } from "react";
import "./App.css";
// import { Trajectory } from "./Trajectory";
import { SimpleTabs } from "./SimpleTabs";
import { Provider } from "react-redux";
import { store } from "./store";
import { BPDataModule } from "@cognite/node-visualizer";

function App()
{
  const [data, setData] = useState<BPDataModule>(null);

  const loadNewData = () => {

    if (data !== null) {
      setData(null);
      return;
    }
    Promise.all([
      import("./mockdata/sample/wells.json"),
      import("./mockdata/sample/wellbores.json"),
      import("./mockdata/sample/trajectories.json"),
      import("./mockdata/sample/trajectoryData.json"),
    ])
    .then(
      ([
         wellsJson,
         wellBoresJson,
         trajectoriesJson,
         trajectoryDataJson,
       ]) => {
        const module = new BPDataModule();
        module.setModuleData({
          wells: wellsJson.default,
          wellBores: wellBoresJson.default,
          trajectories: trajectoriesJson.default,
          trajectoryData: trajectoryDataJson.default,
        });
        setData(module);
      }
    )
    .catch((err) => {
      // tslint:disable-next-line:no-console
      console.error(`Sample Data not found for standalone app!`, err);
    });
  };

  return (
    <Provider store={ store }>
      <div className="App">
        <SimpleTabs data={data} onLoadData={loadNewData}/>
        {/*<Trajectory />*/}
      </div>
    </Provider>
  );
}

export default App;
