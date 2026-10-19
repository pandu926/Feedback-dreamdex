import fs from 'node:fs';
import {SomniaMarkets,SOMNIA_HIDEKI_TESTNET_ADDRESSES} from '@somnia-chain/markets-sdk';
import {hidekiTestnet} from '@somnia-chain/markets-sdk/chains';
const indexerUrl='https://hideki-dev.smk.somnia.host/v1/graphql';
const exchange=new SomniaMarkets({chain:hidekiTestnet,indexerUrl,addresses:SOMNIA_HIDEKI_TESTNET_ADDRESSES});
const scope={pool:'0x0f464d57c1fd839e4d87a408bbccdab8f77e6394',account:'0x38c01adebdd275f8bec6b41245d63e273b01bad4',status:['PENDING','TRIGGERED','TRIGGER_FAILED','CANCELLED']};
const report={sdk:'0.32.1',chainId:50383,indexerUrl,scope,note:'Read-only account/pool-scoped public SDK calls; no signer; non-finite inputs labeled as strings because JSON itself cannot represent them',results:[]};
const timeout=setTimeout(()=>{console.log('Read deadline exceeded');process.exit(1)},30000);
try{
for(const [label,limit]of [['1',1],['NaN',NaN],['Infinity',Infinity]]){
 try{const rows=await exchange.client.listPerpStopOrders({...scope,limit});report.results.push({limit:label,rows:rows.length});}
 catch(e){report.results.push({limit:label,error:{name:e.name,message:e.message}});}
}
}finally{try{await exchange.close()}catch{}clearTimeout(timeout);const json=JSON.stringify(report,null,2);fs.writeFileSync(new URL('./nonfinite-pagination-results.json',import.meta.url),json);console.log(json);process.exit(0);}
