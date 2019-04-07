(function(){
   document.addEventListener('click',function(e){

        if(e.target === play){
            video.paused?video.play():video.pause()
            clearTimeout(timer) 
            timer = setTimeout(flagGrow,1000);
        }
        if(e.target === belt || e.target === flag){
            video.currentTime = ((e.clientX-belt.getBoundingClientRect().left)/belt.offsetWidth)*video.duration;
            flag.style.width = (video.currentTime / video.duration * belt.offsetWidth)+'px';
            video.play();
        }
        if(e.target === send){
            danmuP.setDanMU(form.elements['color'].value,Boolean(parseInt(form.elements['position'].value)),form.elements['input'].value,video.currentTime);
            form.elements['input'].value = '';
        }
        
    })

    document.addEventListener('change',function(e){
        if(e.target === show){
            if(!Boolean(parseInt(e.target.value))){
                canvas3.style.display = 'none';
            }else{
                canvas3.style.display = 'block'
            }
        }
    })

    document.addEventListener('mouseenter',function(e){
        if(e.target === belt){
            e.target.background.color = 'gray'
        }
    })
    function flagGrow(){
        timer = requestAnimationFrame(flagGrow,100);
        flag.style.width = (video.currentTime / video.duration * belt.offsetWidth)+'px';
    }
    loadingDanMu();
    function loadingDanMu(){
        setTimeout(function(){
            if(arr.length){
                let fragment = document.createDocumentFragment();
                for(let i =0;i<arr.length;i++){
                    let danmuL = document.createElement('div');
                    let time = document.createElement('div');
                    let text = document.createElement('div');
                    danmuL.style.cssText = 'display:flex;padding:5px 0 0 5px;font-size:14px;line-height:20px;'
                    time.innerText = `${Math.floor(arr[i].time/60)}:${(arr[i].time % 60).toFixed(0).length === 1?'0'+(arr[i].time % 60).toFixed(0):(arr[i].time % 60).toFixed(0)} `
                    text.innerText = `${arr[i].text}`
                    
                    time.style.cssText = 'width:15%;'
                    text.style.cssText = 'width:85%;overflow:hidden; white-space:nowrap;text-overflow:ellipsis;'
                    
                    danmuL.appendChild(time);
                    danmuL.appendChild(text);
                    fragment.appendChild(danmuL)
                }
                danMuList.appendChild(fragment)
            }else{
              loadingDanMu();
            }
        },0)
    }

    




    function DanMuPlayer(video,canvas){
        this.danMu = null;
        this.suspend = true;
        this.context = null;
        this.video = video;
        this.canvas = document.createElement('canvas');
        this.canvas.height=canvasHeight;
        this.canvas.width=canvasWidth;
        this.control = new Control(50)

    }

    DanMuPlayer.prototype={
        constructor:DanMuPlayer,
        setDanMU:function(color,fixed,text,currentTime){

            this.danMu.push({
                text:text,color:color,fontSize:50,x:canvasWidth,fixed:fixed,width:this.context.measureText(text).width*6,time:currentTime,hasPlayed:false,ifInTrack:false,hasInTrack:false,isRendering:false
            })

        },
        init:function(arr){
            let self = this;
            
            self.control.init();
            self.danMu = arr;
            self.context = self.canvas.getContext('2d');
            self.context.strokeStyle = 'black';
            
                            
            
            //绑定事件
            self.video.addEventListener('play',(e)=>{
                self.suspend = false;
                self.render();
            })
            self.video.addEventListener('pause',(e)=>{
                self.suspend = true;
            })

            self.video.addEventListener('seeking',(e)=>{
 
                this.context.clearRect(0,0,self.canvas.width,self.canvas.height);

                for(let i = 0;i<self.danMu.length;i++){
                    if(self.danMu[i].time < self.video.currentTime){
                        //当前时间以前的弹幕设为已经渲染过，将当前时间以后的弹幕初始化
                        self.danMu[i].hasPlayed = true;
                        self.danMu[i].hasInTrack = true;
                        self.danMu[i].ifInTrack=false;
                        self.danMu[i].isRendering=false
                    }else{
                        self.danMu[i].hasPlayed = false;
                        self.danMu[i].hasInTrack = false;
                        self.danMu[i].ifInTrack = false;
                        self.danMu[i].isRendering = false;
                        self.danMu[i].x = canvasWidth;
                    }
                }
                    
                self.control.trackes = self.control.trackes.map((eve)=>{
                    eve.timeStart = 0;
                    eve.busy = false;
                    return eve;
                })
            })

            //切换页面
            document.addEventListener('visibilitychange',()=>{
                if(document.visibilityState === 'visible'){
                    this.control.trackes = this.control.trackes.map((eve)=>{
                        eve.timeStart = 0;
                        eve.busy = false;
                        eve.fixed = false;
                        return eve;
                    })
                    for(let i = 0;i<this.danMu.length;i++){
                        if(this.danMu[i].time < this.video.currentTime){
                            //当前时间以前的弹幕设为已经渲染过，将当前时间以后的弹幕初始化
                            this.danMu[i].hasPlayed = true;
                            this.danMu[i].hasInTrack = true;
                        }else{
                            this.danMu[i].hasPlayed = false;
                            this.danMu[i].hasInTrack = false;
                            this.danMu[i].x = canvasWidth;
                        }
                    }
                }
            }
           
        )
    },
        render:function(){
            let self = this;
            //弹幕防档画面
            
                //用来渲染视频，图像对象，原始图像中的起始x坐标,原始图像中的起始y坐标,宽度，高度
                context1.drawImage(video,0,0,canvasWidth,canvasHeight);
                //获取图像信息，起始x坐标，起始y左边，宽度，高度
                let canvas1Data = context1.getImageData(0,0,canvasWidth,canvasHeight);

                //获取弹幕信息
                let trueData = self.context.getImageData(0,0,canvasWidth,canvasHeight);
                //修改
                for(let i=0;i<canvas1Data.data.length/4;i++){
                    const r = canvas1Data.data[i * 4 + 0];
                    const g = canvas1Data.data[i * 4 + 1];
                    const b = canvas1Data.data[i * 4 + 2];

                    if (r > 15 || g > 15 || b > 15) {
                      trueData.data[4 * i + 3] = 0;
                    }
                }

                //最终渲染，图像对象，渲染位置的起始x坐标，渲染位置的起始y坐标，源数据的起始x位置，源数据的起始y位置，渲染的宽度，渲染的高度
                context3.putImageData(trueData,0,0,0,0,canvasWidth,canvasHeight);

            
            
            if(!self.suspend){
                requestAnimationFrame(self.render.bind(self));
                self.context.clearRect(0,0,self.canvas.width,self.canvas.height);
                for(let i = 0;i<self.danMu.length;i++){
                    if(self.danMu[i].time <= self.video.currentTime && !self.danMu[i].hasPlayed){
                               
                        if(!self.danMu[i].ifInTrack && !self.danMu[i].hasInTrack){
                                //将要渲染的弹幕放入Control中进行调度，返回设置好的弹幕
                                let res = self.control.receiveWork(self.danMu[i]);
                                if(res){
                                    self.danMu[i] = res;
                                }else{
                                    continue;
                                }
                        }          
                         if(self.danMu[i].fixed){
                            if(self.danMu[i].ifInTrack){
                                self.context.fillStyle = self.danMu[i].color;
                                self.context.font = `900 ${self.danMu[i].fontSize}px Airal`;
                                self.context.fillText(self.danMu[i].text,self.danMu[i].x,self.danMu[i].y)
                                self.context.strokeText(self.danMu[i].text,self.danMu[i].x,self.danMu[i].y)
                            }
                         }else{
                            //如果弹幕已经离开预留区，将弹幕所在的track置为空闲
                            if(self.danMu[i].ifInTrack && self.canvas.width - self.danMu[i].x >= self.danMu[i].width){
                                self.danMu[i].ifInTrack = false;
                                self.danMu[i].hasInTrack = true;
                                self.danMu[i].cleanTrack();
                            }

                            
                            if(self.danMu[i].x >= - self.danMu[i].width && self.danMu[i].isRendering){
                                
                                self.danMu[i].x = self.danMu[i].x - 10;
                                self.context.fillStyle = self.danMu[i].color;
                                self.context.font = `900 ${self.danMu[i].fontSize}px Airal`;
                                self.context.fillText(self.danMu[i].text,self.danMu[i].x,self.danMu[i].y)
                                self.context.strokeText(self.danMu[i].text,self.danMu[i].x,self.danMu[i].y)

                            }else if(self.danMu[i].isRendering){
                                self.danMu[i].isRendering = false;
                                self.danMu[i].hasPlayed = !self.danMu[i].hasPlayed;
                            }
                        }
                    }
                }
            }
        }
    } 

    function seekThrottle(seek,delay){
        let timer = null;
        let startDate = Date.now();

        return function(){
            if(timer) clearTimeout(timer);
            let nowDate = Date.now();

            if(delay - (nowDate - startDate) > 0){
                timer = setTimeout(seek,delay - (nowDate - startDate))
            }else{
                seek();
                startDate = Date.now();
            }

        }
    }

    //轨道类，负责调度弹幕的渲染位置
    function Track(){
        this.busy = false;
        this.timeStart = 0;
        this.fixed = false;
    }

    Track.prototype = {
        constructor:Track,
        //添加弹幕,并开始计时，当弹幕完全离开预留区时，计时结束并清零
        push:function(danMu){
                this.busy = true;
                //记录存放时间
                this.timeStart = Date.now();

                // 然后把弹幕放到DanMuPlayer的列表中进行渲染
                // 在DanMuPlayer中如果弹幕已经离开预留区，就将该track置为空闲，等待下一条弹幕
                // 这里设置一个回调函数，将处理后的弹幕返回，开始渲染。
                if(typeof danMu.cleanTrack === 'undefined'){
                    danMu.cleanTrack = ()=>{
                        this.clean();
                    }
                }
            
                return danMu;
        },
        pushFix:function(danMu){
                    this.fixed = true;
                        setTimeout(()=>{
                            this.cleanFix();
                            danMu.ifInTrack = false;
                            danMu.hasInTrack = true;
                        },4000)
                    return danMu;
        },
        //将当前track标记为空闲
        clean:function(){
            this.busy = false;
        },
        cleanFix:function(){
            this.fixed = false;
        }
    }

    //负责轨道类的调度
    function Control(){
        this.trackes = [];
    }

    Control.prototype = {
        constructor:Control,
        init:function(){
            //根据视频高度生成轨道
            for(let i =0;i< 20;i++){
                this.trackes.push(new Track())
            }
        },
        //负责接收要渲染的弹幕，将弹幕放到合适的轨道中
        receiveWork:function(danMu){
            //判断弹幕类型，是固定还是滚动
            if(danMu.fixed){
                for(let i=0;i<20;i++){
                    if(!this.trackes[i].fixed){
                        let finalDanMu = calculY(danMu,i);
                        finalDanMu.isRendering = true;
                        return this.trackes[i].pushFix(finalDanMu);
                    }
                }  
            }else{
                //遍历track，寻找空闲track
                for(let i=0;i<20;i++){
                    if(!this.trackes[i].busy){
                        //开始对弹幕进行初始化(计算弹幕纵向初始位置),然后准备渲染
                        let finalDanMu = calculY(danMu,i);
                        finalDanMu.isRendering = true;
                        //将初始化后的弹幕放入轨道中
                        return this.trackes[i].push(finalDanMu);
                    }
                }  
            }
                    
        },
        
    }

    function calculY(danMu,index){
        danMu.ifInTrack = true;
        if(danMu.fixed){
            return {...danMu,x:800,y:(index+1)*50}
        }
        return {...danMu,y:(index+1)*50};
    }
 

    let canvasWidth,canvasHeight;
    let belt = document.querySelector('#belt');
    let play = document.querySelector('#play');
    let input = document.querySelector('#input');
    let send = document.querySelector('#send');
    let show = document.querySelector('#show');
    let flag = document.querySelector('#flag');
    let relateX;
    let timer;
    let form = document.querySelector('form');
    let danMuList = document.querySelector('#danMuList')
    let trackHeight = 50;
    let arr=[];
    let danmuP;
    

    
    let video = document.querySelector('video');
    //danMuCreator(arr,500);
    
    


    //获取视频信息canvas
    let canvas1 = document.createElement('canvas');
    canvas1.width=canvasWidth;
    canvas1.height=canvasHeight;
    let context1 = canvas1.getContext('2d');

    //渲染canvas
    let canvas3 = document.querySelector('#canvas3');
    let context3 = canvas3.getContext('2d');
    
    fetch('http://localhost:3000/danmu').then(function(res){
        res.json().then(function(result){
            arr = getDanmu(result);
            console.log(arr)
            //弹幕渲染
            danmuP = new DanMuPlayer(video);
            danmuP.init(arr);

        })
    })



function getDanmu(info){
  let result = [];
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d')
  return info.map((eve)=>{
      let num = Math.floor(Math.random()*100);
      return {
        text:eve.text,
        color:num <40 ? num>20?'yellow':'red':'white',
        fontSize:50,
        x:canvasWidth,
        fixed:Math.floor(Math.random()*800)<80?true:false,
        width:context.measureText(eve.text).width*4+100,
        time:eve.time,
        hasPlayed:false,
        ifInTrack:false,
        hasInTrack:false,
        isRendering:false
      }
  }) 
}


})()