import{k as I,l as _,f as M,m as A,g as u,w as p,d as E,c as B,a as t,t as b,n as w,F as K,o as T}from"./index-9206b016.js";import{c as F,i as q,g as N,a as V}from"./account-51984bfd.js";import{g as x}from"./mosaic-731a0b2e.js";import{g as y}from"./namespace-05e1c5fa.js";const Q=I("account",()=>{const e=_(),v=M(),g=A(),i=u(void 0),a=u(void 0),m=u(void 0),f=u([]),l=u([]);return p([()=>e.privateKey,()=>e.useSSS],()=>{const s="account store watch (settings):";if(e.logger.debug(s,"start"),e.useSSS===!0)e.addressStr=g.address;else if(e.privateKey.length>0){if(e.logger.debug(s,"private key account."),i.value=F(e.privateKey,v.networkType),typeof i.value>"u"){e.logger.error(s,"create account failed.");return}e.addressStr=i.value.address.plain()}e.logger.debug(s,"end")},{immediate:!0}),p(()=>e.addressStr,()=>{const s="account store watch (address):";if(e.logger.debug(s,"start",e.addressStr),a.value=void 0,m.value=void 0,!q(e.addressStr)){e.logger.error(s,"address invalid.");return}N(e.addressStr).then(n=>{a.value=n}).catch(n=>{e.logger.error(s,"get account info failed.",n),a.value=void 0}),V(e.addressStr).then(n=>{m.value=n}).catch(n=>{e.logger.error(s,"get multisig info failed.",n),m.value=void 0}),e.logger.debug(s,"end")},{immediate:!0}),p(a,()=>{const s="account store watch (account info):";if(e.logger.debug(s,"start",a.value),f.value=[],l.value=[],typeof a.value>"u"){e.logger.error(s,"account info invalid.");return}const n=a.value.address;x(n).then(async r=>{const d=[];r.forEach(o=>{d.push(o.id)}),y(d).then(o=>{d.forEach(h=>{const c=o.find(C=>C.mosaicId.equals(h)),k=typeof c>"u"||c.names.length===0?"":c==null?void 0:c.names[0].name;f.value.push({id:h,alias:k})})}).catch(o=>{e.logger.error(s,"get mosaics names failed.",o),l.value=[]})}).catch(r=>{e.logger.error(s,"get mosaics failed.",r),f.value=[]});const S=[];a.value.mosaics.forEach(r=>{S.push(r.id)}),y(S).then(r=>{S.forEach(d=>{const o=r.find(c=>c.mosaicId.equals(d)),h=typeof o>"u"||o.names.length===0?"":o==null?void 0:o.names[0].name;l.value.push({id:d,alias:h})})}).catch(r=>{e.logger.error(s,"get mosaics names failed.",r),l.value=[]}),e.logger.debug(s,"end")},{immediate:!0}),{accountInfo:a,multisigInfo:m,createdMosaics:f,owendMosaics:l}}),z={class:"modal-dialog"},D={class:"modal-content"},P={class:"modal-header"},$={class:"modal-title"},j={class:"modal-body"},G={class:"modal-footer"},R=E({__name:"ModalComponent",props:{isShown:{type:Boolean},title:null,message:null},emits:["update:isShown"],setup(e,{emit:v}){const g=()=>{v("update:isShown",!1)};return(i,a)=>(T(),B(K,null,[t("div",{class:w(["modal fade",{show:e.isShown,"d-block":e.isShown}])},[t("div",z,[t("div",D,[t("div",P,[t("h5",$,b(e.title),1),t("button",{type:"button",class:"btn-close",onClick:g})]),t("div",j,[t("p",null,b(e.message),1)]),t("div",G,[t("button",{type:"button",class:"btn btn-danger",onClick:g},b(i.$t("modal.close")),1)])])])],2),t("div",{class:w(["modal-backdrop fade",{show:e.isShown,"pe-none":!e.isShown}])},null,2)],64))}});export{R as _,Q as u};