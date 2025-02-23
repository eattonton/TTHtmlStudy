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

    //叉乘 z 向量的 值
    cross(v){
        return this.x * v.y - this.y* v.x;
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
      if(this.x == 0 && this.y == 0) return 0;
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
    sx = sx || 1.0;
    sy = sy || sx;
    this.data[0] = sx;
    this.data[4] = sy;
  }

  Scale(sx,sy){
    let mt1 = new Matrix();
    mt1.scale(sx,sy)
    this.multiply(mt1);
    //mt1.reset()
  }

  rotate(ang1,cx,cy){
    let ang2 = ang1 * Math.PI / 180.0;
    if(cx !== undefined && cy !== undefined){
      this.data[0] = Math.cos(ang2);
      this.data[1] = -Math.sin(ang2);

      this.data[3] = Math.sin(ang2);
      this.data[4] = Math.cos(ang2);
     // debugger
      this.data[2] = cx*(1 - Math.cos(ang2))+cy*Math.sin(ang2);
      this.data[5] = cy*(1 - Math.cos(ang2))-cx*Math.sin(ang2);
    }else{
      this.data[0] = Math.cos(ang2);
      this.data[1] = -Math.sin(ang2);

      this.data[3] = Math.sin(ang2);
      this.data[4] = Math.cos(ang2);
    }
    
  }

  Rotate(ang1,cx,cy){
    let mt1 = new Matrix();
    mt1.rotate(ang1,cx,cy);
    this.multiply(mt1);
    //mt1.reset()
  }

  mirror(x,y){
    let d1 = -(x*x+y*y);

    this.data[0] = (x*x-y*y)/d1;
    this.data[1] = 2*x*y/d1;

    this.data[3] =2*x*y/d1;
    this.data[4] = -(x*x-y*y)/d1;
  }

  Mirror(x,y){
    let mt1 = new Matrix();
    mt1.mirror(x,y);
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
          // data2[3*i] += this.data[3*i+j] * other.data[3*j + 0];
          // data2[3*i+1] += this.data[3*i+j] * other.data[3*j + 1];
          // data2[3*i+2] += this.data[3*i+j] * other.data[3*j + 2];
          data2[3*i] += other.data[3*i+j] * this.data[3*j + 0];
          data2[3*i+1] += other.data[3*i+j] * this.data[3*j + 1];
          data2[3*i+2] += other.data[3*i+j] * this.data[3*j + 2];
       }
    }
 
    this.data = data2;
  }

  transform(args){
    let vec1  = new Vector();
    //console.log(ModuleGetFnName(args));
    if(arguments.length == 1 && ModuleGetFnName(args) == 'Vector'){
      vec1 = args;
    }else if(arguments.length == 1 && ModuleGetFnName(args) == 'Array'){
      return this.transformDatas(args);
    }else if(arguments.length >= 2){
      vec1  = new Vector(arguments[0],arguments[1]);
    }
   // console.log(vec1)
    let vec2 = new Vector();

    vec2.x = this.data[0]*vec1.x + this.data[1]*vec1.y +this.data[2];
    vec2.y = this.data[3]*vec1.x + this.data[4]*vec1.y +this.data[5];

    return vec2;
  }

  transformDatas(datas){
    let arr2 = [];
    for(let i=0,len=datas.length; i<len;i++){
      let vec2 = this.transform(datas[i].x, datas[i].y);
      arr2.push(vec2)
    }

    return arr2;
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

var TonMath = {};
//计算向量叉乘  
TonMath.crossMul=function(v1,v2){  
    return v1.x*v2.y-v1.y*v2.x;  
}  
//判断两条线段是否相交  
TonMath.checkCross=function(p1,p2,p3,p4){  
     var v1={x:p1.x-p3.x,y:p1.y-p3.y},  
     v2={x:p2.x-p3.x,y:p2.y-p3.y},  
     v3={x:p4.x-p3.x,y:p4.y-p3.y},  
     v=TonMath.crossMul(v1,v3)*TonMath.crossMul(v2,v3)  
     v1={x:p3.x-p1.x,y:p3.y-p1.y}  
     v2={x:p4.x-p1.x,y:p4.y-p1.y}  
     v3={x:p2.x-p1.x,y:p2.y-p1.y}  
     return (v<=0&&TonMath.crossMul(v1,v3)*TonMath.crossMul(v2,v3)<=0)?true:false 
}  
//判断点是否在多边形内  
TonMath.checkPP=function(point,polygon){  
     var p1,p2,p3,p4  
     p1=point  
     p2={x:-100,y:point.y}  
     var count=0  
     //对每条边都和射线作对比  
     for(var i=0;i<polygon.length-1;i++){  
         p3=polygon[i]  
        p4=polygon[i+1]  
         if(TonMath.checkCross(p1,p2,p3,p4)==true){  
             count++  
         }  
     }  
     p3=polygon[polygon.length-1]  
     p4=polygon[0]  
     if(TonMath.checkCross(p1,p2,p3,p4)==true){  
        count++  
     }  
     //  console.log(count)  
     return (count%2==0)?false:true 
} 

//判断两条线段是否相交
TonMath.judgeIntersect = function(x1,y1,x2,y2,x3,y3,x4,y4){

    //快速排斥：
    //两个线段为对角线组成的矩形，如果这两个矩形没有重叠的部分，那么两条线段是不可能出现重叠的

    //这里的确如此，这一步是判定两矩形是否相交
    //1.线段ab的低点低于cd的最高点（可能重合）
    //2.cd的最左端小于ab的最右端（可能重合）
    //3.cd的最低点低于ab的最高点（加上条件1，两线段在竖直方向上重合）
    //4.ab的最左端小于cd的最右端（加上条件2，两直线在水平方向上重合）
    //综上4个条件，两条线段组成的矩形是重合的
    //特别要注意一个矩形含于另一个矩形之内的情况

    if(!(Math.min(x1,x2)<=Math.max(x3,x4) && Math.min(y3,y4)<=Math.max(y1,y2)&&Math.min(x3,x4)<=Math.max(x1,x2) && Math.min(y1,y2)<=Math.max(y3,y4)))
        return false;

    //跨立实验：
    //如果两条线段相交，那么必须跨立，就是以一条线段为标准，另一条线段的两端点一定在这条线段的两段
    //也就是说a b两点在线段cd的两端，c d两点在线段ab的两端
    var u,v,w,z
    u=(x3-x1)*(y2-y1)-(x2-x1)*(y3-y1);
    v=(x4-x1)*(y2-y1)-(x2-x1)*(y4-y1);
    w=(x1-x3)*(y4-y3)-(x4-x3)*(y1-y3);
    z=(x2-x3)*(y4-y3)-(x4-x3)*(y2-y3);
    return (u*v<=0.00000001 && w*z<=0.00000001);
}

//两直线相交点
TonMath.PointIntersect2Line = function(a,b,c,d){
    /** 1 解线性方程组, 求线段交点. **/
    // 如果分母为0 则平行或共线, 不相交 
    var denominator = (b.y - a.y)*(d.x - c.x) - (a.x - b.x)*(c.y - d.y); 
    if (denominator==0) { 
        return null; 
    } 
    
    // 线段所在直线的交点坐标 (x , y) 
    var x = ( (b.x - a.x) * (d.x - c.x) * (c.y - a.y) 
    + (b.y - a.y) * (d.x - c.x) * a.x 
    - (d.y - c.y) * (b.x - a.x) * c.x ) / denominator ; 
    var y = -( (b.y - a.y) * (d.y - c.y) * (c.x - a.x) 
    + (b.x - a.x) * (d.y - c.y) * a.y 
    - (d.x - c.x) * (b.y - a.y) * c.y ) / denominator; 

    return new Vector(x,y);
}

//两直线段相交点
TonMath.PointIntersect2Segment = function(a,b,c,d){
    // 三角形abc 面积的2倍 
    var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x); 
    // 三角形abd 面积的2倍 
    var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x); 
    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理); 
    if ( area_abc*area_abd>=0 ) { 
        return null; 
    } 
    
    // 三角形cda 面积的2倍 
    var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x); 
    // 三角形cdb 面积的2倍 
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出. 
    var area_cdb = area_cda + area_abc - area_abd ; 
    if ( area_cda * area_cdb >= 0 ) { 
        return null; 
    } 
    
    //计算交点坐标 
    var t = area_cda / ( area_abd- area_abc ); 
    var dx= t*(b.x - a.x), 
    dy= t*(b.y - a.y); 
    return new Vector(a.x + dx, a.y + dy);
}

//计算一个点是否在多边形里,参数:点,多边形数组
TonMath.PointInPoly = function(pt, poly) { 
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) 
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) 
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) 
        && (c = !c); 
    return c; 
}

//点是不是 在线段上
TonMath.PointOnSegment = function(x,y,x1,y1,x2,y2){
    let d1 = Math.sqrt((x1 - x)*(x1 - x) + (y1 - y)*(y1 - y));
    let d2 = Math.sqrt((x2 - x)*(x2 - x) + (y2 - y)*(y2 - y));
    let d3 = Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));

    return Math.abs(d3 - d1 - d2) <= 1.0;
}

//点是不是在直线上
TonMath.PointOnLine = function(x,y,x1,y1,x2,y2){
    // let v1 = new Vector(x2 - x1, y2 - y1);
    // let v2 = new Vector(x2 - x, y2 - y);

    // let d1 = v1.cross(v2);
    // console.log(d1)
    // return Math.abs(d1) <= 1;
    //点到直线的距离
    //let pt2 = TonMath.PointProjectLine(x,y,x1,y1,x2,y2);

    let d1 = TonMath.DistancePt2Line(x,y,x1,y1,x2,y2);
    //if(x1 == x2 && x1 == 175 && x < 177) {
    //    console.log(x,y,x1,y1,x2,y2);
     //   //console.log(pt2);
    //    console.log(d1);
   // }
    return d1 <= 1.0;
}

//点在直线段的位置
TonMath.PointSideLine = function(x,y,x1,y1,x2,y2){
    // x = Math.floor(x);
    // y = Math.floor(y);
    // x1 = Math.floor(x1);
    // y1 = Math.floor(y1);
    // x2 = Math.floor(x2);
    // y2 = Math.floor(y2);
    let d1 = (y1 - y2) * x + (x2 - x1) * y + x1 * y2 - x2 * y1;
    //d1 > 0 在左侧
    //d1 = 0 在线上
    //d1 < 0 在右侧
    // if(Math.abs(x - x1) <= 10 && Math.abs(x2 - x1) <= 10)
    // {
    //     console.log(x,y,x1,y1,x2,y2,d1);
    // }
 
    return d1 == 0;
}

//计算 点 到直线段的 最近点
TonMath.PointNearSegment = function(x,y,x1,y1,x2,y2){
    //点投影到直线的 点
    let pt1 = TonMath.PointProjectLine(x,y,x1,y1,x2,y2);

    //判断是不是在此线段内
    if(TonMath.PointOnSegment(pt1.x,pt1.y,x1,y1,x2,y2)){
        return pt1;
    }

    //计算到两个端点的最近距离
    let d1 = TonMath.Distance2Point(x,y,x1,y1);
    let d2 = TonMath.Distance2Point(x,y,x2,y2);

    if(d1 < d2){
        return new Vector(x1, y1);
    }

    return new Vector(x2,y2);
}

//计算 投影 到直线的 点
TonMath.PointProjectLine = function(x,y,x1,y1,x2,y2){
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //线段长度不能为0
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return new Vector(xx,yy);
}

//正常的 方法
TonMath.DistancePt2LineEx = function(x,y,x1,y1,x2,y2){
    //首先计算 投影 到直线段的 点
    var pt1 = TonMath.PointProjectLine(x,y,x1,y1,x2,y2);
    var dx = x - pt1.x;
    var dy = y - pt1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

//两点距离
TonMath.Distance2Point = function(x1,y1,x2,y2){
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}


//点到直线的距离
TonMath.DistancePt2Line = function(x,y,x1,y1,x2,y2){
    //面积法 
    //三角形三个边长
    var A = Math.abs(Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2)));
    var B = Math.abs(Math.sqrt(Math.pow((x - x2), 2) + Math.pow((y - y2), 2)));
    var C = Math.abs(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));

    if(C == 0){
        //点到点的距离
        return Math.sqrt((x1 - x)*(x1 - x) + (y1 - y)*(y1 - y));
    }
    //利用海伦公式计算三角形面积
    //周长的一半
    var P = (A + B + C) / 2;
    var allArea = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)));
    //普通公式计算三角形面积反推点到线的垂直距离
    var dis = (2 * allArea) / C;

    // if(Math.abs(x - x1) <= 10 && Math.abs(x2 - x1) <= 10)
    // {
    //     console.log(x,y,x1,y1,x2,y2,dis);
    // }
 
    return dis;
}

//两个线段之间的最近距离
TonMath.DistanceSeg2Seg = function(x1,y1,x2,y2,x3,y3,x4,y4){
    let a = new Vector(x1,y1);
    let b = new Vector(x2,y2);
    let c = new Vector(x3, y3);
    let d = new Vector(x4,y4)
    //两个线段是否有交点
    let pt1 = TonMath.PointIntersect2Segment(a,b,c,d);
    if(pt1){
        //有交点
        return 0;
    }

    let d0 = TonMath.DistancePt2Line(x3,y3,x1,y1,x2,y2);
    let d1 = TonMath.DistancePt2Line(x4,y4,x1,y1,x2,y2);
    let d2 = TonMath.DistancePt2Line(x1,y1,x3,y3,x4,y4);
    let d3 = TonMath.DistancePt2Line(x2,y2,x3,y3,x4,y4);

    return Math.min(d0,d1,d2,d3);
}

//两段线段是否 共线
TonMath.CheckCollinear = function(x1,y1,x2,y2,x3,y3,x4,y4){
    let b1 = TonMath.PointOnLine(x1,y1,x3,y3,x4,y4);
    let b2 = TonMath.PointOnLine(x2,y2,x3,y3,x4,y4);
    let b3 = TonMath.PointOnSegment(x1,y1,x3,y3,x4,y4);
    let b4 = TonMath.PointOnSegment(x2,y2,x3,y3,x4,y4);

    if(b1 && b2){
        if(b3 || b4){
            return true;
        }
        
    }

    return false;
}

TonMath.GetAngle = function(x1,y1,x2,y2){
    let vec1 = new Vector(x2 - x1, y2 - y1);
    return vec1.angle();
}


//角度化整
TonMath.FitAngle = function(ang1){
    let ang2 = ang1;
    ang1 = ang1 % 360;
    
    if(ang1 < 0){
        ang1 = 360+ang1;
    }
    
    let toler1 = 4;
    if(ang1 >0 && ang1 <=toler1){
        ang1 = 0;
    }else if(ang1 >= (360-toler1) && ang1 <= 360){
        ang1 = 360;
    }else if(ang1 >=(45-toler1) && ang1 <= (45+toler1)){
        ang1 = 45;
    }else if(ang1 >=(90-toler1) && ang1 <= (90 + toler1)){
        ang1 = 90;
    }else if(ang1 >=(135-toler1) && ang1 <= (135 + toler1)){
        ang1 = 135;
    }else if(ang1 >=(180-toler1) && ang1 <= (180 + toler1)){
        ang1 = 180;
    }else if(ang1 >=(225-toler1) && ang1 <= (225 + toler1)){
        ang1 = 225;
    }else if(ang1 >=(270-toler1) && ang1 <= (270 + toler1)){
        ang1 = 270;
    }else if(ang1 >=(315-toler1) && ang1 <= (315 + toler1)){
        ang1 = 315;
    }
   // console.log(ang2, ang1)

    return ang1;
}