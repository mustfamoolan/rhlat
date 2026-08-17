import{r as s,j as k}from"./app-BZ-_XyD4.js";import{f as y}from"./card-DTMf0tih.js";/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=(...t)=>t.filter((e,r,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===r).join(" ").trim();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,o)=>o?o.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=t=>{const e=A(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},W=s.createContext({}),j=()=>s.useContext(W),E=s.forwardRef(({color:t,size:e,strokeWidth:r,absoluteStrokeWidth:o,className:a="",children:n,iconNode:p,...u},x)=>{const{size:c=24,strokeWidth:d=2,absoluteStrokeWidth:m=!1,color:g="currentColor",className:C=""}=j()??{},h=o??m?Number(r??d)*24/Number(e??c):r??d;return s.createElement("svg",{ref:x,...i,width:e??c??i.width,height:e??c??i.height,stroke:t??g,strokeWidth:h,className:f("lucide",C,a),...!n&&!L(u)&&{"aria-hidden":"true"},...u},[...p.map(([b,w])=>s.createElement(b,w)),...Array.isArray(n)?n:[n]])});/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=(t,e)=>{const r=s.forwardRef(({className:o,...a},n)=>s.createElement(E,{ref:n,iconNode:e,className:f(`lucide-${v(l(t))}`,`lucide-${t}`,o),...a}));return r.displayName=l(t),r};function N({className:t,variant:e="default",...r}){const o={default:"border-transparent bg-primary text-primary-foreground",secondary:"border-transparent bg-secondary text-secondary-foreground",destructive:"border-transparent bg-destructive text-destructive-foreground",outline:"text-foreground border-border"};return k.jsx("div",{className:y("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",o[e],t),...r})}export{N as B,$ as c};
