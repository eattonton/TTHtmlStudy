//获得定义的函数名


class Vector{
    constructor(x,y){
        this.x = x || 0.0;
        this.y = y || 0.0; 
    }

    //向量加法
    add(v){
        return new Vector(this.x + v.x, this.y + v.y);
    }

    //向量减法
    substract(v){
        return new Vector(this.x - v.x, this.y - v.y);
    }

    /**
     * 向量与标量乘法
     * @param {Vector} s
     */
    multiply(s) {
      return new Vector(this.x * s, this.y * s);
    }

    /**
     * 向量与向量点乘（投影）
     * @param {Vector} v
     */
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }

    /**
     * 向量标准化（除去长度）
     * @param {number} distance
     */
    normalize() {
      let distance = Math.sqrt(this.x * this.x + this.y * this.y);
      return new Vector(this.x / distance, this.y / distance);
    }

    length(){
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    //计算角度
    angle(other){
      if(other === undefined) other = new Vector(1,0);
      let d1 = this.dot(other) / this.length();
      let ang1 = Math.acos(d1)*180.0/Math.PI;
      if(this.y < 0)  ang1 = 360.0 - ang1;
      return ang1;
    }

}


class Matrix{
  constructor(){
    this.data = new Array();
    this.reset();
  }

  reset(){
    this.data[0] = 1.0;
    this.data[1] = 0.0;
    this.data[2] = 0.0;

    this.data[3] = 0.0;
    this.data[4] = 1.0;
    this.data[5] = 0.0;

    this.data[6] = 0.0;
    this.data[7] = 0.0;
    this.data[8] = 1.0;
  }

  translate(x,y){
    this.data[2] = x;
    this.data[5] = y;
  }

  Translate(x,y){
    let mt1 = new Matrix();
    mt1.translate(x, y);
    this.multiply(mt1);
  }
 
  scale(sx,sy){
    sy = sy || sx;
    this.data[0] = sx;
    this.data[4] = sy;
  }

  rotate(ang1){
    let ang2 = ang1 * Math.PI / 180.0;
    this.data[0] = Math.cos(ang2);
    this.data[1] = -Math.sin(ang2);

    this.data[3] = Math.sin(ang2);
    this.data[4] = Math.cos(ang2);
  }

  Rotate(ang1){
    let mt1 = new Matrix();
    mt1.rotate(ang1)
    this.multiply(mt1);
    //mt1.reset()
  }

  multiply(other){
    let data2 = new Array();

    for(let i=0;i<3;i++){
       data2[3*i] = 0;
       data2[3*i+1] = 0;
       data2[3*i+2] = 0;
       for(let j=0; j<3; j++){
          data2[3*i] += this.data[3*i+j] * other.data[3*j + 0];
          data2[3*i+1] += this.data[3*i+j] * other.data[3*j + 1];
          data2[3*i+2] += this.data[3*i+j] * other.data[3*j + 2];
       }
    }
 
    this.data = data2;
  }

  transform(args){
    let vec1  = new Vector();
    
    if(arguments.length == 1 && ModuleGetFnName(args) == 'Vector'){
      vec1 = args;
    }else if(arguments.length >= 2){
      vec1  = new Vector(arguments[0],arguments[1]);
    }
   // console.log(vec1)
    let vec2 = new Vector();

    vec2.x = this.data[0]*vec1.x + this.data[1]*vec1.y +this.data[2];
    vec2.y = this.data[3]*vec1.x + this.data[4]*vec1.y +this.data[5];

    return vec2;
  }

  determinant(){
    let num = (((this.data[0] * this.data[4]) * this.data[8])  
                + ((this.data[1] * this.data[5]) * this.data[6])) 
                + ((this.data[2] * this.data[3]) * this.data[7]);
    return (num - ((((this.data[2] * this.data[4]) * this.data[6]) 
              + ((this.data[1] * this.data[3]) * this.data[8])) 
              + ((this.data[0] * this.data[5]) * this.data[7])));
  }
 
  //逆矩阵
  invert(){
    let mt2 = new Matrix();
    mt2.data[0] = (this.data[4] * this.data[8]) - (this.data[7] * this.data[5]);
    mt2.data[1] = -1.0 * ((this.data[1] * this.data[8]) - (this.data[7] * this.data[2]));
    mt2.data[2] = (this.data[1] * this.data[5]) - (this.data[2] * this.data[4]);
    mt2.data[3] = (this.data[5] * this.data[6]) - (this.data[8] * this.data[3]);
    mt2.data[4] = -1.0 * ((this.data[2] * this.data[6]) - (this.data[0] * this.data[8]));
    mt2.data[5] = (this.data[2] * this.data[3]) - (this.data[0] * this.data[5]);
    mt2.data[6] = (this.data[3] * this.data[7]) - (this.data[4] * this.data[6]);
    mt2.data[7] = -1.0 * ((this.data[0] * this.data[7]) - (this.data[1] * this.data[6]));
    mt2.data[8] = (this.data[0] * this.data[4]) - (this.data[3] * this.data[1]);
    let num = this.determinant();
    if (!(num == 0.0))
    {
        mt2.data[0] /= num;
        mt2.data[1] /= num;
        mt2.data[2] /= num;
        mt2.data[3] /= num;
        mt2.data[4] /= num;
        mt2.data[5] /= num;
        mt2.data[6] /= num;
        mt2.data[7] /= num;
        mt2.data[8] /= num;
    }
    return mt2;
  }

}