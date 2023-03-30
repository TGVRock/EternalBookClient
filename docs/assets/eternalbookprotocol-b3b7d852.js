import{C as i,v as p,l as L,f as v,e as o,x as O,y as R,z as T}from"./index-9206b016.js";function F(e){return e?"true":"false"}function H(e){return e.toLocaleString("en")}function C(e,t){return e*1e3+Number(t.toString())}function x(e,t){switch(t){case p.Fast:return e.averageFeeMultiplier;case p.Average:return e.minFeeMultiplier+e.averageFeeMultiplier*.65;case p.Slow:return e.minFeeMultiplier+e.averageFeeMultiplier*.35;case p.Slowest:return e.minFeeMultiplier;case p.Default:default:return i.TX_FEE_MULTIPLIER_DEFAULT}}const l=L(),s=v();async function N(e){const t="announce tx:";if(typeof s.txRepo>"u"){l.logger.error(t,"repository undefined.");return}return e.type===o.TransactionType.AGGREGATE_BONDED?await s.txRepo.announceAggregateBonded(e).toPromise().then(r=>r).catch(r=>{l.logger.error(t,"failed.",r)}):await s.txRepo.announce(e).toPromise().then(r=>r).catch(r=>{l.logger.error(t,"failed.",r)})}async function S(e){const t="get tx info:";if(typeof s.txRepo>"u"){l.logger.error(t,"repository undefined.");return}return await s.txRepo.getTransaction(e,o.TransactionGroup.Confirmed).toPromise().then(r=>r).catch(r=>{l.logger.error(t,"failed.",r)})}async function G(e,t,r){const n={type:t,address:e,group:o.TransactionGroup.Confirmed,pageSize:100,pageNumber:1};return typeof r<"u"&&(n.fromHeight=r),await I(n)}async function I(e){const t="search txes:";if(l.logger.debug(t,"start","page:",e.pageNumber||i.STR_NA),typeof s.txRepo>"u")return l.logger.error(t,"repository undefined."),[];const r=await s.txRepo.search(e).toPromise().then(n=>n).catch(n=>{l.logger.error(t,"failed.",n)});return typeof r>"u"?(l.logger.error(t,"search failed."),[]):r.isLastPage?r.data:(e.pageNumber=typeof e.pageNumber>"u"?2:e.pageNumber+1,r.data.concat(await I(e)))}function U(e,t){return o.TransferTransaction.create(o.Deadline.create(s.epochAdjustment),e.address,[],o.PlainMessage.create(t),s.networkType)}function B(e,t=i.TX_FEE_MULTIPLIER_DEFAULT){return o.HashLockTransaction.create(o.Deadline.create(s.epochAdjustment),new o.Mosaic(new o.NamespaceId(i.TX_XYM_ALIAS),o.UInt64.fromUint(i.TX_HASHLOCK_COST)),o.UInt64.fromUint(480),e,s.networkType).setMaxFee(t)}function X(e,t=i.TX_FEE_MULTIPLIER_DEFAULT){return o.AggregateTransaction.createBonded(o.Deadline.create(s.epochAdjustment),e,s.networkType,[]).setMaxFeeForAggregate(t,0)}function k(e,t=i.TX_FEE_MULTIPLIER_DEFAULT){return o.AggregateTransaction.createComplete(o.Deadline.create(s.epochAdjustment),e,s.networkType,[]).setMaxFeeForAggregate(t,0)}var h=O();const y=new R;function j(e,t=i.CRYPTO_HASH_ALGORITHM){try{return h.createHash(t).update(e).digest("hex")}catch(r){y.error("crypto:","create hash failed",r)}}function Y(e,t,r=i.CRYPTO_CHIPER_ALGORITHM,n=i.CRYPTO_IV_DEFAULT){try{const a=h.createCipheriv(r,n,t),c=a.update(JSON.stringify(e)),d=T.Buffer.concat([c,a.final()]);return d.toString("hex",0,d.length)}catch(a){y.error("crypto:","crypto header failed",a)}}function M(e,t,r=i.CRYPTO_CHIPER_ALGORITHM,n=i.CRYPTO_IV_DEFAULT){try{const a=T.Buffer.from(e,"hex"),c=h.createDecipheriv(r,n,t),d=c.update(a),f=T.Buffer.concat([d,c.final()]);return JSON.parse(f.toString())}catch(a){y.error("crypto:","decrypto header failed",a)}}const u=new R;function V(e,t,r,n,a,c){const d=a||"",f={version:i.PROTOCOL_NAME+" "+i.PROTOCOL_VERSION,mosaicId:e,address:t,prevTx:d.length>0?d:null};return d.length===0&&(f.multipul=!0,f.title=r,f.description=n),typeof c<"u"&&c.length>0&&(f.hash=c),f}function b(e,t){const r="validate inner tx:";if(e.innerTransactions.length===0)return u.debug(r,"inner tx none.",e.transactionInfo),!1;const n=e.innerTransactions.filter(a=>a.type===o.TransactionType.TRANSFER&&t.equals(a.recipientAddress));return e.innerTransactions.length!==n.length?(u.debug(r,"exist not transfer.",e.transactionInfo),!1):!0}function w(e,t){const r="validate protocol header:";return e.version.substring(0,i.PROTOCOL_NAME.length)!==i.PROTOCOL_NAME?(u.debug(r,"invalid protocol.",e),!1):t.id.toHex()!==e.mosaicId||t.ownerAddress.plain()!==e.address?(u.debug(r,"invalid mosaic.",e),!1):!0}async function z(e,t){var A,E,_;const r="get fragment:";if(typeof((A=e==null?void 0:e.transactionInfo)==null?void 0:A.hash)>"u"){u.debug(r,"tx hash undefined.",e);return}const n=await S(e.transactionInfo.hash);if(typeof((E=n==null?void 0:n.transactionInfo)==null?void 0:E.hash)>"u"){u.debug(r,"tx info hash undefined.",e);return}if(n.type!==o.TransactionType.AGGREGATE_COMPLETE&&n.type!==o.TransactionType.AGGREGATE_BONDED){u.debug(r,"tx is not aggregate.",e);return}const a=n;if(!b(a,t.ownerAddress)){u.debug(r,"aggregate tx inner invalid.",a);return}const c=M(a.innerTransactions[i.TX_HEADER_IDX].message.payload,t.id.toHex());if(typeof c>"u"){u.debug(r,"header decrypt failed.",a.transactionInfo);return}if(!w(c,t)){u.debug(r,"aggregate tx header invalid.",e);return}if(typeof((_=e.transactionInfo)==null?void 0:_.timestamp)>"u"){u.debug(r,"aggregate tx info timestamp undefined.");return}const d=v(),f=C(d.epochAdjustment,e.transactionInfo.timestamp),D=new Date(f);let m="";for(let g=i.TX_DATA_IDX;g<a.innerTransactions.length;g++)m+=a.innerTransactions[g].message.payload;return{hash:e.transactionInfo.hash,timestamp:D,header:c,data:m}}export{C,z as a,j as b,F as c,x as d,H as e,X as f,G as g,k as h,N as i,B as j,V as k,Y as l,U as m};
