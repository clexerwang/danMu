




    function DanMuPlayer(video,canvas,canvasWidth,canvasHeight,trackHight){
        this.danMu = null;
        this.suspend = true;
        this.context = null;
        this.video = video;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        //提供弹幕信息的canvas
        this.canvas = document.createElement('canvas');
        this.canvas.height=canvasHeight;
        this.canvas.width=canvasWidth;

        //最终渲染的canvas
        this.renderCanvas = canvas;
        this.renderCanvasContext = canvas.getContext('2d');
        
        //提供视频信息的canvas
        this.videoCanvas = document.createElement('canvas');
        videoCanvas.width=canvasWidth;
        videoCanvas.height=canvasHeight;
        this.videoCanvasContext = videoCanvas.getContext('2d');

        this.control = new Control(trackHight)
    }

    DanMuPlayer.prototype={
        constructor:DanMuPlayer,
        setDanMU:function(color,fixed,text,currentTime){
            this.danMu.push({
                text:text,
                color:color,
                fontSize:50,
                x:this.canvasWidth,
                fixed:fixed,
                width:this.context.measureText(text).width*4+100,
                time:currentTime,
                hasPlayed:false,
                ifInTrack:false,
                hasInTrack:false,
                isRendering:false
            })

        },
        init:function(arr){
            let self = this;
            self.control.init();
            self.danMu = arr;
            self.context = self.canvas.getContext('2d');
            self.context.strokeStyle = 'black';
 
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
                        self.danMu[i].x = self.canvasWidth;
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
                            this.danMu[i].x = self.canvasWidth;
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
                self.videoCanvasContext.drawImage(video,0,0,self.canvasWidth,self.canvasHeight);
                //获取图像信息，起始x坐标，起始y左边，宽度，高度
                let videoCanvasData = self.videoCanvasContext.getImageData(0,0,self.canvasWidth,self.canvasHeight);

                //获取弹幕信息
                let renderData = self.context.getImageData(0,0,self.canvasWidth,self.canvasHeight);
                //修改
                for(let i=0;i<videoCanvasData.data.length/4;i++){
                    const r = videoCanvasData.data[i * 4 + 0];
                    const g = videoCanvasData.data[i * 4 + 1];
                    const b = videoCanvasData.data[i * 4 + 2];

                    if (r > 15 || g > 15 || b > 15) {
                      renderData.data[4 * i + 3] = 0;
                    }
                }

                //最终渲染，图像对象，渲染位置的起始x坐标，渲染位置的起始y坐标，源数据的起始x位置，源数据的起始y位置，渲染的宽度，渲染的高度
                self.renderCanvasContext.putImageData(trueData,0,0,0,0,this.canvasWidth,this.canvasHeight);

            
            
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
        },
        //暂停弹幕
        suspend:function(){
            this.suspend = true;
        },
        //开始播放弹幕
        play:function(){
            this.suspend = false;
            this.render();
        },
        //弹幕隐藏
        hidden:function(){
            this.renderCanvas.style.display = 'none';
        },
        show:function(){
            this.renderCanvas.style.display = 'block';
        }

    } 

/*    function seekThrottle(seek,delay){
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
    }*/

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
    function Control(trackHight,trackNum){
        this.trackes = [];
        this.trackHight = trackHight;
        this.trackNum = trackNum;
    }

    Control.prototype = {
        constructor:Control,
        init:function(){
            //根据视频高度生成轨道
            for(let i =0;i< this.trackNum||20;i++){
                this.trackes.push(new Track())
            }
        },
        //负责接收要渲染的弹幕，将弹幕放到合适的轨道中
        receiveWork:function(danMu){
            //判断弹幕类型，是固定还是滚动
            if(danMu.fixed){
                for(let i=0;i< this.trackNum||20;i++){
                    if(!this.trackes[i].fixed){
                        let finalDanMu = calculY(danMu,i);
                        finalDanMu.isRendering = true;
                        return this.trackes[i].pushFix(finalDanMu);
                    }
                }  
            }else{
                //遍历track，寻找空闲track
                for(let i=0;i< this.trackNum||20;i++){
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
    

    danmuP = new DanMuPlayer(video);
    danmuP.init(arr);


