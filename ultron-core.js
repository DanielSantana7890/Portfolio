(() => {
const canvas=document.querySelector('#plasma');const gl=canvas.getContext('webgl',{alpha:true,antialias:true});if(!gl){canvas.hidden=true;return;}
let program, timeUniform, scaleUniform, pulseUniform, pressureUniform, position, ringStart, ringCount, webStart, webCount;
function shader(type, text) { const sh=gl.createShader(type);gl.shaderSource(sh,text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh; }
function initGL(){
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec4 p;uniform float t;uniform float scale;uniform float pulse;uniform float pressure;uniform float dissolve;varying float light;varying float solid;varying float accent;void main(){accent=step(-30.,p.w)*(1.-step(-9.,p.w));solid=step(9.,p.w)*(1.-step(50.,p.w))+step(-2.,p.w)*(1.-step(0.,p.w));vec3 v=p.xyz;float ring=step(9.,p.w)*(1.-step(50.,p.w))+step(-30.,p.w)*(1.-step(-9.,p.w));float k=max(0.,abs(p.w)-10.);float a=t*.44,b=t*.27;if(ring>.5){float direction=k>0.5&&k<1.5?-1.:1.;float orbit=k*1.05+t*direction*(.24+k*.07);v.xz=mat2(cos(orbit),-sin(orbit),sin(orbit),cos(orbit))*v.xz;a=k*.8+t*direction*(.28+k*.06);b=.5+k*.85+t*direction*(.10+k*.035);}else{v*=1.04;}v.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*v.xz;v.yz=mat2(cos(b),-sin(b),sin(b),cos(b))*v.yz;v*=1.+1.00*clamp(pressure,0.,1.);v+=normalize(v+vec3(.01)) * dissolve * (2.+sin(p.x*83.+p.y*47.)*.7);float z=3.4;gl_Position=vec4(v.xy/z,0.,1.);gl_PointSize=clamp((ring>.5?6.0:p.w)*(1.+pulse*.2)*scale/z,1.,220.);light=.35+.65*(v.z+1.5)/3.;}`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying float light;varying float solid;varying float accent;void main(){if(solid>.5){gl_FragColor=vec4(vec3(1.,.12,.002)*clamp(light*1.7,0.,1.),.65);return;}float d=length(gl_PointCoord-.5)*2.;float glow=exp(-d*d*mix(1.25,.8,accent))*(1.-smoothstep(.35,1.,d));float intensity=clamp(light*mix(2.,2.8,accent),0.,1.);glow*=mix(1.,1.35,accent);gl_FragColor=vec4(mix(vec3(1.,.12,.002),vec3(1.,.62,.12),accent)*intensity,glow);}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL link');gl.useProgram(program);
 const points=[];const put=(x,y,z,w)=>points.push(x,y,z,w);
 // A concentrated luminous core, not a volume of floating particles.
 put(0,0,0,210);
 for(let k=0;k<3;k++){
   const b=.10+k*.04;
   for(let i=0;i<120;i++){
     // Low-discrepancy positions spread the cloud across a wider orbital band.
     const fraction=value=>value-Math.floor(value);
     const a=i*2.399963229728653+k*.7;
     const side=i%2===0?1:-1;
     const r=1.30+k*.12+side*(.028+.065*fraction(i*.754877666+k*.31));
     const offset=.065*(2*fraction(i*.569840291+k*.23)-1);
     put(r*Math.cos(a),r*Math.sin(a)*Math.cos(b)-offset*Math.sin(b),r*Math.sin(a)*Math.sin(b)+offset*Math.cos(b),-10-k);
   }
 }
 // Exactly four orbits with distinct inclination, radius and independent velocity and offset.
 position=points.length/4;ringStart=position;
 // Solid annular ribbons, tessellated as triangles rather than particles.
 for(let k=0;k<3;k++){
   const b=.10+k*.04,r=1.30+k*.12,width=.009,segments=192;
   // Full rings, with independently staggered angular starting positions.
   const start=[0,Math.PI/2,Math.PI,Math.PI*1.65][k],sweep=Math.PI*2;
   const vertex=(a,radius)=>put(radius*Math.cos(a),radius*Math.sin(a)*Math.cos(b),radius*Math.sin(a)*Math.sin(b),10+k);
   for(let i=0;i<segments;i++){
     const a=start+i/segments*sweep,next=start+(i+1)/segments*sweep;
     vertex(a,r-width);vertex(a,r+width);vertex(next,r+width);
     vertex(a,r-width);vertex(next,r+width);vertex(next,r-width);
   }
 }
 ringCount=points.length/4-ringStart;
 // Staggered spherical lattice with connected triangular cells.
 webStart=points.length/4;
 // Reduce the number of meridians toward the poles: no 52-line hotspot.
 const rows=32,bands=[];
 for(let row=0;row<=rows;row++){
   const theta=row/rows*Math.PI,count=row===0||row===rows?1:Math.max(6,Math.round(64*Math.sin(theta)));
   bands.push(Array.from({length:count},(_,col)=>{
     const phi=col/count*Math.PI*2;
     return [Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi)];
   }));
 }
 const edge=(a,b)=>{put(...a,-1);put(...b,-1);};
 for(let row=0;row<=rows;row++){
   const band=bands[row];
   if(band.length>1)for(let i=0;i<band.length;i++)edge(band[i],band[(i+1)%band.length]);
   if(row===rows)continue;
   const next=bands[row+1];let i=0,j=0;
   edge(band[0],next[0]);
   while(i<band.length||j<next.length){
     if(i<band.length&&(j===next.length||(i+1)/band.length<(j+1)/next.length))i++;else j++;
     if(i<band.length||j<next.length)edge(band[i%band.length],next[j%next.length]);
   }
 }
 webCount=points.length/4-webStart;
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,0,0);timeUniform=gl.getUniformLocation(program,'t');scaleUniform=gl.getUniformLocation(program,'scale');pulseUniform=gl.getUniformLocation(program,'pulse');pressureUniform=gl.getUniformLocation(program,'pressure');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
}

try{initGL();}catch(e){console.warn(e);return;}
const dissolveUniform=gl.getUniformLocation(program,'dissolve');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function resize(){const n=Math.min(1200,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2)));canvas.width=canvas.height=n;gl.viewport(0,0,n,n);}
new ResizeObserver(resize).observe(canvas);resize();
let start=performance.now();
function draw(now){if(!document.hidden){gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(timeUniform,reduced.matches?0:(now-start)/1000);gl.uniform1f(scaleUniform,canvas.width/850);gl.uniform1f(pulseUniform,window.portfolioSpeaking?.4:0);gl.uniform1f(pressureUniform,window.portfolioSpeaking?.2:0);gl.uniform1f(dissolveUniform,window.portfolioDissolve||0);gl.drawArrays(gl.POINTS,0,position);gl.drawArrays(gl.TRIANGLES,ringStart,ringCount);gl.drawArrays(gl.LINES,webStart,webCount);}requestAnimationFrame(draw);}requestAnimationFrame(draw);
})();
