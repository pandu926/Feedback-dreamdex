import fs from 'node:fs';
import {SomniaMarkets,SOMNIA_HIDEKI_TESTNET_ADDRESSES} from '@somnia-chain/markets-sdk';
import {hidekiTestnet} from '@somnia-chain/markets-sdk/chains';
const indexerUrl='https://hideki-dev.smk.somnia.host/v1/graphql';
const exchange=new SomniaMarkets({chain:hidekiTestnet,indexerUrl,addresses:SOMNIA_HIDEKI_TESTNET_ADDRESSES});
const out={sdk:'0.32.1',chainId:50383,indexerUrl,scope:'read-only reproduction of SDK docs/PERPS.md one-shot example',checks:[]};
const timer=setTimeout(()=>{console.log('Read deadline exceeded');process.exit(1)},30000);
try{
const perps=await exchange.client.listPerpMarkets({baseSymbol:'WBTC',limit:20});out.checks.push({name:'documented WBTC query',count:perps.length});
try{const one=await exchange.client.getPerpMarket(perps[0].id);out.checks.push({name:'documented dereference',returned:one?.id});}catch(e){out.checks.push({name:'documented dereference',error:{name:e.name,message:e.message}});}
const btc=await exchange.client.listPerpMarkets({baseSymbol:'BTC',limit:20});out.checks.push({name:'BTC control',count:btc.length,symbols:btc.map(m=>m.baseSymbol)});
}finally{try{await exchange.close()}catch{}clearTimeout(timer);const json=JSON.stringify(out,null,2);fs.writeFileSync(new URL('./wbtc-doc-example-results.json',import.meta.url),json);console.log(json);process.exit(0);}
