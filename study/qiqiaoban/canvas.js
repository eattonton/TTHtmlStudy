//扩展canvas中的函数
CanvasRenderingContext2D.prototype.TClearAll = function() {
    //清空
   this.clearRect(0,0,this.canvas.width, this.canvas.height);
}

CanvasRenderingContext2D.prototype.TGetMousePos = function(e, cb) {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left * (this.canvas.width / rect.width);
    let y = e.clientY - rect.top * (this.canvas.height / rect.height);
    //console.log("m-x:"+x+",m-y:"+y);
    
    if(typeof cb == "function") cb(x,y);
}

CanvasRenderingContext2D.prototype.previousTouchTime = null;
CanvasRenderingContext2D.prototype.previousTouchPoint = {x:0,y:0};

CanvasRenderingContext2D.prototype.TGetTouchPos = function(e, cb, cb2){
    e.preventDefault();
    if (!e.touches.length){
        if(typeof cb == "function") cb();
        return;
    }
    //let x = touch.pageX;
    //let y = touch.pageY;
    let rect = this.canvas.getBoundingClientRect();

    if(e.touches.length > 1){
        let touch1 = e.touches[0];
        let x1 = touch1.clientX - rect.left;
        let y1 = touch1.clientY - rect.top;

        let touch2 = e.touches[1];
        let x2 = touch2.clientX - rect.left;
        let y2 = touch2.clientY - rect.top;

        if(typeof cb == "function") cb(x1,y1,x2,y2);
    }else{
        let touch = e.touches[0];
        let x = touch.clientX - rect.left;
        let y = touch.clientY - rect.top;
        let startTime = new Date().getTime();
        //判断是不是双击
        if(cb2 && this.previousTouchTime){
            if( Math.abs(x -this.previousTouchPoint.x) < 10  && Math.abs(y - this.previousTouchPoint.y) < 10 && 
                     Math.abs(startTime - this.previousTouchTime) < 300) {
                if(typeof cb2 == "function"){
                    //双击执行
                    cb2(x,y);
                    return;
                }
            }
        }

        //记录当前
        this.previousTouchTime = startTime;
        this.previousTouchPoint = {x:x, y:y};
        if(typeof cb == "function") cb(x,y);
    }
    
}