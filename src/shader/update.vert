attribute vec2 position;
varying vec2 vPos;

void main(){
  vPos = position/2.0+0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
