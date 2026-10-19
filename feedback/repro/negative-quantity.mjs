import fs from 'node:fs';
import {SomniaMarkets,SOMNIA_HIDEKI_TESTNET_ADDRESSES} from '@somnia-chain/markets-sdk';
import {hidekiTestnet} from '@somnia-chain/markets-sdk/chains';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
const exchange=new SomniaMarkets({chain:hidekiTestnet,indexerUrl:'https://hideki-dev.smk.somnia.host/v1/graphql',addresses:SOMNIA_HIDEKI_TESTNET_ADDRESSES});
const account=privateKeyToAccount(generatePrivateKey()).address;
const report={sdk:'0.32.1',chainId:50383,scope:'read-only public SDK preview calls; freshly generated address; no signer supplied',account,cases:[]};
const guard=setTimeout(()=>{fs.writeFileSync(new URL('./negative-quantity-results.json',import.meta.url),JSON.stringify(report,(_,v)=>typeof v==='bigint'?v.toString():v,2));process.exit(1)},45000);
try{
const a=await exchange.client.listPerpMarkets({baseSymbol:'BTC'});if(!a.length)throw Error('BTC missing');const market=a[0];
for(const [name,quantity,price]of [['positive-control',100000n,100000n*10n**18n],['negative-quantity',-100000n,100000n*10n**18n],['zero-quantity',0n,100000n*10n**18n]]){
 try{const value=await exchange.client.previewPerpOrderMargin({pool:market.poolAddress,marginBank:market.marginBank,account,isBid:true,quantity,price});report.cases.push({name,input:{quantity,price},value});}
 catch(e){report.cases.push({name,error:{name:e.name,message:e.message}});}
}
}catch(e){report.error={name:e.name,message:e.message};}
finally{try{await exchange.close();}catch{}clearTimeout(guard);const json=JSON.stringify(report,(_,v)=>typeof v==='bigint'?v.toString():v,2);fs.writeFileSync(new URL('./negative-quantity-results.json',import.meta.url),json);console.log(json);process.exit(0);}
