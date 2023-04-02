import{k as W,l as H,f as K,v as P,g,e as S,w as _,C as E}from"./index-8529961b.js";import{u as O,W as o,a as m,o as b}from"./WriteOnChainData-6c74b5a8.js";import{a as R,b as q}from"./account-2c35004b.js";import{c as y}from"./mosaic-2acaed25.js";import{f as B,h as D,i as T,j as U}from"./eternalbookprotocol-1dc854f0.js";const X=W("WriteMosaic",()=>{const e=H(),u=K(),h=P(),k=O(),s=g(""),i=g(void 0),d=g(S.MosaicFlags.create(!1,!1,!1,!1)),f=g(1),a=g(o.Standby);async function C(){var A,F;const t="create mosaic:";if(e.logger.debug(t,"start"),a.value!==o.Standby&&a.value!==o.Complete&&a.value!==o.Failed){e.logger.error(t,"other processing.");return}a.value=o.Preprocess;const r=await q(s.value),x=typeof r>"u"?!1:r.isMultisig();if(typeof i.value>"u"){e.logger.error(t,"get account info failed."),a.value=o.Failed;return}const p=i.value,v=x?B(y(p,f.value,d.value),await m(e.feeKind)):D(y(p,f.value,d.value),await m(e.feeKind));if(!e.useSSS&&typeof e.account>"u"){e.logger.error(t,"account invalid."),a.value=o.Failed;return}a.value=o.TxSigning;const n=e.useSSS?await h.requestTxSign(v):(A=e.account)==null?void 0:A.sign(v,u.generationHash);if(typeof n>"u"){e.logger.error(t,"sss sign failed."),a.value=o.Failed;return}const I=S.Address.createFromRawAddress(s.value);if(typeof await b("create mosaic",I,n.hash,()=>{a.value=o.TxWaitCosign},()=>{a.value=o.TxUnconfirmed},async()=>{await new Promise(l=>setTimeout(l,E.SSS_AFTER_CREATE_MOSAIC_WAIT_MSEC)),k.relatedMosaicIdStr=v.innerTransactions[0].mosaicId.toHex(),a.value=o.Complete},()=>{a.value=o.Failed})>"u"){e.logger.error(t,"open create mosaic tx listener failed."),a.value=o.Failed;return}if(!x){a.value=o.TxAnnounced;const l=await T(n);e.logger.debug(t,"aggregate complete tx announced.",[n,l]),e.logger.debug(t,"aggregate complete end");return}const w=U(n,await m(e.feeKind));a.value=o.LockSigning;const c=e.useSSS?await h.requestTxSign(w):(F=e.account)==null?void 0:F.sign(w,u.generationHash);if(typeof c>"u"){e.logger.error(t,"sss sign failed."),a.value=o.Failed;return}const M=S.Address.createFromPublicKey(c.signerPublicKey,u.networkType);if(typeof await b("hash lock",M,c.hash,void 0,()=>{a.value=o.LockUnconfirmed},async()=>{a.value=o.TxAnnounced;const l=await T(n);e.logger.debug(t,"aggregate bonded tx announced.",[n,l])},()=>{a.value=o.Failed})>"u"){e.logger.error(t,"open hash lock tx listener failed."),a.value=o.Failed;return}a.value=o.LockAnnounced;const L=await T(c);e.logger.debug(t,"hashlock tx announced.",[c,L]),e.logger.debug(t,"aggregate bonded end")}return _(s,()=>{const t="write mosaic store watch:";e.logger.debug(t,"start",s),R(s.value).then(r=>{i.value=r}).catch(r=>{e.logger.error(t,"get mosaics info failed.",r),i.value=void 0}),e.logger.debug(t,"end")},{immediate:!0}),{ownerAddress:s,ownerInfo:i,mosaicFlags:d,amount:f,progress:a,createMosaic:C}});export{X as u};
