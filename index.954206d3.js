var t,e,s,i,n={};t=n,e="WebGL2",s=()=>g,Object.defineProperty(t,e,{get:s,set:i,enumerable:!0,configurable:!0});class r{constructor(t){this.data=t}mul=t=>{const e=this.data,s=t.data;return new r([s[0]*e[0]+s[1]*e[4]+s[2]*e[8]+s[3]*e[12],s[0]*e[1]+s[1]*e[5]+s[2]*e[9]+s[3]*e[13],s[0]*e[2]+s[1]*e[6]+s[2]*e[10]+s[3]*e[14],s[0]*e[3]+s[1]*e[7]+s[2]*e[11]+s[3]*e[15],s[4]*e[0]+s[5]*e[4]+s[6]*e[8]+s[7]*e[12],s[4]*e[1]+s[5]*e[5]+s[6]*e[9]+s[7]*e[13],s[4]*e[2]+s[5]*e[6]+s[6]*e[10]+s[7]*e[14],s[4]*e[3]+s[5]*e[7]+s[6]*e[11]+s[7]*e[15],s[8]*e[0]+s[9]*e[4]+s[10]*e[8]+s[11]*e[12],s[8]*e[1]+s[9]*e[5]+s[10]*e[9]+s[11]*e[13],s[8]*e[2]+s[9]*e[6]+s[10]*e[10]+s[11]*e[14],s[8]*e[3]+s[9]*e[7]+s[10]*e[11]+s[11]*e[15],s[12]*e[0]+s[13]*e[4]+s[14]*e[8]+s[15]*e[12],s[12]*e[1]+s[13]*e[5]+s[14]*e[9]+s[15]*e[13],s[12]*e[2]+s[13]*e[6]+s[14]*e[10]+s[15]*e[14],s[12]*e[3]+s[13]*e[7]+s[14]*e[11]+s[15]*e[15]])}}class o{constructor(t){this.matrix=t}}class a{constructor(t){this.entity=t}}class h{constructor(t,e){this.vertices=t,this.indices=e}}class c{constructor(t){this.x=t.x,this.y=t.y,this.z=t.z}matrix=()=>new r([1,0,0,0,0,1,0,0,0,0,1,0,this.x,this.y,this.z,1])}class l{constructor(t){this.x=t.x,this.y=t.y,this.z=t.z}matrix=()=>new r([this.x,0,0,0,0,this.y,0,0,0,0,this.z,0,0,0,0,1])}class u{constructor(t){this.x=t.x,this.y=t.y,this.z=t.z}xMatrix=()=>{const t=this.x,e=Math.cos(t),s=Math.sin(t);return new r([1,0,0,0,0,e,s,0,0,-s,e,0,0,0,0,1])};yMatrix=()=>{const t=this.y,e=Math.cos(t),s=Math.sin(t);return new r([e,0,-s,0,0,1,0,0,s,0,e,0,0,0,0,1])};zMatrix=()=>{const t=this.z,e=Math.cos(t),s=Math.sin(t);return new r([e,s,0,0,-s,e,0,0,0,0,1,0,0,0,0,1])};matrix=()=>this.xMatrix().mul(this.yMatrix()).mul(this.zMatrix())}class d{constructor(t){this.h=t.h,this.s=t.s,this.l=t.l,this.a=t.a}}class f{constructor(t){this.entities=t}}class m{}class g{constructor(t){const e=document.createElement("canvas");e.style.width=t.width.toString(),e.style.height=t.height.toString(),e.style.display="block";const s=e.getContext("webgl2");s.clearColor(0,0,0,1),this.element=e,this.gl=s,this.maxBatchSize=Math.floor(s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS)/5);const i=`#version 300 es\nuniform mat4[${this.maxBatchSize}] u_matrix;\nuniform vec4[${this.maxBatchSize}] u_color;\n\nin vec4 a_position;\nin uint a_index;\n\nout vec4 v_color;\n\nvoid main() {\n  gl_Position = u_matrix[a_index] * a_position;\n  v_color = u_color[a_index];\n}\n`,n=s.createShader(s.VERTEX_SHADER);s.shaderSource(n,i),s.compileShader(n);const r=s.createShader(s.FRAGMENT_SHADER);s.shaderSource(r,"#version 300 es\nprecision mediump float;\n\nin vec4 v_color;\nout vec4 fragColor;\n\nvec4 hslToRgb(in vec4 hsl) {\n float h = hsl.x / 360.0;\n vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);\n return vec4(hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0)), hsl.w);\n}\n\nvoid main() {\n  fragColor = hslToRgb(v_color);\n}\n"),s.compileShader(r);const o=s.createProgram();s.attachShader(o,n),s.attachShader(o,r),s.linkProgram(o),s.getProgramParameter(o,s.LINK_STATUS)||(console.log(s.getShaderInfoLog(n)),console.log(s.getShaderInfoLog(r))),s.useProgram(o),s.enable(s.CULL_FACE),s.enable(s.DEPTH_TEST),this.aPosition={buffer:s.createBuffer(),location:s.getAttribLocation(o,"a_position")},s.enableVertexAttribArray(this.aPosition.location),s.bindBuffer(s.ARRAY_BUFFER,this.aPosition.buffer),s.vertexAttribPointer(this.aPosition.location,3,s.FLOAT,!1,0,0),this.vertexIndexBuffer=s.createBuffer(),this.aIndex={buffer:s.createBuffer(),location:s.getAttribLocation(o,"a_index")},s.enableVertexAttribArray(this.aIndex.location),s.bindBuffer(s.ARRAY_BUFFER,this.aIndex.buffer),s.vertexAttribIPointer(this.aIndex.location,1,s.UNSIGNED_SHORT,0,0),this.uMatrix=s.getUniformLocation(o,"u_matrix"),this.uColor=s.getUniformLocation(o,"u_color"),this.viewport(t)}viewport=({x:t,y:e,width:s,height:i})=>{this.element.width=s,this.element.height=i,this.gl.viewport(t,e,s,i)};renderEntities=function*(t){const e=function*(t){const s=t.entity.get(f);if(s)for(const i of s.entities){const s=i.get(c).matrix().mul(i.get(u).matrix()).mul(i.get(l).matrix()),n={entity:i,transform:t.transform.mul(s)};yield n,yield*e(n)}},s=t.get(a).entity.get(o).matrix;for(const i of t.query(m)){const t=i.get(c).matrix().mul(i.get(u).matrix()).mul(i.get(l).matrix()),n={transform:s.mul(t),entity:i};yield n,yield*e(n)}};render=t=>{performance.now();const e=this.gl;e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);t.get(a).entity.get(o).matrix;let s=[],i=[],n=[],r=[],c=[],l=0,u=0;const f=()=>{e.uniformMatrix4fv(this.uMatrix,!1,r),e.uniform4fv(this.uColor,c),e.bindBuffer(e.ARRAY_BUFFER,this.aPosition.buffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array(s),e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(i),e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,this.aIndex.buffer),e.bufferData(e.ARRAY_BUFFER,new Uint16Array(n),e.STATIC_DRAW),e.drawElements(e.TRIANGLES,i.length,e.UNSIGNED_SHORT,0)};for(const{entity:e,transform:o}of this.renderEntities(t)){const t=e.get(h);if(!t)continue;s.push(...t.vertices);for(const e of t.indices)i.push(e+u);const a=t.vertices.length/3;u+=a,r.push(...o.data);const m=e.get(d);c.push(m.h,m.s,m.l,m.a);for(let t=0;t<a;++t)n.push(l);++l==this.maxBatchSize&&(f(),s=[],i=[],n=[],r=[],c=[],l=0,u=0)}0!=l&&f();performance.now()}}class x{constructor(){this.lookup=new Map,this.data=[],this.inverses=[]}get=t=>{const e=this.lookup.get(t.id);return null!=e?this.data[e]:void 0};hasId=t=>this.lookup.has(t);set=(t,e)=>{const s=this.lookup.get(t.id);if(s)return this.data[s]=e,void(this.inverses[s]=t.id);this.lookup.set(t.id,this.data.length),this.data.push(e),this.inverses.push(t.id)}}class y{constructor(t,e){this.id=t,this.ecs=e}set=(...t)=>{for(const e of t){const t=e.constructor;let s=this.ecs.storages.get(t);s||(s=new x,this.ecs.storages.set(t,s)),s.set(this,e)}};get=t=>{const e=this.ecs.storages.get(t);return e?e.get(this):void 0}}const w=new class{constructor(){this.nextEntityId=0,this.storages=new Map,this.resources=new Map}entity=(...t)=>{const e=new y(this.nextEntityId,this);return e.set(...t),++this.nextEntityId,e};query=function*(...t){const e=this.storages.get(t[0]),s=t.slice(1).map((t=>this.storages.get(t)));for(const t of e.inverses)s.every((e=>e.hasId(t)))&&(yield new y(t,this))};set=(...t)=>{for(const e of t){const t=e.constructor;this.resources.set(t,e)}};get=t=>this.resources.get(t)};let v={x:0,y:0,width:500,height:500};const _=new n.WebGL2(v);_.element.style.width="100%",_.element.style.height="100%",document.body.appendChild(_.element);const A=w.entity();w.set(new a(A));const[E,R]=[500,-500],b=()=>{v.width=_.element.clientWidth,v.height=_.element.clientHeight,A.set((({x:t,y:e,width:s,height:i,near:n,far:a})=>{const h=t+s,c=e+i;return new o(new r([2/(h-t),0,0,0,0,2/(e-c),0,0,0,0,2/(n-a),0,(t+h)/(t-h),(c+e)/(c-e),(n+a)/(n-a),1]))})({...v,near:E,far:R})),_.viewport(v)};b(),window.addEventListener("resize",b);const p=(t,e,s)=>w.entity(new h([-.5,-.5,0,-.5,.5,0,.5,.5,0,.5,-.5,0],[0,1,2,3,0,2,2,1,0,2,0,3]),new c({x:t,y:e,z:0}),new u({x:0,y:0,z:0}),new l({x:10,y:10,z:1}),new d({h:s,s:1,l:.7,a:1}),new m),S=p(v.width/2,v.height/2,279);let M=!1;document.addEventListener("mousedown",(t=>{M=!0,p(t.x,t.y,Math.floor(360*Math.random())),_.render(w)})),document.addEventListener("mouseup",(()=>M=!1));let F=0;const B=t=>{requestAnimationFrame(B);for(const e of w.query(u))e.get(u).x+=(t-F)/1e3;F=t,_.render(w)};document.addEventListener("pointermove",(t=>{if(S.set(new c({x:t.x,y:t.y,z:0})),M)for(const e of t.getCoalescedEvents())p(e.x,e.y,Math.floor(360*Math.random()));_.render(w)})),requestAnimationFrame(B);
//# sourceMappingURL=index.954206d3.js.map
