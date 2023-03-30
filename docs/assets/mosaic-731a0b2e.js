import{l as u,f as d,e as r,C as f}from"./index-9206b016.js";const s=u(),n=d();function p(e){try{new r.MosaicId(e)}catch{return!1}return!0}async function m(e){const o="get mosaic info:";if(typeof n.mosaicRepo>"u"){s.logger.error(o,"repository undefined.");return}if(!p(e)){s.logger.error(o,"invalid mosaic.",e);return}const a=new r.MosaicId(e);return await n.mosaicRepo.getMosaic(a).toPromise().then(t=>t).catch(t=>{s.logger.error(o,"failed.",t)})}async function h(e){return await c({ownerAddress:e,pageSize:100,pageNumber:1})}async function c(e){const o="search mosaics:";if(s.logger.debug(o,"start","page:",e.pageNumber||f.STR_NA),typeof n.mosaicRepo>"u")return s.logger.error(o,"repository undefined."),[];const a=await n.mosaicRepo.search(e).toPromise().then(t=>t).catch(t=>{s.logger.error(o,"failed.",t)});return typeof a>"u"?(s.logger.error(o,"search failed."),[]):a.isLastPage?a.data:(e.pageNumber=typeof e.pageNumber>"u"?2:e.pageNumber+1,a.data.concat(await c(e)))}function y(e,o,a){const t=r.MosaicNonce.createRandom(),i=r.MosaicDefinitionTransaction.create(r.Deadline.create(n.epochAdjustment),t,r.MosaicId.createFromNonce(t,e.address),a,0,r.UInt64.fromUint(0),n.networkType),g=r.MosaicSupplyChangeTransaction.create(r.Deadline.create(n.epochAdjustment),i.mosaicId,r.MosaicSupplyChangeAction.Increase,r.UInt64.fromUint(o),n.networkType);return[i.toAggregate(e.publicAccount),g.toAggregate(e.publicAccount)]}export{m as a,y as c,h as g,p as i};
