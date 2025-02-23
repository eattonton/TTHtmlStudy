class Polygon{
    constructor(ctx,datas,scale,color){
        this.ctx = ctx;
        this.datas = datas;
        this.scale = scale || 1.0;
        this.color = color || "#fff";
        this.mt = new Matrix();
        this.datas2 = [];   //临时的变换后坐标系 

        this.mx = 0;
        this.my = 0;
        this.ang = 0;
        this.selection = false;

        //拾取时零件内的坐标
        this.center =new Vector(0,0);
        this.center2 =new Vector(0,0);  //临时的变换后坐标系 
        //是否镜像
        this.objmirror = false;
        //碰靠点
        this.touch = false;
        this.touchx = 0;
        this.touchy = 0;

        //记录位置
        this.savemx = 0;
        this.savemy = 0;
        this.saveang = 0;
    }

    SavePosition(){
        this.savemx = this.mx;
        this.savemy = this.my;
        this.saveang = this.ang;
    }

    RestorePosition(){
        this.mx = this.savemx;
        this.my = this.savemy;
        this.ang = this.saveang;
        this.transform();
    }

    move(mx,my){
        this.mx = mx !== undefined?mx: this.mx;
        this.my = my !== undefined?my: this.my;
        this.transform();
    }

    rotate(ang){
        this.ang = ang !== undefined?ang: this.ang;
       // if(this.objmirror) this.ang = -this.ang;
       //if(this.objmirror){
        //this.ang = 180 + this.ang;
       //}
        this.transform();
    }

    mirror(){
        this.objmirror = !this.objmirror;
        this.transform();
    }

    transform(){
        this.mt.reset();
        this.mt.scale(this.scale);
        //镜像
        if(this.objmirror) this.mt.Mirror(0,1);
         //旋转 (弧度)
        this.mt.Rotate(this.ang,this.center.x*this.scale, this.center.y*this.scale);
         
         //根据绘制点的偏移
        this.mt.Translate(this.mx, this.my);
 
      //  this.mt.Translate(-this.center.x,-this.center.y);
        //根据图片原点的移动
       // this.mt.Translate(-this.pickX, -this.pickY);
        //transform(m11,m12,m21,m22,dx,dy);
       // this.ctx.transform(this.mt.data[0],this.mt.data[3],this.mt.data[1],this.mt.data[4],this.mt.data[2],this.mt.data[5]);
        this.datas2 = this.mt.transform(this.datas);
        this.center2 = this.mt.transform(this.center);
    }

    draw(mx,my,ang){
        this.mx = mx !== undefined?mx: this.mx;
        this.my = my !== undefined?my: this.my;
        this.ang = ang !== undefined?ang: this.ang;
        this.ctx.save();
        //数据变换
        this.transform();
        //绘制多边形
        this.ctx.strokeStyle = this.selection ?"#000": "#CDCDCD";  //图形边框的填充颜色
        this.ctx.fillStyle = this.color;
        this.ctx.lineWidth = 3;  //用宽度为 5 像素的线条来绘制矩形： 
        this.ctx.beginPath();
        for(let i=0,len=this.datas2.length; i<len;i++){
            if(i == 0){
               this.ctx.moveTo(this.datas2[i].x, this.datas2[i].y);
            }else if(i == len - 1){
               this.ctx.lineTo(this.datas2[i].x, this.datas2[i].y);
               this.ctx.lineTo(this.datas2[0].x, this.datas2[0].y);
            }else{
               this.ctx.lineTo(this.datas2[i].x, this.datas2[i].y);
            }
        }
        this.ctx.fill();
        this.ctx.stroke();
 
        this.ctx.closePath();
        //绘制中心 
        //this.ctx.beginPath();
        //this.ctx.arc(this.center2.x,this.center2.y, 10, 0, Math.PI * 2, true);  
        //this.ctx.stroke();
        //this.ctx.closePath();

        //恢复
        this.ctx.restore();
        //如果是选中状态
        //this.drawBorder();
    }
    //拾取
    pick(x,y){
        let mt2 = this.mt.invert();
        let pos2 = mt2.transform(x,y);
       // this.center.x = pos2.x;
       // this.center.y = pos2.y;
        this.selection = this.checkIn(x,y);
        return this.selection;
    }

    //拾取边 获取边的序号
    pickEdge(x,y){
        for(let i=0,len=this.datas2.length; i<len;i++){
            let x1 = this.datas2[i].x;
            let y1 = this.datas2[i].y;
            let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
            let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;

            let b1 = TonMath.PointOnSegment(x,y,x1,y1,x2,y2);
            if(b1){
                this.selection = b1;
                return i;
            }
        }

        return -1;
    }

    checkIn(x,y){
        return TonMath.PointInPoly({x:x,y:y}, this.datas2);
    }

    //点 投影到 多边形 边的距离
    ProjectPoint(x,y){
        let distMin = 10000;
        let xmin = 0;
        let ymin = 0;
        for(let i=0,len=this.datas2.length; i<len;i++){
            let x1 = this.datas2[i].x;
            let y1 = this.datas2[i].y;
            let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
            let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;
            //投影到 某个边的点
            let pt2 = TonMath.PointNearSegment(x,y,x1,y1,x2,y2);
            let d2 =TonMath.Distance2Point(x, y, pt2.x, pt2.y);
            if(d2 < distMin){
                distMin = d2;
                xmin = pt2.x;
                ymin = pt2.y;
            }
        }
    
        return {d:distMin, v:new Vector(xmin, ymin)}; 
    }

    Distance(other){
        let distMin = 10000;
        for(let i=0,len=this.datas2.length; i<len;i++){
            let x1 = this.datas2[i].x;
            let y1 = this.datas2[i].y;
            let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
            let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;
            for(let j=0,len2=other.datas2.length; j<len2;j++){
                let x3 = other.datas2[j].x;
                let y3 = other.datas2[j].y;
                let x4 = j==(len2-1)?other.datas2[0].x : other.datas2[j+1].x;
                let y4 = j==(len2-1)?other.datas2[0].y : other.datas2[j+1].y;
                //1.计算线段距离
                let dist2 = TonMath.DistanceSeg2Seg(x1,y1,x2,y2,x3,y3,x4,y4);
                //2.线段距离最短的
                if(dist2 < distMin){
                    distMin = dist2;
                }
            }
    
          }
    
          return distMin;
    }

    //计算touch点
    TouchPoint(other){
        let pt1 = null;
        let distMin = 10000;
        for(let i=0,len=this.datas2.length; i<len;i++){
            let obj1 = other.ProjectPoint(this.datas2[i].x, this.datas2[i].y);
            if(obj1 && obj1.d < distMin){
                distMin = obj1.d;
                pt1 =obj1.v;
            }
        }

        for(let i=0,len=other.datas2.length; i<len;i++){
            let obj1 = this.ProjectPoint(other.datas2[i].x, other.datas2[i].y);
            if(obj1 && obj1.d < distMin){
                distMin = obj1.d;
                pt1 =obj1.v;
            }
        }

        this.touchx = pt1.x;
        this.touchy = pt1.y;
        other.touchx = pt1.x;
        other.touchy = pt1.y;
    }

    //两个是否碰靠
    Collision(other){
        this.touch = false;
        for(let i=0,len=this.datas2.length; i<len;i++){
          if(TonMath.PointInPoly({x:this.datas2[i].x,y:this.datas2[i].y}, other.datas2)){
                this.touch = true;
                other.touch = true;
                return true;
          }
        }

        for(let i=0,len=other.datas2.length; i<len;i++){
          if(TonMath.PointInPoly({x:other.datas2[i].x,y:other.datas2[i].y}, this.datas2)){
                this.touch = true;
                other.touch = true;
                return true;
          }
        }

        return false;
    }

    //对齐
    align(other){
      for(let i=0,len=this.datas2.length; i<len;i++){
        let x1 = this.datas2[i].x;
        let y1 = this.datas2[i].y;
        let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
        let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;
        for(let j=0,len2=other.datas2.length; j<len2;j++){
            let x3 = other.datas2[j].x;
            let y3 = other.datas2[j].y;
            let x4 = j==(len2-1)?other.datas2[0].x : other.datas2[j+1].x;
            let y4 = j==(len2-1)?other.datas2[0].y : other.datas2[j+1].y;
            //1.计算交点
            let inter1 = TonMath.judgeIntersect(x1,y1,x2,y2,x3,y3,x4,y4);
            //2.如果有交点 就获得 other 的边的角度
            if(inter1){
                let vec1 =new Vector(x4-x3,y4-y3);
                return vec1.angle();
            }
        }

      }

      return null;
    }

    //平行
    Parallel(other){
        for(let i=0,len=this.datas2.length; i<len;i++){
            let x1 = this.datas2[i].x;
            let y1 = this.datas2[i].y;
            let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
            let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;
            for(let j=0,len2=other.datas2.length; j<len2;j++){
                let x3 = other.datas2[j].x;
                let y3 = other.datas2[j].y;
                let x4 = j==(len2-1)?other.datas2[0].x : other.datas2[j+1].x;
                let y4 = j==(len2-1)?other.datas2[0].y : other.datas2[j+1].y;
                
                if(TonMath.DistancePt2Line(x3,y3,x1,y1,x2,y2)<=0.1
                         && TonMath.DistancePt2Line(x4,y4,x1,y1,x2,y2)<=0.1){
                    return true;
                }
            }
    
        }
    
        return false;
    }

    //两条线是否共线
    Collinear(other){
        for(let i=0,len=this.datas2.length; i<len;i++){
            let x1 = this.datas2[i].x;
            let y1 = this.datas2[i].y;
            let x2 = i==(len-1)?this.datas2[0].x : this.datas2[i+1].x;
            let y2 = i==(len-1)?this.datas2[0].y : this.datas2[i+1].y;
            for(let j=0,len2=other.datas2.length; j<len2;j++){
                let x3 = other.datas2[j].x;
                let y3 = other.datas2[j].y;
                let x4 = j==(len2-1)?other.datas2[0].x : other.datas2[j+1].x;
                let y4 = j==(len2-1)?other.datas2[0].y : other.datas2[j+1].y;
                
                if(TonMath.CheckCollinear(x1,y1,x2,y2,x3,y3,x4,y4)){
                    return true;
                }
            }
    
        }
    
        return false;
    }


}