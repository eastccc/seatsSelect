
import { SVG } from '@svgdotjs/svg.js'
import Hammer from 'hammerjs'
import SeatNode from './nodeElement'
/**
 * 原图 -> 大图
 * 原图 -> 小图  
 *  小图外框  - > 大图显示区域
 * **/
class SeatsMap {
  constructor({data = [], onClick}){
    this.data = data
    this.seats = []
    this.onClick = onClick
    this.seatW = 40
    this.paddingw = 60
    this.tbbox = 164
    this.stagebox = null
    this.stage = null
    this.thumbnailview = null
    this.createScene()
    this.stageStyle = this.stage.style
    this.viewBoxStyle = this.thumbnailview.style
    // 小图视窗初始化
    this.vStartTop = 0
    this.vStartLeft = 0
    this.vStartHeight = 0
    this.vStartWidth = 0
    this.vOldLeft = 0
    this.vOldTop = 0
    this.minScale = 0
    this.stageLeft = 0
    this.stageTop = 0
    this.startLeft = 0
    this.startTop = 0
    this.mc = null
    this.targetW = 0
    this.targetH = 0
    this.oldScale = 1
    this.curScale = 1
    this.moveLengthX = 0
    this.moveLengthY = 0 
    this.init()
  }
  loadData(data){}
  init(){
    this.width = Math.max(...this.data.map(ele=>ele.x)) + this.seatW + this.paddingw
    this.height = Math.max(...this.data.map(ele=>ele.y)) + this.seatW + this.paddingw
    this.rate = Math.min(this.tbbox/this.width, this.tbbox/this.height)
    this.targetW = this.stagebox.offsetWidth
    this.targetH = this.stagebox.offsetHeight
    let ratew = 1, rateh = 1
    if(this.targetW < this.width){
      ratew = this.targetW / this.width
    }
    if(this.targetH < this.height){
      rateh = this.targetH / this.height
    }
    this.minScale = Math.min(ratew, rateh)
    this.oldScale = this.minScale
    this.curScale = this.minScale
    
    // 小图视窗初始化
    this.initStage()
    this.initThumbnail()
    this.creatSeats()
    this.createSnapshot();
    //事件处理
    //添加事件
    this.bindEvent()
  }
  createScene(){
    const bg1 = 'data:image/png;base64,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'
    const bg2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAAkBAMAAAAzy086AAAAKlBMVEVHcEzZ2dnZ2dnb29vg4ODc3NzZ2dna2trY2Nj////u7u7m5ubd3d329vYTZU6tAAAACHRSTlMAyutXEy+qg3jeFasAAALOSURBVFjD1Zg/b9NAGMZfiQA7iipWVEVijFjo2H4DxAArDEiMlRASa6iU2r7zHtvxHjtlT3LpHlN3j9Pku3D/7HOIS6I7S8SPJediS6df3rz3PGfDD6tJuoYnjeLtArxpEO4pADx93Rjcn+8oL7xvDG+H4ULrZUNwe+ecFy7MprmflL+RhRrjkRqjG2PeNkh9NZom2+L1SrxOoMb20hS3n+PCc5NpfntSHNsNyvc2ajgdmfJeFrxgEBoo80jGjjEvbDSSDYJTqumcnuh1esrYMF2YRIWSQWigdWTxg6OgkJ6SAatnXnbPt1AxNihyt8QLZwb/U5l3umalZdCzOI78mGlMf0UsFOnzXpVxDULDKWq3ZOUVTSFWoDvI/4O8qRNtXhEVStqhgeJMHiMLR2srvSOzaCh4l/XxdrZxTUJD9YPtbUSpwx1ezBebNm8eFUoXNfC6m80qJiSV5mWvpSVQXrb8An3eNuxIMzSikg8UEi6cFG1NeVdxrM/b38WFZ3pTzeJc41IQ8/BNVswSJO/Ewvq8nyp4tUNjyt3ggZuFRB+pG3YNvNdVuNqh4RFCPSEkE7bghISRZQtpCaa83UpezdBwKV8sG1WssPSe8/LYqIP3qhpXLzRwdpNG8zn2S5swERTCdXPeMSGavH9HhVloJAHBIRpW8CaDMq++n3Uew9UKDbTIfg3dYRoyo93iFfviZMJ57wghcy3e3agwDA3Hm/B1FhS8DuN1/MIkjPK4/TgutDRCA0eBhQgJafks+4Ew3TLeSLBnhvuH/j/KqxMaKPOZbcn+VX7msK0aJreB4iVk+9FJPyoMQsPluDmv8jOb7YSR2KFL3qkXLuqJCoPQwBKBpzES9WMf4rp4AMJzflnncai7h/fIXk+d7sM9rrcnvfO9vGYP9zXrEg7Qh6PB/QLQJOADcQE+HkMP977DwWq9/fziv8K+OvlWvdT+AGKH3jtCaIWxAAAAAElFTkSuQmCC'
    const seats = document.querySelector('#seats')
    this.stagebox = document.createElement('div')
    this.stagebox.id="stagebox"
    this.stage = document.createElement('div')
    this.stage.id="stage"
    const thumbnail = document.createElement('div')
    thumbnail.id="thumbnail"
    const thumbnailStage = document.createElement('div')
    thumbnailStage.id="thumbnailStage"
    this.thumbnailview = document.createElement('div')
    this.thumbnailview.id="thumbnailview"
    const stageBg = new Image()
    stageBg.src = bg1
    const thumbnailBg = new Image()
    thumbnailBg.src = bg2
    seats.appendChild(stageBg)
    this.stagebox.appendChild(this.stage)
    seats.appendChild(this.stagebox)
    thumbnail.appendChild(thumbnailBg)
    thumbnail.appendChild(thumbnailStage)
    thumbnailStage.appendChild(this.thumbnailview)
    seats.appendChild(thumbnail)
  }
  initStage(){
    this.draw = SVG().addTo('#stage').size(this.width, this.height)
    this.group = this.draw.group()
    this.stageStyle.width = this.width + 'px'
    this.stageStyle.height = this.height + 'px'
    this.startLeft = -(this.width - this.minScale*this.width)/2
    this.startTop = -(this.height - this.minScale*this.height)/2 + (this.targetH - this.minScale*this.height)/2
    this.stageLeft = this.startLeft
    this.stageTop = this.startTop
    this.stageStyle.transform = `translate(${this.stageLeft}px,${this.stageTop}px)scale(${this.minScale})`
  }
  initThumbnail(){
    this.thumbnailDraw = SVG().addTo('#thumbnailStage').size(this.width, this.height)
    this.vStartTop = (this.tbbox - this.rate*this.height)/2
    this.vStartLeft = 0
    this.vStartHeight = this.height*this.rate
    this.vStartWidth = this.tbbox
    this.viewBoxStyle.left = this.vStartLeft + 'px'
    this.viewBoxStyle.top = this.vStartTop + 'px'
    this.viewBoxStyle.height = this.vStartHeight + 'px'
    this.viewBoxStyle.width = this.vStartWidth + 'px'
  }
  creatSeats(){
    this.data.forEach(ele=>{
      let seatgroup = new SeatNode(ele, this.draw)
      let seat  = seatgroup.init();
      this.seats.push(seatgroup)
      seatgroup.bindEvent(_=>{
        this.createSnapshot()
        this.onClick(_)
      })
      this.group.add(seat);
    })
  }
  createSnapshot(){
    let cloneG = this.group.clone().addTo(this.thumbnailDraw)
    //小图 左右+60 上下+ 40
    cloneG.transform({
      translate : [-(this.width-this.rate*this.width)/2 + this.seatW*this.rate/2, -(this.height - this.rate*this.height)/2 + this.paddingw*this.rate*3/2 +  (this.tbbox - this.rate*this.height)/2],
      scale : this.rate      
    })
    if(this.thumbnailDraw.children().length >1){
      this.thumbnailDraw.first().remove()
    } 
  }
  getSelection(){
    return this.data.filter(ele=>ele.status == 'selectd')
  }
  clearSelection(){
    this.seats.forEach(ele=>{
      ele.clearSelection()
    })
  }
  bindEvent(){
    this.mc = new Hammer.Manager(this.stagebox);
    this.mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));  
    this.mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(this.mc.get('pan'));
    this.mc.on("hammer.input", e=>{});
    this.mc.on("panstart", e=>{}); 
    this.mc.on("panmove", e=>this.onMove(e));
    this.mc.on("panend", e=>{
      this.stageLeft = this.moveLengthX
      this.stageTop = this.moveLengthY
    });
    this.mc.on("pinchstart", e=>{});
    this.mc.on('pinchin', e=>this.onPinchin(e));
    this.mc.on('pinchout', e=>this.onPinchout(e));
    this.mc.on("pinchend", e=>{
      this.oldScale = this.curScale
    });
  }
  onPinchin(e){
    let scale = e.scale*this.oldScale
    if(scale > this.minScale){
      this.stageStyle.transform = `translate(${this.stageLeft}px,${this.stageTop}px)scale(${scale})`
      //left ok 
      this.viewBoxStyle.left = this.vStartLeft + this.rate*(this.width*scale - this.targetW)/2 + 'px'
      //top ok
      if((this.height*scale - this.targetH) > 0){
        this.viewBoxStyle.top = this.vStartTop + this.rate*(this.height*scale - this.targetH)/2 + 'px'
      }
      this.viewBoxStyle.height = ((this.height*scale - this.targetH) > 0 ? this.vStartHeight*this.targetH/(this.height*scale) : this.vStartHeight) + 'px'
      this.viewBoxStyle.width = ((this.width*scale - this.targetW) > 0 ? this.vStartWidth*this.targetW/(this.width*scale) : this.vStartWidth) + 'px'      
      this.curScale = scale
    }
  }
  onPinchout(e){
    /**
     * 放大 高宽增加 使原点居中即 减小 left 和 top 的值
     * left 值计算  原left的值 - 增加的宽度/2
     */
    //转换scale
    let scale = e.scale*this.oldScale
    if(scale < 1){
      this.stageStyle.transform = `translate(${this.stageLeft}px,${this.stageTop}px)scale(${scale})`
      //left ok 
      this.viewBoxStyle.left = this.vStartLeft + this.rate*(this.width*scale - this.targetW)/2 + 'px'
      //top ok
      if((this.height*scale - this.targetH) > 0){
        this.viewBoxStyle.top = this.vStartTop + this.rate*(this.height*scale - this.targetH)/2 + 'px'
      }
      this.viewBoxStyle.height = ((this.height*scale - this.targetH) > 0 ? this.vStartHeight*this.targetH/(this.height*scale) : this.vStartHeight) + 'px'
      this.viewBoxStyle.width = ((this.width*scale - this.targetW) > 0 ? this.vStartWidth*this.targetW/(this.width*scale) : this.vStartWidth) + 'px'      
      this.curScale = scale
    }
  }
  onMove(e){
    /**
     * 位移  原坐标 + 拖动距离/缩放值 
     */
    let left = this.stageLeft + e.deltaX
    let top = this.stageTop + e.deltaY
    let maxOffsetW = 60
    let maxOffsetH = 0
    //x轴
    if(this.targetW < this.curScale*this.width-40){
      //位移距离 （图宽 - 显示区域宽）/2  +  显示区域宽/3
      maxOffsetW = (this.curScale*this.width - this.targetW)/2 + this.targetW/3
      if(e.deltaX > 0){
        left  =  (this.startLeft + maxOffsetW) < left ? (this.startLeft + maxOffsetW) : left
        let move = this.startLeft > left ? this.startLeft - left : this.startLeft - left 
        let curViewBoxLeft = this.vStartLeft + this.rate*(this.width*this.curScale - this.targetW)/2
        this.viewBoxStyle.left = curViewBoxLeft + move*this.rate/this.curScale  +'px'
      }else{
        left = (this.startLeft - maxOffsetW) > left ? (this.startLeft - maxOffsetW) : left
        let move = this.startLeft > left ? this.startLeft - left : this.startLeft - left 
        let curViewBoxLeft = this.vStartLeft + this.rate*(this.width*this.curScale - this.targetW)/2
        this.viewBoxStyle.left = curViewBoxLeft + move*this.rate/this.curScale  +'px'
      }
    }else{
      maxOffsetW = 0
      if(Math.abs(Math.abs(left) - Math.abs(this.startLeft)) > maxOffsetW){
        left = this.startLeft  + (e.deltaX > 0 ? maxOffsetW : -maxOffsetW)
      }
      this.viewBoxStyle.left = this.vStartLeft +'px'
    }
    //y轴
    if(this.targetH < this.curScale*this.height){
      maxOffsetH = (this.curScale*this.height - this.targetH)/2 + this.targetH/5
      if(e.deltaY > 0){
        top  =  (this.startTop + maxOffsetH) < top ? (this.startTop + maxOffsetH) : top
      }else{
        top = (this.startTop - maxOffsetH) > top ? (this.startTop - maxOffsetH) : top
      }
      this.viewBoxStyle.top = this.vStartTop - top*this.rate + 'px'
    }else{
      top = this.startTop
      this.viewBoxStyle.top = this.vStartTop + 'px'
    }
    this.moveLengthX = left
    this.moveLengthY = top
    this.stageStyle.transform = `translate(${left}px,${top}px)scale(${this.curScale})`
  }
}
export default SeatsMap