function ModuleGetFnName(fn){
  if(typeof(fn) == 'object'){
    return ModuleGetFnName(fn.constructor)
  }
  return typeof fn !== 'function' ? undefined: fn.name ||  /function (.+)\(/.exec(fn + '')[1];
}

//原位置的图形
//加载单个图片
function ModuleLoadImg(src) {
    var promise = new Promise(function (resolve, reject) {
        var img = new Image();
        //console.log(src);
        img.onload =function () {
            resolve(img)
        }
        img.onerror =function () {
            reject()
        }
        img.src =src
    })

    return promise;
}
 
//加载图片数组
function ModuleLoadImgs(srcs, cb){
    var imgs = [];
    //加载图片
    let promises = [];
    for(let i=0; i<srcs.length; i++){
       let promise1 = ModuleLoadImg(srcs[i]);
       promises.push(promise1);
    }

    // 串行执行
    const loop = async function(arr) {
      for (let i = 0; i < arr.length; i++) {
        //await 等待promise执行完成，必须用在async里面
        await arr[i].then((img)=>{
            //console.log(img);
            imgs.push(img);
            if(i == arr.length - 1){
                //执行函数
                if(typeof cb === "function") cb(imgs);
            }
        })
      }
    }
    loop(promises);
}
