var m_Handles = new Array();
var m_SelHandleIdx = -1;
var m_ScreenCenX = 0.0;
var m_ScreenCenY = 0.0;
//表盘
var m_clockPlate =null;
var m_SecondIdx = 0;
var m_MinuteIdx = 0;
var m_HourIdx = 0;

var m_clickIdx =0;  

var m_Buttons = null;
var m_TimePanel = null;

//题目的时候的时间
var m_puizHour = 0;
var m_puizMinute = 0;

//回答的时间
var m_answerHour = 0;
var m_answerMinute = 0;

var m_quizStart = false;

function getMousePos(canvas, e, cb) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left * (canvas.width / rect.width);
    let y = e.clientY - rect.top * (canvas.height / rect.height);
    //console.log("m-x:"+x+",m-y:"+y);
    
    if(typeof cb == "function") cb(x,y);
}

function getTouchPos(canvas, e, cb){
    e.preventDefault();
    if (!e.touches.length) return;
    let touch = e.touches[0];
 
    //let x = touch.pageX;
    //let y = touch.pageY;
    let rect = canvas.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;

    //console.log("t-x:"+x+",t-y:"+y);
    if(typeof cb == "function") cb(x,y);
}

function funMouseDown(x,y){
    //1.判断是不是点击了按钮
    // if(m_Buttons.checkClick(x,y)){
    //   return;
    // }

    m_SelHandleIdx = -1;
    for(idx in m_Handles){
       m_Handles[idx].selection = false;
    }
    //2.判断是不是 选中指针
    for(idx in m_Handles){
       let handle1 = m_Handles[idx];
       if(handle1.pick(x,y)){
          //绘制高亮边界
          //handle1.drawBorder();
          m_SelHandleIdx = idx;
          break;
       }
    }
 
    redraw();
}

function funMouseMove(x,y){
    if(m_SelHandleIdx < 0) return;
    //1.计算点后的表盘上的角度
    let angAxis = m_clockPlate.getAngle(x,y);
  
    if(m_SelHandleIdx == 0){
      m_HourIdx = parseInt(angAxis/30);
    }else if(m_SelHandleIdx == 1){
      m_MinuteIdx = parseInt(angAxis/6);
    }else if(m_SelHandleIdx == 2){
      m_SecondIdx = parseInt(angAxis/6);
    }

    redraw();
}

function unSelectAll(){
    m_SelHandleIdx = -1;
    for(idx in m_Handles){
       m_Handles[idx].selection = false;
    }
    redraw();
}

function initNowTime(){
  let d = new Date();
  m_SecondIdx = d.getSeconds();
  m_MinuteIdx = d.getMinutes();
  m_HourIdx = d.getHours();
  if(m_HourIdx >= 12){
    m_HourIdx -= 12;
  }
}

//重新绘制
function redraw(){
  //背景
  m_clockPlate.draw();
  //指针
  let angHour2 = parseInt(m_MinuteIdx / 12);
  if(m_quizStart){
      m_Handles[0].draw(m_HourIdx*6*5);
  }else{
      m_Handles[0].draw(m_HourIdx*6*5 + angHour2*6);
  }

  m_Handles[1].draw(m_MinuteIdx*6);
//  m_Handles[2].draw(m_SecondIdx*6);
}

//自动走时
function runAutomationTime(){
   let mov1 = setInterval(()=>{
      ++m_SecondIdx;
      if(m_SecondIdx >= 60){
        m_SecondIdx = 0;
        ++m_MinuteIdx;
      }

      if(m_MinuteIdx >= 60){
        m_MinuteIdx = 0;
        ++m_HourIdx;
      }

      if(m_HourIdx >= 12){
        m_HourIdx = 0;
      }
      
      //绘制
      redraw();
    },10);

   return mov1;
}
 
window.onload = function() {
    const canvas = document.getElementById("gameboard");
    const ctx = canvas.getContext("2d");

    $('#alert').hide();
    // 监听点击事件
    canvas.addEventListener("click", (e)=> {
      // if((m_clickIdx % 2)==0){
          getMousePos(canvas, e, funMouseDown);
       // }else{
       //   unSelectAll();
       // }
        
       // ++m_clickIdx;
  
    });

    canvas.addEventListener("touchmove",function(e){
        getTouchPos(canvas, e, funMouseMove);
    });
    
 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let width = canvas.width;
    let height = canvas.height;

    m_ScreenCenX = 0.5*width;
    m_ScreenCenY = 0.5*height;
 
    let cellWidth = parseInt(width/4);

    var imgPaths = ["./C0.png","./C1.png","./C2.png","./E0.png","./button0.jpg"];
    var imgs = [];
    var panel1;
    //加载图片s
    ModuleLoadImgs(imgPaths,(res)=>{
        imgs = res;
        if(imgs.length >= 4){
            m_clockPlate = new ClockPlate(ctx,imgs[0],width,height,m_ScreenCenX, m_ScreenCenY);
            m_clockPlate.draw();

            //计算图片比例
            let scale = width/imgs[0].width;
            //读取当前时间
            initNowTime();

            let handle1 = new ClockHandle(ctx,imgs[1],13,58,scale,m_ScreenCenX, m_ScreenCenY);
            m_Handles.push(handle1);
 
            let handle2 = new ClockHandle(ctx,imgs[2],8,81,scale,m_ScreenCenX, m_ScreenCenY);
            m_Handles.push(handle2);

           // let handle3 = new ClockHandle(ctx,imgs[3],10,246,scale,m_ScreenCenX, m_ScreenCenY);
           // m_Handles.push(handle3);

            m_TimePanel = new TimePanel(ctx,imgs[3],width,height);
            m_TimePanel.drawAll();

            // m_Buttons = new ButtonPanel(ctx,imgs[5],width,height);
            // m_Buttons.drawAll();
            // //定义执行函数
            // m_Buttons.defFuns();
            //绘制
            redraw();
            //设置动画
           // let mov1 = runAutomationTime();

           // clearInterval(mov1);
        }

        //出题
        const btn1 = document.getElementById("btn1");
        btn1.onclick = function(){
            m_quizStart = true;
            //1. 创建时间随机数
            m_puizHour = Math.floor(Math.random() * 24);
            m_puizMinute = Math.floor(Math.random() * 60);

            let arr1 = m_TimePanel.resetTimeIndex(m_puizHour, m_puizMinute);
            m_TimePanel.drawByIndex(arr1);
        }

        //判断
        const btn2 = document.getElementById("btn2");
        btn2.onclick = function(){
          let h = m_puizHour;
          let m = m_puizMinute;

          if(h >= 12) h -= 12;
          console.log(h, m);
          console.log(m_HourIdx, m_MinuteIdx);
          if(h == m_HourIdx && m == m_MinuteIdx){
            //console.log("right")
            $('#alert').removeClass('alert-warning').addClass('alert-success').show().delay(2500).fadeOut();
            m_quizStart = false;
            //绘制
            redraw();
          }else{
            //console.log("wrong")
            $('#alert').removeClass('alert-success').addClass('alert-warning').show().delay(2500).fadeOut();
          }
        }
    });
 
    // function funFade(img){
    //     //1.绘制
    //     ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, cellWidth, cellWidth);
    //     //2.淡出
    //     let fade1 = new FadeHelper(ctx,img,0,0,cellWidth, cellWidth);
    //     fade1.StartFadeOut(()=>{
    //        panel1.resetCell(0);
    //     });
    // }

}

//表盘
class ClockPlate{
    constructor(ctx,img,width,height,screenX,screenY){
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.img = img;
        this.screenCenX = screenX;
        this.screenCenY = screenY;
    }

    draw(){
        let hei2 = (this.height - this.width)*0.5;
        this.ctx.drawImage(this.img, 0, hei2, this.width, this.width);
    }
    
    //表盘上的时钟上的点
    getAngle(x,y){
      let axis1 = new Vector(x - this.screenCenX, y - this.screenCenY);
      let axisAng1 =parseInt(axis1.angle() - 270.0);
      if(axisAng1 < 0) axisAng1 = 360+axisAng1;
      //保证是6的倍数
      let num = parseInt(axisAng1 / 6);
      let num2 = axisAng1 % 6;
      if(num2 >= 3){
        ++num;
      }
      axisAng1 = num * 6;
      if(axisAng1 >= 360.0) axisAng1 = 0;
      return axisAng1;
    }
}

//表针
class ClockHandle{
    constructor(ctx,img,bmpCenX,bmpCenY,scale,screenX,screenY){
        this.ctx = ctx;
        this.width = img.width * scale;
        this.height = img.height * scale;
        this.img = img;
        this.drawCenX = bmpCenX*scale;
        this.drawCenY = bmpCenY*scale;
        this.mt = new Matrix();
        this.range = new ImgDrawRange(img,bmpCenX,bmpCenY,scale);
        this.selection = false;
        this.screenCenX = 0;
        this.screenCenY = 0;
        this.screenCenX = screenX;
        this.screenCenY = screenY;
    }

    draw(ang,drawX,drawY){
        this.ctx.save();
        this.mt.reset();
        //根据绘制点的偏移
        this.mt.Translate(this.screenCenX, this.screenCenY);
        //旋转 (弧度)
        this.mt.Rotate(ang);
        //根据图片原点的移动
        this.mt.Translate(-this.drawCenX, -this.drawCenY);
        //transform(m11,m12,m21,m22,dx,dy);
        this.ctx.transform(this.mt.data[0],this.mt.data[3],this.mt.data[1],this.mt.data[4],this.mt.data[2],this.mt.data[5]);
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height);
        this.ctx.restore();
        //如果是选中状态
        this.drawBorder();
    }

    //绘制边界
    drawBorder(){
       if(this.selection){
          this.ctx.save();
          this.ctx.transform(this.mt.data[0],this.mt.data[3],this.mt.data[1],this.mt.data[4],this.mt.data[2],this.mt.data[5]);
          //绘制矩形
          this.ctx.strokeStyle = "#28E3ED";  //图形边框的填充颜色
          this.ctx.lineWidth = 3;  //用宽度为 5 像素的线条来绘制矩形：  
          this.ctx.strokeRect(0, 0, this.width, this.height);
          this.ctx.restore();
       }
    }

    pick(x,y){
       this.selection = false;
       let mt2 = this.mt.invert();
       let pos2 = mt2.transform(x,y);
       if(this.range.checkIn(pos2.x, pos2.y)){
         //alert("pick")
         this.selection = true;
       }

       return this.selection;
    }
}

//记录图片的范围坐标
class ImgDrawRange{
  constructor(img,bmpCenX,bmpCenY,scale){
      this.width = img.width * scale;
      this.height = img.height * scale;
      this.img = img;
      this.drawCenX = bmpCenX*scale;
      this.drawCenY = bmpCenY*scale;

      this.minx =0;
      this.miny =0;
      this.maxx = this.width;
      this.maxy = this.height;
      // this.minx = -this.drawCenX;
      // this.miny = -this.drawCenY;
      // this.maxx = this.width - this.drawCenX;
      // this.maxy = this.height - this.drawCenY;
  }

  checkIn(x,y){
    if(x >= this.minx && x <= this.maxx && y >= this.miny && y <= this.maxy){
       return true;
    }
    return false;
  }
}

//时间显示
class TimePanel{
  constructor(ctx, img, width, height){
      this.ctx = ctx;
      this.img = img;
      //传入的画布大小
      this.width = width;
      this.height = height;
      //控制panel绘制的起始位置
      this.drawStartX = 30;
      this.drawStartY = 60;
      this.cells = [];
      this.numCell = 5;  //单元的数量
      //图对应的索引表
      this.cellIndex = {0:10,1:0,2:1,3:2,4:3,5:4,6:6,7:7,8:8,9:9,":":17};
      //显示时换行列数
      this.maxColNum = 5;
      this.Load();
      
  }

  Load(){
   
    //绘图cell的大小
    let drawCellW = parseInt(this.width/8.5);
    let drawCellH = parseInt(drawCellW * 1.6);
 
    let arrIdx = this.LoadTimeIndex();
    for(let i in arrIdx){
      let idx = arrIdx[i];
      let cell1 = new TimeCell(this.ctx, idx, this.img);
      
      //计算cell的位置
      let drawCellX =this.drawStartX + drawCellW * (i % this.maxColNum);
      let drawCellY =this.drawStartY + drawCellH * parseInt(i / this.maxColNum);
      //设置参数
      cell1.setupParams(idx, drawCellX, drawCellY, drawCellW, drawCellH);

      this.cells.push(cell1);
    }
  }

  LoadTimeIndex(){
    let d = new Date();
    let m = d.getMinutes();
    let h = d.getHours();

    return this.resetTimeIndex(h,m);
  }

  resetTimeIndex(h,m){
    let arr1 = new Array();

    arr1[0] = this.cellIndex[parseInt(h/10)];
    arr1[1] = this.cellIndex[h%10];
    arr1[2] = this.cellIndex[":"];
    arr1[3] = this.cellIndex[parseInt(m/10)];
    arr1[4] = this.cellIndex[m%10];

    return arr1;
  }

  drawAll(){
     for(let i=0;i<this.cells.length;i++){
        //绘制
        this.cells[i].draw();
     }
  }

  drawByIndex(arr1){
    for(let i in arr1){
        this.cells[i].idx = arr1[i];
        this.cells[i].draw();
    }
  }
}

class TimeCell{
  constructor(ctx,id,img){
    this.ctx = ctx;
    this.id = id;
    this.img = img;
    //图片的单元数
    this.imgCellNum = 4;
    //图片的列数
    this.colNum = 6;
    //截图图的范围
    this.iStartX = 0;
    this.iStartY = 0;
    this.iEndX = 80;
    this.iEndY =180;

    this.imgData0;
    this.imgData1;
    //this.colNum2 = drawCol;
  }

   //设置参数
  setupParams(idx,drawX,drawY,drawW, drawH){
     this.idx = idx;
     this.drawX = drawX;
     this.drawY = drawY;
     this.drawW = drawW;
     this.drawH = drawH;
  }

  draw(){
     let ir = parseInt( this.idx / this.colNum);
     let ic = this.idx % this.colNum;

     this.ctx.strokeStyle = "#E5E5E5";
     this.ctx.fillStyle = "#E5E5E5";
     this.ctx.fillRect(this.drawX, this.drawY, this.drawW, this.drawH);
     //从图片的10,10 坐标开始截图，截取 80，80 这么大
     //从0,0 开始画，缩放到300,300
     let data0 = this.ctx.drawImage(this.img, this.iStartX + this.iEndX * ic, this.iStartY + this.iEndY * ir,
         (this.iEndX - this.iStartX),(this.iEndY - this.iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
     this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
     //返回数据
     return this.imgData0;
  }
  
}

//按钮显示
class ButtonPanel{
  constructor(ctx, img, width, height){
      this.ctx = ctx;
      this.img = img;
      //传入的画布大小
      this.width = width;
      this.height = height;
      this.cells = [];
      this.numCell = 2;  //单元的数量
      //显示时换行列数
      this.maxColNum = 2;
      this.Load();
      
  }

  Load(){
    //控制panel绘制的起始位置
    let drawStartX = 20;
    let drawStartY = this.height-140;
    //绘图cell的大小
    let drawCellW = parseInt(this.width/2.2);
    let drawCellH = parseInt(drawCellW * 0.5);
 
    let arrIdx = [0,1];
    for(let i in arrIdx){
      let idx = arrIdx[i];
      let cell1 = new ButtonCell(this.ctx, idx, this.img);
      
      //计算cell的位置
      let drawCellX =drawStartX + drawCellW * (i % this.maxColNum);
      let drawCellY =drawStartY + drawCellH * parseInt(i / this.maxColNum);
      //设置参数
      cell1.setupParams(idx, drawCellX, drawCellY, drawCellW, drawCellH);

      this.cells.push(cell1);
    }
  }
 
  drawAll(){
     for(let i=0;i<this.cells.length;i++){
        //绘制
        this.cells[i].draw();
     }
  }

  checkClick(x,y){
    for(let i in this.cells){
      if(this.cells[i].checkClick(x,y)){
         return true;
      }
    }

    return false;
  }

  defFuns(){
    this.cells[0].onclick = function(){
       alert("1");
    }

    this.cells[1].onclick = function(){
       alert("2");
    }
  }
}

class ButtonCell{
  constructor(ctx,id,img){
    this.ctx = ctx;
    this.id = id;
    this.img = img;
    //图片的单元数
    this.imgCellNum = 2;
    //图片的列数
    this.colNum = 1;
    //截图图的范围
    this.iStartX = 0;
    this.iStartY = 0;
    this.iEndX = 260;
    this.iEndY = 110;

    this.imgData0;
    this.imgData1;
    //this.colNum2 = drawCol;
  }

   //设置参数
  setupParams(idx,drawX,drawY,drawW, drawH){
     this.idx = idx;
     this.drawX = drawX;
     this.drawY = drawY;
     this.drawW = drawW;
     this.drawH = drawH;
  }

  draw(){
     let ir = parseInt( this.idx / this.colNum);
     let ic = this.idx % this.colNum;
     //从图片的10,10 坐标开始截图，截取 80，80 这么大
     //从0,0 开始画，缩放到300,300
     let data0 = this.ctx.drawImage(this.img, this.iStartX + this.iEndX * ic, this.iStartY + this.iEndY * ir,
         (this.iEndX - this.iStartX),(this.iEndY - this.iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
     this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
     //返回数据
     return this.imgData0;
  }

  //检查是被点击
  checkClick(x,y){
    let minx = this.drawX;
    let miny = this.drawY;
    let maxx = this.drawX + this.drawW;
    let maxy = this.drawY + this.drawH;
    if(x >= minx && x <= maxx && y >= miny && y <= maxy){
        if(this["onclick"] !== undefined){
          if(typeof this["onclick"] == "function") this["onclick"]();
        }
       return true;
    }
    return false;
  }
  
}


//fadeOut(context, , 0, 0, 20, 1000 / 60);
class FadeHelper{
    constructor(ctx,img,x,y,width,height){
       this.ctx = ctx;
       this.x = x;
       this.y = y;
       this.width = width;
       this.height = height;

       this.originalImageData = ctx.getImageData(x, y,  width, height);

    }

    StartFadeOut(cbComplete){
      this.fadeOut(this.ctx.getImageData(this.x, this.y,  this.width, this.height),20,1000 / 60,cbComplete);

    }

    //绘制原图
    drawOriginalImage() {
        this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    }
    //淡出动画
    fadeOut(imageData, steps, millisecondsPerStep, cbComplete) {
        var frame = 0;
        var length = imageData.data.length;
        var that = this;

        var interval = setInterval(function () {
            frame++;
            if (frame > steps) {
                clearInterval(interval);
               // animationComplete();
               if(typeof cbComplete === "function") cbComplete();

            } else {
                that.increaseTransperency(imageData, steps);
                that.ctx.putImageData(imageData, that.x, that.y);
            }
        }, millisecondsPerStep);
    }

    //每帧升高的透明度
   increaseTransperency(imageData, steps) {
        var alpha;
        var currentAlpha;
        var alphaStep;
        var length = imageData.data.length;

        for (var i = 3; i < length; i += 4) {
            alpha = this.originalImageData.data[i]; //最初的透明度

            if (alpha > 0 && imageData.data[i] > 0) { //最初透明度及现在的透明度都不为0时
                currentAlpha = imageData.data[i];
                alphaStep = Math.ceil(alpha / steps);
                if (currentAlpha - alphaStep > 0) { //直至最接近于0
                    imageData.data[i] -= alphaStep;
                } else { //最后等于0
                    imageData.data[i] = 0;
                }
            }
        }
    }

    

    //结束后
   animationComplete() {
        setTimeout(function () {
            this.drawOriginalImage();
            onOff = true;
        }, 1000)
    }
 
}
    

class BoxPanel{
  constructor(ctx,img,width,height){
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    // 内存中先加载，然后当内存加载完毕时，再把内存中的数据填充到我们的 dom元素中，
    // 这样能够快速的去反应，
    this.img = img;
    this.cells = [];
    this.numCell = 24;
    this.Load();
  }

  Load(){
    let drawStartX = 0;
    let drawStartY = 0;
    let drawW = parseInt(this.width/4);
    let drawH = drawW;
    
    //let numBox = 12;
    let colNum2 =4;

    let arrIdx = [];
    for(let i=0;i<this.numCell;i++){
      //console.log(idx);
      let cell1 = new BoxCell(this.ctx, i, this.img);
      let idx =0;
      let count1 = 0;
      do
      {
        idx = cell1.getRandIdx();
        count1 = this.findCount(arrIdx, idx);
      }while(count1 >= 2)

      arrIdx.push(idx);
      let drawX =drawStartX + drawW * (i % colNum2);
      let drawY =drawStartY + drawH * parseInt(i / colNum2);

      cell1.setupParams(idx,drawX,drawY,drawW,drawH);

      this.cells.push(cell1);
      
    }
 
  }

  drawAll(){
     for(let i=0;i<this.numCell;i++){
        //绘制
        this.cells[i].draw();
     }
  }

  drawCovers(cover){
    for(let i=0;i<this.numCell;i++){
        //绘制封面
        this.cells[i].drawCover(cover);
     }
  }

  resetCell(idx){
    this.cells[idx].resetImage(0);
  }
  
  //查找数组的数量
  findCount(arr1, idx){
    let count = 0;
    for(let i in arr1){
      if(arr1[i] == idx){
        ++count;
      }
    }

    return count;
  }
}

class BoxCell{
  constructor(ctx,id,img){
    this.ctx = ctx;
    this.id = id;
    this.img = img;

    this.imgCellNum = 12;
    this.colNum = 3;
    this.imgData0;
    this.imgData1;
    //this.colNum2 = drawCol;
  }

  getRandIdx(){
     return Math.floor(Math.random() * this.imgCellNum);
  }
  
  //设置参数
  setupParams(idx,drawX,drawY,drawW, drawH){
     this.idx = idx;
     this.drawX = drawX;
     this.drawY = drawY;
     this.drawW = drawW;
     this.drawH = drawH;
  }

  draw(){
     let ir = parseInt( this.idx / this.colNum);
     let ic = this.idx % this.colNum;
     //从图片的10,10 坐标开始截图，截取 80，80 这么大
     //从0,0 开始画，缩放到300,300
     let iStartX = 5;
     let iStartY = 5;
     let iEndX = 85;
     let iEndY =85;
 
     let data0 = this.ctx.drawImage(this.img, iStartX + iEndX * ic, iStartY + iEndY * ir,
         (iEndX - iStartX),(iEndY - iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
     this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
     //返回数据
     return this.imgData0;
  }
  
  //绘制封皮
  drawCover(cover){
     //从0,0 开始画，缩放到200,200
     this.ctx.drawImage(cover,this.drawX, this.drawY, this.drawW, this.drawH);
     this.imgData1 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
     return this.imgData1;
  }

  resetImage(idx){
    if(idx == 0 && this.imgData0){
       this.ctx.putImageData(this.imgData0, this.drawX, this.drawY);
    }
    else if(idx == 1 && this.imgData1){
       this.ctx.putImageData(this.imgData1, this.drawX, this.drawY);
    }
  }
}

class Gameboard{
    constructor(){
        this.startTime;
        //debugger
        this.init();
    }

    init(){
        this.circles = [
          new Circle(ctx, 30, 50, 30, -100, 390, 30, 0.7),
          new Circle(ctx, 60, 180, 20, 180, -275, 20, 0.7),
          new Circle(ctx, 120, 100, 60, 120, 262, 100, 0.3),
          new Circle(ctx, 150, 180, 10, -130, 138, 10, 0.7),
          new Circle(ctx, 190, 210, 10, 138, -280, 10, 0.7),
          new Circle(ctx, 220, 240, 10, 142, 350, 10, 0.7),
          new Circle(ctx, 100, 260, 10, 135, -460, 10, 0.7),
          new Circle(ctx, 120, 285, 10, -165, 370, 10, 0.7),
          new Circle(ctx, 140, 290, 10, 125, 230, 10, 0.7),
          new Circle(ctx, 160, 380, 10, -175, -180, 10, 0.7),
          new Circle(ctx, 180, 310, 10, 115, 440, 10, 0.7),
          new Circle(ctx, 100, 310, 10, -195, -325, 10, 0.7),
          new Circle(ctx, 60, 150, 10, -138, 420, 10, 0.7),
          new Circle(ctx, 70, 430, 45, 135, -230, 45, 0.7),
          new Circle(ctx, 250, 290, 40, -140, 335, 40, 0.7),
        ];

        window.requestAnimationFrame(this.process.bind(this));
    }

    process(now){
        if(!this.startTime){
            this.startTime = now;
        }
        let seconds = (now - this.startTime) / 1000;
        this.startTime = now;

        for(let i=0;i<this.circles.length; i++){
           this.circles[i].update(seconds);
        }

        this.checkEdgeCollision();
        this.checkCollision();
        //清除画布
        ctx.clearRect(0,0, width, height);

        for(let i=0;i<this.circles.length; i++){
            this.circles[i].draw();
        }

        window.requestAnimationFrame(this.process.bind(this));
    }

    checkCollision(){
        //重置碰撞状态
        this.circles.forEach((circle)=>(circle.colliding = false));

        for(let i=0;i<this.circles.length;i++){
            for(let j=i+1;j<this.circles.length;j++){
                this.circles[i].checkCollideWith(this.circles[j]);
            }
        }
    }

    checkEdgeCollision(){
        const cor = 0.8;   //设置恢复系统
        this.circles.forEach((circle)=>{
            //左右墙壁碰撞
            if(circle.x < circle.r){
                circle.vx = -circle.vx*cor;
                circle.x = circle.r;
            }else if(circle.x > (width - circle.r)){
                circle.vx = -circle.vx*cor;
                circle.x = width -circle.r;
            }

            //上下墙壁碰撞
            if (circle.y < circle.r) {
              circle.vy = -circle.vy*cor;
              circle.y = circle.r;
            } else if (circle.y > height - circle.r) {
              circle.vy = -circle.vy*cor;
              circle.y = height - circle.r;
            }
 
        })
    }
}

//重力
const gravity = 980.0*1.0;

class Circle{
    constructor(context, x,y,r,vx,vy,mass=1,cor=1){
        this.context = context;
        this.x = x;
        this.y =y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;

        this.colliding = false;

        this.mass = mass;
        this.cor = cor;
    }

    //绘制小球
    draw(){
        this.context.fillStyle = this.colliding?"hsl(300, 100%, 70%)":"hsl(170, 100%, 50%)";
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        this.context.fill();
    }

    //更新画布
    update(seconds){
        this.x += this.vx * seconds;
        //重力及加速度
        this.vy += gravity* seconds;
        this.y += this.vy * seconds;
    }

    isCircleCollided(other){
        let squareDistance = (this.x - other.x)*(this.x - other.x) + (this.y - other.y)*(this.y - other.y);
        let squareRadius = (this.r + other.r) *(this.r + other.r);
        return squareDistance < squareRadius;
    }

    //把两球的碰撞状态设置为true
    checkCollideWith(other){
        if(this.isCircleCollided(other)){
            this.colliding  = true;
            other.colliding = true;
            //碰撞后调整速度
            this.changeVelocityAndDirection(other);
        }
    }

    changeVelocityAndDirection(other){
        //创建两个小球的速度向量
        let velocity1 = new Vector(this.vx, this.vy);
        let velocity2 = new Vector(other.vx, other.vy);

        //连心线方向的向量
        let vNorm = new Vector(this.x - other.x, this.y - other.y);
        let unitVNorm = vNorm.normalize();
        //连心线的切线方向
        let unitVTan = new Vector(-unitVNorm.y, unitVNorm.x);

        //点乘计算小球速度在两个方向上的投影
        let v1n = velocity1.dot(unitVNorm);
        let v1t = velocity1.dot(unitVTan);

        let v2n = velocity2.dot(unitVNorm);
        let v2t = velocity2.dot(unitVTan);
 
        //碰撞后速度
        let cor = Math.min(this.cor, other.cor);
        let v1nAfter = (this.mass * v1n + other.mass * v2n + cor * other.mass * (v2n - v1n)) / (this.mass + other.mass);
        let v2nAfter = (this.mass * v1n + other.mass * v2n + cor * this.mass * (v1n - v2n)) / (this.mass + other.mass);
 
        //第1个小球和第2个小球越来越远
        if(v1nAfter < v2nAfter){
            return;
        }

        //碰撞后的速度加上方向
        //计算在连心线方向和切线方向上的速度
        let v1VectorNorm = unitVNorm.multiply(v1nAfter);
        let v1VectorTan = unitVTan.multiply(v1t);

        let v2VectorNorm = unitVNorm.multiply(v2nAfter);
        let v2VectorTan = unitVTan.multiply(v2t);
        
        //获得碰撞后小球的速度向量
        let velocity1After = v1VectorNorm.add(v1VectorTan);
        let velocity2After = v2VectorNorm.add(v2VectorTan);

        //把向量的x和y分别还原到小球的vx和vy属性中
        this.vx = velocity1After.x;
        this.vy = velocity1After.y;

        other.vx = velocity2After.x;
        other.vy = velocity2After.y;

    }
}
 

 