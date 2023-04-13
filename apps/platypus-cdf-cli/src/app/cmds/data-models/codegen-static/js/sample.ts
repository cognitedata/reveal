import { FDMQueryClientBuilder } from './index';

const client = FDMQueryClientBuilder.fromToken();

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
