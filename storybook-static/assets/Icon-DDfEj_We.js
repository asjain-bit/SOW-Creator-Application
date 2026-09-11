import{r as d,j as T}from"./iframe-CnLTU_ML.js";/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=t=>t==null?void 0:t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function K(t,e,o=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:F(t),size:24,node:e,...o.length>0?{aliases:o}:{}}}/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=t=>{let e="",o=!1;for(const n of t){if(n==="-"||n==="_"||n<=" "){o=e.length>0;continue}e.length===0?e+=n.toLowerCase():e+=o?n.toUpperCase():n,o=!1}return e};/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=t=>{const e=X(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=(...t)=>t.filter((e,o,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function b(t){return t!=null}function G(t,e={}){var y,f;const o=e.attributeNames??{},n=r=>o[r]??r,s=t.size??t.width??l.width,u=t.size??t.height??l.height,c=((y=t.aliases)==null?void 0:y.filter(r=>typeof r=="string"&&r.trim()!=="").map(r=>`lucide-${r}`))??[],k=[...t.name?[`lucide-${t.name}`]:[],...c],i=((f=e.className)==null?void 0:f.split(" ").filter(Boolean))??[],p=e.includeDefaultClasses===!1?z(...i):z("lucide",...k,...i),g=e.absoluteStrokeWidth?Number(e.strokeWidth??l["stroke-width"])*Number(t.size??t.width??l.width)/Number(e.size??e.width??l.width):e.strokeWidth??l["stroke-width"];return["svg",{...Object.entries(l).reduce((r,[h,m])=>(r[n(h)]=m,r),{}),..."color"in e&&e.color&&{[n("stroke")]:e.color},..."size"in e&&b(e.size)&&{[n("width")]:e.size,[n("height")]:e.size},..."width"in e&&b(e.width)&&{[n("width")]:e.width},..."height"in e&&b(e.height)&&{[n("height")]:e.height},[n("stroke-width")]:g,...p&&{[n("class")]:p},[n("viewBox")]:`0 0 ${s} ${u}`,...e.hasA11yProp===!1?{[n("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(r=>{const[h,m,w]=r,v=e.nonScalingStroke?{[n("vector-effect")]:"non-scaling-stroke",...m}:m;return w?[h,v,w]:[h,v]})]}/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function J(t,e={}){return G(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},Q=d.createContext({}),Y=()=>d.useContext(Q),ee=d.forwardRef(({color:t,size:e,width:o,height:n,strokeWidth:s,absoluteStrokeWidth:u,nonScalingStroke:c,className:k="",children:i,iconNode:p=[],icon:g={node:p,aliases:[],size:24},...x},y)=>{const{size:f=24,strokeWidth:r=2,absoluteStrokeWidth:h=!1,nonScalingStroke:m=!1,color:w="currentColor",className:v=""}=Y()??{},E=!!i||O(x),[P,R,H=[]]=J(g,{color:t??w,width:o??e??f,height:n??e??f,strokeWidth:s??r,absoluteStrokeWidth:u??h,nonScalingStroke:c??m,className:z(v,k),hasA11yProp:E,attributes:x});return d.createElement(P,{ref:y,...R},[...H.map(([U,V])=>d.createElement(U,V)),...Array.isArray(i)?i:[i]])});/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function a(t,e=[],o=[]){const n=typeof t=="string"?K(t,e,o):t,s=d.forwardRef(({className:u,...c},k)=>d.createElement(ee,{ref:k,icon:n,className:u,...c}));return n.name&&(s.displayName=Z(n.name)),s}/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _={name:"arrow-down",size:24,node:[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]};_.node;const te=a(_);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C={name:"arrow-up",size:24,node:[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]};C.node;const ne=a(C);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};$.node;const oe=a($);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};N.node;const re=a(N);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S={name:"chevron-right",size:24,node:[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]};S.node;const ae=a(S);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A={name:"circle-alert",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle"]};A.node;const se=a(A);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D={name:"info",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]};D.node;const ce=a(D);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M={name:"laptop",size:24,node:[["path",{d:"M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z",key:"1pdavp"}],["path",{d:"M20.054 15.987H3.946",key:"14rxg9"}]]};M.node;const ie=a(M);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]};L.node;const le=a(L);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};j.node;const de=a(j);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I={name:"settings",size:24,node:[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};I.node;const ue=a(I);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]};W.node;const he=a(W);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q={name:"user",size:24,node:[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]};q.node;const me=a(q);/**
 * @license lucide-react v1.43.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};B.node;const ke=a(B),fe=({name:t,size:e=20,className:o="",...n})=>{const s=typeof e=="number"?e:parseInt(e,10)||20,c=(()=>{switch(t){case"sun":return he;case"moon":return le;case"laptop":return ie;case"search":return de;case"check":return oe;case"alert":return se;case"info":return ce;case"close":return ke;case"user":return me;case"settings":return ue;case"chevron-left":return re;case"chevron-right":return ae;case"arrow-up":return ne;case"arrow-down":return te;default:return null}})();return c?T.jsx(c,{size:s,strokeWidth:2,className:`inline-block ${o}`,"data-testid":`icon-${t}`,...n}):null};fe.__docgenInfo={description:"",methods:[],displayName:"Icon",props:{name:{required:!0,tsType:{name:"union",raw:`| 'sun'
| 'moon'
| 'laptop'
| 'search'
| 'check'
| 'alert'
| 'info'
| 'close'
| 'user'
| 'settings'
| 'chevron-left'
| 'chevron-right'
| 'arrow-up'
| 'arrow-down'`,elements:[{name:"literal",value:"'sun'"},{name:"literal",value:"'moon'"},{name:"literal",value:"'laptop'"},{name:"literal",value:"'search'"},{name:"literal",value:"'check'"},{name:"literal",value:"'alert'"},{name:"literal",value:"'info'"},{name:"literal",value:"'close'"},{name:"literal",value:"'user'"},{name:"literal",value:"'settings'"},{name:"literal",value:"'chevron-left'"},{name:"literal",value:"'chevron-right'"},{name:"literal",value:"'arrow-up'"},{name:"literal",value:"'arrow-down'"}]},description:""},size:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"",defaultValue:{value:"20",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"''",computed:!1}}}};export{fe as I};
