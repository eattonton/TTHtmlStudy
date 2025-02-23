const canvas = document.getElementById("gameboard");
const ctx = canvas.getContext("2d");

var m_Handles = new Array();
var m_SelHandleIdx = -1;
var m_ScreenCenX = 0.0;
var m_ScreenCenY = 0.0;
//表盘
var m_clockPlate = null;
var m_SecondIdx = 0;
var m_MinuteIdx = 0;
var m_HourIdx = 0;

var m_clickIdx = 0;

var m_Buttons = null;
var m_TimePanel = null;

//选择的状态
var m_selectBlockIdx = -1;
var m_selectEdgeIdx = -1;

var boxA = null;
var boxB = null;

var pickX = 0;
var pickY = 0;
var pickX2 = 0;
var pickY2 = 0;

var previousMX = 0;
var previousMY = 0;
var previousMX2 = 0;
var previousMY2 = 0;
var previousAng = 0;
var rotateAng = 0;

var startRotate = false;
var startMove = true;

var audio = null;

var SampleBitmap0 = null;
var SampleBitIndex = 1;

var version = "2.9"
//鼠标点击事件
function funMouseDown(x, y,x2,y2) {
    pickX = x;
    pickY = y;

    if(SampleBitmap0.click(x,y,()=>{
        //加载图片s
        let path1 = "./sample/"+SampleBitIndex+".png";
        if(SampleBitIndex < 10){
            path1 = "./sample/0"+SampleBitIndex+".png";
        }

        ModuleLoadImgs([path1],(res)=>{
            if(res.length >= 1){
                SampleBitmap0 = new ImageOne(ctx,res[0],100,120);
                SampleBitmap0.draw();
                ++SampleBitIndex;
            }
        })
    })){
        return;
    }

    previousMX = x;
    previousMY = y;
    previousMX2 = x2;
    previousMY2 = y2;
 
    if(x2 && y2){
        pickX2 = x2;
        pickY2 = y2;
    }else{
        pickX2 = 0;
        pickY2 = 0;
    }
   // m_selectBlockIdx = -1;
    //startMove = true;
    //startRotate = false;
    if(startRotate) return;
    //是否选择了块
    for(let i = 0; i < m_Handles.length;i++){
        m_Handles[i].selection = false;
        if (m_Handles[i].pick(x, y)) {
            m_selectBlockIdx = i;
            boxB = m_Handles[i];
            rotateAng = boxB.ang;
        }
    }
   
}

//双击 镜像
function funDblMouseDown(x, y) {
    for(let i = 0; i < m_Handles.length;i++){
        if (m_Handles[i].pick(x, y)) {
            m_selectBlockIdx = i;
            boxB = m_Handles[i];
            break;
        }
    }

    if (m_selectBlockIdx >= 0 && boxB.pick(x, y)) {
        //m_selectBlockIdx = 0;
        //镜像
        boxB.mirror();
    }

    redraw();
}

function funMouseMove(x, y,x2,y2) {
    if (m_selectBlockIdx < 0) return;

    if(x2 && y2){
        startMove = false;
        startRotate = true;
    }else{
        startMove = true;
        startRotate = false;
    }
    //如果平行就结束旋转
    //CheckOneByOne();
 
    if (startMove && boxB.checkIn(x,y)) {
        boxB.SavePosition();
        boxB.move(x, y);

        if(CheckOneByOne() > 0){
            startMove = false;
            boxB.RestorePosition();
            return;
        }
 
    }
    
    if(startRotate){
        let vec1 = new Vector(x - previousMX, y - previousMY);
        let vec2 = new Vector(x2 - previousMX2, y2 - previousMY2);
        boxB.SavePosition();

        let rotVec = vec1;
        if(vec2.length() > vec1.length()){
            rotVec = vec2;
        }
         
        if(rotVec.y > 0 && Math.abs(rotVec.y) >= Math.abs(rotVec.x)){
            boxB.rotate(TonMath.FitAngle(++rotateAng));
        }else if(rotVec.x < 0 && Math.abs(rotVec.y) < Math.abs(rotVec.x)){
            boxB.rotate(TonMath.FitAngle(++rotateAng));
        }else{
            boxB.rotate(TonMath.FitAngle(--rotateAng));
        }
        //boxB.rotate(vec1.angle());
        
        let iCollide = CheckOneByOne();
        if(iCollide == 1){
            //boxB.RestorePosition();
            return;
        }
        if (iCollide == 2) {
            boxB.RestorePosition();
        }

        previousMX = x;
        previousMY = y;
        previousMX2 = x2;
        previousMY2 = y2;
 
    }

    redraw();
}

function funMouseUp(x, y) {
    //console.log("up")
   // m_selectBlockIdx = -1;
    if(boxB) rotateAng = boxB.ang;
    redraw();
}

function CheckOneByOne() {
    for(let i=0;i<m_Handles.length;i++){
        if(m_selectBlockIdx == i) continue;
        boxA = m_Handles[i];
        //平行
        if(boxB.Collinear(boxA)){
            startMove = true;
            startRotate = false;
            if(audio) audio.play();
            return 1;
        }
        //相碰
        if (boxA.Collision(boxB)){
             if(audio) audio.play();
            return 2;
        }

    }

    return -1;
}

function drawVersion(){
     // ctx.strokeStyle = '#DF5326';
     ctx.font = 'normal 15px arial';
     ctx.fillStyle = 'red';
     ctx.fillText('dady.triweb.cn ver '+version, 20, window.innerHeight-20);
}
//重新绘制
function redraw() {
    ctx.TClearAll();
    for(let i=0;i<m_Handles.length;i++){
        m_Handles[i].draw();
    }

    if(SampleBitmap0){
        SampleBitmap0.draw();
    }
    drawVersion();
}

//自动走时
function runAutomationTime() {
    let mov1 = setInterval(() => {
        ++m_SecondIdx;
        if (m_SecondIdx >= 60) {
            m_SecondIdx = 0;
            ++m_MinuteIdx;
        }

        if (m_MinuteIdx >= 60) {
            m_MinuteIdx = 0;
            ++m_HourIdx;
        }

        if (m_HourIdx >= 12) {
            m_HourIdx = 0;
        }

        //绘制
        redraw();
    }, 10);

    return mov1;
}

window.onload = function () {
    // 监听点击事件
    canvas.addEventListener("mousedown", (e) => {
        ctx.TGetMousePos(e, funMouseDown);
    });

    canvas.addEventListener("dblclick", (e) => {
        ctx.TGetMousePos(e, funDblMouseDown);
    })

    canvas.addEventListener("mousemove", function (e) {
        ctx.TGetMousePos(e, funMouseMove);
    });

    canvas.addEventListener("mouseup", (e) => {
        ctx.TGetMousePos(e, funMouseUp);
    });

    canvas.addEventListener("touchstart", (e) => {
        ctx.TGetTouchPos(e, funMouseDown,funDblMouseDown);
    });

    canvas.addEventListener("touchmove",function(e){
      //  console.log("touch")
        ctx.TGetTouchPos(e, funMouseMove);
    });

    canvas.addEventListener("touchend",function(e){
        ctx.TGetTouchPos(e, funMouseUp);
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let width = canvas.width;
    let height = canvas.height;

    m_ScreenCenX = 0.5 * width;
    m_ScreenCenY = 0.5 * height;

    //创建对象
    m_Handles[0] = new Polygon(ctx, [{ x:-0.75, y: -0.25 }
                    , { x: 0.25, y: -0.25 }, { x: 0.25, y: 0.75 }],100,"#00FAFF");
    m_Handles[0].draw(50, 400, 180);

    m_Handles[1] = new Polygon(ctx, [{ x:-0.3535, y: -0.3535 }
        , { x: -0.3535, y: 0.3535 }, { x: 0.3535, y: 0.3535 }, { x: 0.3535, y: -0.3535 }],100,"#FFFF00");
    m_Handles[1].draw(50, 220, 0);

    m_Handles[2] = new Polygon(ctx, [{ x:-0.25, y: 0.25 }
        , { x: -0.25, y: -0.75 }, { x: 0.25, y: -0.25 }, { x: 0.25, y: 0.75 }],100,"#95D538");
    m_Handles[2].draw(280, 180, 90);

    m_Handles[3] = new Polygon(ctx, [{ x:0, y: 0.25 }
        , { x: -0.5, y: -0.25 }, { x: 0.5, y: -0.25 }],100,"#FFAFBA");
    m_Handles[3].draw(50, 580, 45);

    m_Handles[4] = new Polygon(ctx, [{ x:0, y: 0.25 }
        , { x: -0.5, y: -0.25 }, { x: 0.5, y: -0.25 }],100,"#FD4F03");
    m_Handles[4].draw(100, 530, 225);

    m_Handles[5] = new Polygon(ctx, [{ x:0, y: 0.5 }
        , { x: -1, y: -0.5 }, { x: 1, y: -0.5 }],100,"#FF0000");
    m_Handles[5].draw(200, 580, 45);

    m_Handles[6] = new Polygon(ctx, [{ x:0, y: 0.5 }
        , { x: -1, y: -0.5 }, { x: 1, y: -0.5 }],100,"#CFA17D");
    m_Handles[6].draw(320, 520, 225);

    audio = document.getElementById("audio");
    audio.loop = false; //歌曲循环关闭 
 
    //加载图片s
    ModuleLoadImgs(["./sample/01.png"],(res)=>{
        if(res.length >= 1){
            SampleBitmap0 = new ImageOne(ctx,res[0],100,120);
            SampleBitmap0.draw();
            ++SampleBitIndex;
        }
    })

    //绘制版本号
    drawVersion();
   


}


//按钮显示
class ButtonPanel {
    constructor(ctx, img, width, height) {
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

    Load() {
        //控制panel绘制的起始位置
        let drawStartX = 20;
        let drawStartY = this.height - 140;
        //绘图cell的大小
        let drawCellW = parseInt(this.width / 2.2);
        let drawCellH = parseInt(drawCellW * 0.5);

        let arrIdx = [0, 1];
        for (let i in arrIdx) {
            let idx = arrIdx[i];
            let cell1 = new ButtonCell(this.ctx, idx, this.img);

            //计算cell的位置
            let drawCellX = drawStartX + drawCellW * (i % this.maxColNum);
            let drawCellY = drawStartY + drawCellH * parseInt(i / this.maxColNum);
            //设置参数
            cell1.setupParams(idx, drawCellX, drawCellY, drawCellW, drawCellH);

            this.cells.push(cell1);
        }
    }

    drawAll() {
        for (let i = 0; i < this.cells.length; i++) {
            //绘制
            this.cells[i].draw();
        }
    }

    checkClick(x, y) {
        for (let i in this.cells) {
            if (this.cells[i].checkClick(x, y)) {
                return true;
            }
        }

        return false;
    }

    defFuns() {
        this.cells[0].onclick = function () {
            alert("1");
        }

        this.cells[1].onclick = function () {
            alert("2");
        }
    }
}

class ButtonCell {
    constructor(ctx, id, img) {
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
    setupParams(idx, drawX, drawY, drawW, drawH) {
        this.idx = idx;
        this.drawX = drawX;
        this.drawY = drawY;
        this.drawW = drawW;
        this.drawH = drawH;
    }

    draw() {
        let ir = parseInt(this.idx / this.colNum);
        let ic = this.idx % this.colNum;
        //从图片的10,10 坐标开始截图，截取 80，80 这么大
        //从0,0 开始画，缩放到300,300
        let data0 = this.ctx.drawImage(this.img, this.iStartX + this.iEndX * ic, this.iStartY + this.iEndY * ir,
            (this.iEndX - this.iStartX), (this.iEndY - this.iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
        this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
        //返回数据
        return this.imgData0;
    }

    //检查是被点击
    checkClick(x, y) {
        let minx = this.drawX;
        let miny = this.drawY;
        let maxx = this.drawX + this.drawW;
        let maxy = this.drawY + this.drawH;
        if (x >= minx && x <= maxx && y >= miny && y <= maxy) {
            if (this["onclick"] !== undefined) {
                if (typeof this["onclick"] == "function") this["onclick"]();
            }
            return true;
        }
        return false;
    }

}


//fadeOut(context, , 0, 0, 20, 1000 / 60);
class FadeHelper {
    constructor(ctx, img, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.originalImageData = ctx.getImageData(x, y, width, height);

    }

    StartFadeOut(cbComplete) {
        this.fadeOut(this.ctx.getImageData(this.x, this.y, this.width, this.height), 20, 1000 / 60, cbComplete);

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
                if (typeof cbComplete === "function") cbComplete();

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


class BoxPanel {
    constructor(ctx, img, width, height) {
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

    Load() {
        let drawStartX = 0;
        let drawStartY = 0;
        let drawW = parseInt(this.width / 4);
        let drawH = drawW;

        //let numBox = 12;
        let colNum2 = 4;

        let arrIdx = [];
        for (let i = 0; i < this.numCell; i++) {
            //console.log(idx);
            let cell1 = new BoxCell(this.ctx, i, this.img);
            let idx = 0;
            let count1 = 0;
            do {
                idx = cell1.getRandIdx();
                count1 = this.findCount(arrIdx, idx);
            } while (count1 >= 2)

            arrIdx.push(idx);
            let drawX = drawStartX + drawW * (i % colNum2);
            let drawY = drawStartY + drawH * parseInt(i / colNum2);

            cell1.setupParams(idx, drawX, drawY, drawW, drawH);

            this.cells.push(cell1);

        }

    }

    drawAll() {
        for (let i = 0; i < this.numCell; i++) {
            //绘制
            this.cells[i].draw();
        }
    }

    drawCovers(cover) {
        for (let i = 0; i < this.numCell; i++) {
            //绘制封面
            this.cells[i].drawCover(cover);
        }
    }

    resetCell(idx) {
        this.cells[idx].resetImage(0);
    }

    //查找数组的数量
    findCount(arr1, idx) {
        let count = 0;
        for (let i in arr1) {
            if (arr1[i] == idx) {
                ++count;
            }
        }

        return count;
    }
}

class BoxCell {
    constructor(ctx, id, img) {
        this.ctx = ctx;
        this.id = id;
        this.img = img;

        this.imgCellNum = 12;
        this.colNum = 3;
        this.imgData0;
        this.imgData1;
        //this.colNum2 = drawCol;
    }

    getRandIdx() {
        return Math.floor(Math.random() * this.imgCellNum);
    }

    //设置参数
    setupParams(idx, drawX, drawY, drawW, drawH) {
        this.idx = idx;
        this.drawX = drawX;
        this.drawY = drawY;
        this.drawW = drawW;
        this.drawH = drawH;
    }

    draw() {
        let ir = parseInt(this.idx / this.colNum);
        let ic = this.idx % this.colNum;
        //从图片的10,10 坐标开始截图，截取 80，80 这么大
        //从0,0 开始画，缩放到300,300
        let iStartX = 5;
        let iStartY = 5;
        let iEndX = 85;
        let iEndY = 85;

        let data0 = this.ctx.drawImage(this.img, iStartX + iEndX * ic, iStartY + iEndY * ir,
            (iEndX - iStartX), (iEndY - iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
        this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
        //返回数据
        return this.imgData0;
    }

    //绘制封皮
    drawCover(cover) {
        //从0,0 开始画，缩放到200,200
        this.ctx.drawImage(cover, this.drawX, this.drawY, this.drawW, this.drawH);
        this.imgData1 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
        return this.imgData1;
    }

    resetImage(idx) {
        if (idx == 0 && this.imgData0) {
            this.ctx.putImageData(this.imgData0, this.drawX, this.drawY);
        }
        else if (idx == 1 && this.imgData1) {
            this.ctx.putImageData(this.imgData1, this.drawX, this.drawY);
        }
    }
}

class Gameboard {
    constructor() {
        this.startTime;
        //debugger
        this.init();
    }

    init() {
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

    process(now) {
        if (!this.startTime) {
            this.startTime = now;
        }
        let seconds = (now - this.startTime) / 1000;
        this.startTime = now;

        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].update(seconds);
        }

        this.checkEdgeCollision();
        this.checkCollision();
        //清除画布
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].draw();
        }

        window.requestAnimationFrame(this.process.bind(this));
    }

    checkCollision() {
        //重置碰撞状态
        this.circles.forEach((circle) => (circle.colliding = false));

        for (let i = 0; i < this.circles.length; i++) {
            for (let j = i + 1; j < this.circles.length; j++) {
                this.circles[i].checkCollideWith(this.circles[j]);
            }
        }
    }

    checkEdgeCollision() {
        const cor = 0.8;   //设置恢复系统
        this.circles.forEach((circle) => {
            //左右墙壁碰撞
            if (circle.x < circle.r) {
                circle.vx = -circle.vx * cor;
                circle.x = circle.r;
            } else if (circle.x > (width - circle.r)) {
                circle.vx = -circle.vx * cor;
                circle.x = width - circle.r;
            }

            //上下墙壁碰撞
            if (circle.y < circle.r) {
                circle.vy = -circle.vy * cor;
                circle.y = circle.r;
            } else if (circle.y > height - circle.r) {
                circle.vy = -circle.vy * cor;
                circle.y = height - circle.r;
            }

        })
    }
}

//重力
const gravity = 980.0 * 1.0;

class Circle {
    constructor(context, x, y, r, vx, vy, mass = 1, cor = 1) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;

        this.colliding = false;

        this.mass = mass;
        this.cor = cor;
    }

    //绘制小球
    draw() {
        this.context.fillStyle = this.colliding ? "hsl(300, 100%, 70%)" : "hsl(170, 100%, 50%)";
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        this.context.fill();
    }

    //更新画布
    update(seconds) {
        this.x += this.vx * seconds;
        //重力及加速度
        this.vy += gravity * seconds;
        this.y += this.vy * seconds;
    }

    isCircleCollided(other) {
        let squareDistance = (this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y);
        let squareRadius = (this.r + other.r) * (this.r + other.r);
        return squareDistance < squareRadius;
    }

    //把两球的碰撞状态设置为true
    checkCollideWith(other) {
        if (this.isCircleCollided(other)) {
            this.colliding = true;
            other.colliding = true;
            //碰撞后调整速度
            this.changeVelocityAndDirection(other);
        }
    }

    changeVelocityAndDirection(other) {
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
        if (v1nAfter < v2nAfter) {
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


