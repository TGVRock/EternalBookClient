import{u as m}from"./SelectboxComponent.vue_vue_type_script_setup_true_lang-f22bb66f.js";import{d as i,c as s,a,t as u,F as _,r as p,u as v,o as n}from"./index-398f9ed7.js";const h={class:"row my-2"},f={class:"col-md-3 col-form-label"},x={class:"col-md-9"},g=["value"],C=["value"],A=i({__name:"CreatedMosaicAreaComponent",props:{value:null},emits:["update:value"],setup(o,{emit:c}){const r=m(),l=e=>{const d=e.target;c("update:value",d.value)};return(e,d)=>(n(),s("div",h,[a("label",f,u(e.$t("mosaicInfo.id")),1),a("div",x,[a("select",{"aria-label":"owned-mosaic",value:o.value,onChange:l,class:"form-select"},[(n(!0),s(_,null,p(v(r).createdMosaics,t=>(n(),s("option",{key:t.id.toHex(),value:t.id.toHex()},u(t.alias.length>0?t.alias+" (ID: "+t.id.toHex()+")":t.id.toHex()),9,C))),128))],40,g)])]))}}),$={class:"row my-2"},b={class:"col-md-3 col-form-label"},y={class:"col-md-9"},H=["value","placeholder"],B=i({__name:"TextAreaComponent",props:{itemName:null,placeholder:null,value:null},emits:["update:value"],setup(o,{emit:c}){const r=l=>{const e=l.target;c("update:value",e.value)};return(l,e)=>(n(),s("div",$,[a("label",b,u(o.itemName),1),a("div",y,[a("input",{type:"text",value:o.value,onChange:r,class:"form-control",placeholder:o.placeholder},null,40,H)])]))}});export{A as _,B as a};