// if there's an error here, ensure you have installed `@cognite/fdm-client`
// @ts-nocheck
import { FDMQueryClientBuilder } from './index';

const client = FDMQueryClientBuilder.fromToken();

// for guide on how to use this, checkout https://npmjs.com/package/@cognite/fdm-client
client
  .runQuery({
    // listXXX: {
    //   items: {
    //     __scalar:true
    //   },
    // },
  })
  .then((res) => {
    // console.log(res.data.data.listXXX?.items)
  });
