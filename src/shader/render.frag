precision highp float;

varying vec2 vPos;

uniform sampler2D tex;
uniform vec2 dimension;

void main(){
  vec4 col = texture2D(tex, vPos);
  gl_FragColor = vec4(col.r,0.0,0.0,1.0);
}
