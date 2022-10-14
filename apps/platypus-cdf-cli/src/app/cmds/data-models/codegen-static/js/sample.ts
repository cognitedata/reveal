// if there's an error here, ensure you have installed `@cognite/fdm-client`
import { FDMQueryClientBuilder, everything } from '@cognite/fdm-client';

const client = FDMQueryClientBuilder.fromToken();

// for guide on how to use this, checkout https://npmjs.com/package/@cognite/fdm-client
client
  .runQuery({
    // listXXX: {
    //   items: {
    //     ...everything
    //   },
    // },
  })
  .then((res) => {
    // console.log(res.data.data.listXXX?.items)
  });
