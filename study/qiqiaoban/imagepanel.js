 
//单个图片
class ImageOne {
    constructor(ctx, img, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height || width;
        this.img = img;
        this.x = 0;
        this.y = 0;
    }

    draw(x,y) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    click(mx,my,cb){
        //判断 是不是 在 此范围内 
        if(mx >=this.x && my >= this.y && mx <= (this.x + this.width) && my <= (this.y + this.height)){
            if(typeof cb == "function"){
                cb();
                return true;
            } 
        }
        return false;
    }

}

//图片包含多个图片单元
class ImageTable {
    constructor(ctx, img, width, height) {
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
        this.cellIndex = { 0: 10, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 6, 7: 7, 8: 8, 9: 9, ":": 17 };
        //显示时换行列数
        this.maxColNum = 5;
        this.Load();

    }

    Load() {

        //绘图cell的大小
        let drawCellW = parseInt(this.width / 8.5);
        let drawCellH = parseInt(drawCellW * 1.6);

        let arrIdx = this.LoadTimeIndex();
        for (let i in arrIdx) {
            let idx = arrIdx[i];
            let cell1 = new TimeCell(this.ctx, idx, this.img);

            //计算cell的位置
            let drawCellX = this.drawStartX + drawCellW * (i % this.maxColNum);
            let drawCellY = this.drawStartY + drawCellH * parseInt(i / this.maxColNum);
            //设置参数
            cell1.setupParams(idx, drawCellX, drawCellY, drawCellW, drawCellH);

            this.cells.push(cell1);
        }
    }

    LoadTimeIndex() {
        let d = new Date();
        let m = d.getMinutes();
        let h = d.getHours();

        return this.resetTimeIndex(h, m);
    }

    resetTimeIndex(h, m) {
        let arr1 = new Array();

        arr1[0] = this.cellIndex[parseInt(h / 10)];
        arr1[1] = this.cellIndex[h % 10];
        arr1[2] = this.cellIndex[":"];
        arr1[3] = this.cellIndex[parseInt(m / 10)];
        arr1[4] = this.cellIndex[m % 10];

        return arr1;
    }

    drawAll() {
        for (let i = 0; i < this.cells.length; i++) {
            //绘制
            this.cells[i].draw();
        }
    }

    drawByIndex(arr1) {
        for (let i in arr1) {
            this.cells[i].idx = arr1[i];
            this.cells[i].draw();
        }
    }
}

class ImageTBCell {
    constructor(ctx, id, img) {
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
        this.iEndY = 180;

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

        this.ctx.strokeStyle = "#E5E5E5";
        this.ctx.fillStyle = "#E5E5E5";
        this.ctx.fillRect(this.drawX, this.drawY, this.drawW, this.drawH);
        //从图片的10,10 坐标开始截图，截取 80，80 这么大
        //从0,0 开始画，缩放到300,300
        let data0 = this.ctx.drawImage(this.img, this.iStartX + this.iEndX * ic, this.iStartY + this.iEndY * ir,
            (this.iEndX - this.iStartX), (this.iEndY - this.iStartY), this.drawX, this.drawY, this.drawW, this.drawH);
        this.imgData0 = this.ctx.getImageData(this.drawX, this.drawY, this.drawW, this.drawH);
        //返回数据
        return this.imgData0;
    }

}

//表针
class ClockHandle {
    constructor(ctx, img, bmpCenX, bmpCenY, scale, screenX, screenY) {
        this.ctx = ctx;
        this.width = img.width * scale;
        this.height = img.height * scale;
        this.img = img;
        this.drawCenX = bmpCenX * scale;
        this.drawCenY = bmpCenY * scale;
        this.mt = new Matrix();
        this.range = new ImgDrawRange(img, bmpCenX, bmpCenY, scale);
        this.selection = false;
        this.screenCenX = 0;
        this.screenCenY = 0;
        this.screenCenX = screenX;
        this.screenCenY = screenY;
    }

    draw(ang, drawX, drawY) {
        this.ctx.save();
        this.mt.reset();
        //根据绘制点的偏移
        this.mt.Translate(this.screenCenX, this.screenCenY);
        //旋转 (弧度)
        this.mt.Rotate(ang);
        //根据图片原点的移动
        this.mt.Translate(-this.drawCenX, -this.drawCenY);
        //transform(m11,m12,m21,m22,dx,dy);
        this.ctx.transform(this.mt.data[0], this.mt.data[3], this.mt.data[1], this.mt.data[4], this.mt.data[2], this.mt.data[5]);
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height);
        this.ctx.restore();
        //如果是选中状态
        this.drawBorder();
    }

    //绘制边界
    drawBorder() {
        if (this.selection) {
            this.ctx.save();
            this.ctx.transform(this.mt.data[0], this.mt.data[3], this.mt.data[1], this.mt.data[4], this.mt.data[2], this.mt.data[5]);
            //绘制矩形
            this.ctx.strokeStyle = "#28E3ED";  //图形边框的填充颜色
            this.ctx.lineWidth = 3;  //用宽度为 5 像素的线条来绘制矩形：  
            this.ctx.strokeRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    pick(x, y) {
        this.selection = false;
        let mt2 = this.mt.invert();
        let pos2 = mt2.transform(x, y);
        if (this.range.checkIn(pos2.x, pos2.y)) {
            //alert("pick")
            this.selection = true;
        }

        return this.selection;
    }
}

//记录图片的范围坐标
class ImgDrawRange {
    constructor(img, bmpCenX, bmpCenY, scale) {
        this.width = img.width * scale;
        this.height = img.height * scale;
        this.img = img;
        this.drawCenX = bmpCenX * scale;
        this.drawCenY = bmpCenY * scale;

        this.minx = 0;
        this.miny = 0;
        this.maxx = this.width;
        this.maxy = this.height;
        // this.minx = -this.drawCenX;
        // this.miny = -this.drawCenY;
        // this.maxx = this.width - this.drawCenX;
        // this.maxy = this.height - this.drawCenY;
    }

    checkIn(x, y) {
        if (x >= this.minx && x <= this.maxx && y >= this.miny && y <= this.maxy) {
            return true;
        }
        return false;
    }
}


