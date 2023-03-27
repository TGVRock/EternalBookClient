import{k as L,l as W,f as H,m as K,g as c,e as S,C as P}from"./index-398f9ed7.js";import{u as _,W as o,a as m,o as A}from"./WriteOnChainData-b0f53113.js";import{a as E,g as O}from"./account-09fc7f3f.js";import{c as y}from"./mosaic-c3c1dfdc.js";import{f as R,h as q,i as v,j as B}from"./eternalbookprotocol-57c3aaff.js";const Q=L("WriteMosaic",()=>{const e=W(),g=H(),T=K(),k=_(),i=c(""),l=c(S.MosaicFlags.create(!1,!1,!1,!1)),u=c(1),a=c(o.Standby);async function b(){var w,F;const n="create mosaic:";if(e.logger.debug(n,"start"),a.value!==o.Standby&&a.value!==o.Complete&&a.value!==o.Failed){e.logger.error(n,"other processing.");return}a.value=o.Preprocess;const x=await E(i.value);if(typeof x>"u"){e.logger.error(n,"get multisig info failed."),a.value=o.Failed;return}const p=x.isMultisig(),d=await O(i.value);if(typeof d>"u"){e.logger.error(n,"get account info failed."),a.value=o.Failed;return}const f=p?R(y(d,u.value,l.value),await m(e.feeKind)):q(y(d,u.value,l.value),await m(e.feeKind));if(!e.useSSS&&typeof e.account>"u"){e.logger.error(n,"account invalid."),a.value=o.Failed;return}a.value=o.TxSigning;const t=e.useSSS?await T.requestTxSign(f):(w=e.account)==null?void 0:w.sign(f,g.generationHash);if(typeof t>"u"){e.logger.error(n,"sss sign failed."),a.value=o.Failed;return}const C=S.Address.createFromRawAddress(i.value);if(typeof await A("create mosaic",C,t.hash,()=>{a.value=o.TxWaitCosign},()=>{a.value=o.TxUnconfirmed},async()=>{await new Promise(r=>setTimeout(r,P.SSS_AFTER_CREATE_MOSAIC_WAIT_MSEC)),k.relatedMosaicIdStr=f.innerTransactions[0].mosaicId.toHex(),a.value=o.Complete},()=>{a.value=o.Failed})>"u"){e.logger.error(n,"open create mosaic tx listener failed."),a.value=o.Failed;return}if(!p){a.value=o.TxAnnounced;const r=await v(t);e.logger.debug(n,"aggregate complete tx announced.",[t,r]),e.logger.debug(n,"aggregate complete end");return}const h=B(t,await m(e.feeKind));a.value=o.LockSigning;const s=e.useSSS?await T.requestTxSign(h):(F=e.account)==null?void 0:F.sign(h,g.generationHash);if(typeof s>"u"){e.logger.error(n,"sss sign failed."),a.value=o.Failed;return}const M=S.Address.createFromPublicKey(s.signerPublicKey,g.networkType);if(typeof await A("hash lock",M,s.hash,void 0,()=>{a.value=o.LockUnconfirmed},async()=>{a.value=o.TxAnnounced;const r=await v(t);e.logger.debug(n,"aggregate bonded tx announced.",[t,r])},()=>{a.value=o.Failed})>"u"){e.logger.error(n,"open hash lock tx listener failed."),a.value=o.Failed;return}a.value=o.LockAnnounced;const I=await v(s);e.logger.debug(n,"hashlock tx announced.",[s,I]),e.logger.debug(n,"aggregate bonded end")}return{ownerAddress:i,mosaicFlags:l,amount:u,progress:a,createMosaic:b}});export{Q as u};