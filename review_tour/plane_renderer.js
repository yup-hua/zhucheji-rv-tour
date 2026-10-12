'use strict';
// Same 90-degree rectilinear source projection, rasterized as clipped planes.
// This is a viewer projection mesh, not a reconstruction of the campsite.
window.createPlaneRenderer=function(gl){
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const p=gl.createProgram();
 gl.attachShader(p,compile(gl.VERTEX_SHADER,`attribute vec2 position;uniform mat3 worldToView;uniform vec2 tangent,sector;uniform float heading;varying highp vec2 uv;
 void main(){float x=mix(sector.x,sector.y,(position.x+1.)*.5);float c=cos(heading),s=sin(heading);vec3 world=vec3(c*x+s,position.y*(941./1672.),-s*x+c);vec3 v=worldToView*world;gl_Position=vec4(v.x/tangent.x,v.y/tangent.y,0.,v.z);uv=vec2((x+1.)*.5,(position.y+1.)*.5);}`));
 gl.attachShader(p,compile(gl.FRAGMENT_SHADER,'precision highp float;varying highp vec2 uv;uniform sampler2D photo;void main(){gl_FragColor=texture2D(photo,uv);}'));
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 const a=gl.getAttribLocation(p,'position'),u=Object.fromEntries(['worldToView','tangent','sector','heading','photo'].map(n=>[n,gl.getUniformLocation(p,n)]));
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const boundary=Math.tan(Math.PI/12),inverse=new Float32Array(9);
 return{render({viewport,rotation,tangent,range,textures}){
  gl.viewport(viewport.x,viewport.y,viewport.width,viewport.height);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)inverse[col*3+row]=rotation[row*3+col];
  gl.uniformMatrix3fv(u.worldToView,false,inverse);gl.uniform2f(u.tangent,tangent[0],tangent[1]);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(u.photo,0);
  for(let base=-range;base<=range;base+=30){const item=textures[(base+90)/30];if(!item)continue;gl.bindTexture(gl.TEXTURE_2D,item.tex);gl.uniform1f(u.heading,base*Math.PI/180);gl.uniform2f(u.sector,base===-range?-1:-boundary,base===range?1:boundary);gl.drawArrays(gl.TRIANGLES,0,6)}
 }};
};
