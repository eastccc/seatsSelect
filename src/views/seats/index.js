
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
    const seatW = 40
    this.paddingw = 60
    this.tbbox = 164

    this.box = null
    this.stageStyle = null
    this.viewBoxStyle = null
    
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
    
    this.width = Math.max(...data.map(ele=>ele.x)) + seatW + this.paddingw
    this.height = Math.max(...data.map(ele=>ele.y)) + seatW + this.paddingw
    this.rate = Math.min(this.tbbox/this.width, this.tbbox/this.height)

    this.draw = SVG().addTo('#stage').size(this.width, this.height)
    this.thumbnailDraw = SVG().addTo('#thumbnail').size(this.width, this.height)
    this.group = this.draw.group()
    this.init()
  }
  loadData(data){}
  init(){
    this.box = document.querySelector('#seatbox')
    this.stageStyle = document.querySelector('#stage').style
    this.stageStyle.width = this.width + 'px'
    this.stageStyle.height = this.height + 'px'
    
    this.viewBoxStyle = document.querySelector('#thumbnailview').style
    
    // 小图视窗初始化
    this.vStartTop = (this.tbbox - this.rate*this.height)/2
    this.vStartLeft = 0
    this.vStartHeight = this.height*this.rate
    this.vStartWidth = this.tbbox
    this.viewBoxStyle.left = this.vStartLeft + 'px'
    this.viewBoxStyle.top = this.vStartTop + 'px'
    this.viewBoxStyle.height = this.vStartHeight + 'px'
    this.viewBoxStyle.width = this.vStartWidth + 'px'

    this.creatSeats()
    
    this.targetW = this.box.offsetWidth
    this.targetH = this.box.offsetHeight
    let ratew = 1, rateh = 1
    if(this.targetW < this.width){
      ratew = this.targetW / this.width
    }
    if(this.targetH < this.height){
      rateh = this.targetH / this.height
    }

    this.minScale = Math.min(ratew, rateh)
    
    this.startLeft = -(this.width - this.minScale*this.width)/2
    this.startTop = -(this.height - this.minScale*this.height)/2 + (this.targetH - this.minScale*this.height)/2
    this.stageLeft = this.startLeft
    this.stageTop = this.startTop
    this.stageStyle.transform = `translate(${this.stageLeft}px,${this.stageTop}px)scale(${this.minScale})`

    this.oldScale = this.minScale
    this.curScale = this.minScale
    this.moveLengthX = 0
    this.moveLengthY = 0 
    
    this.createSnapshot();
    //事件处理
    //添加事件
    this.bindEvent()
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
    cloneG.transform({
      translate : [-(this.width-this.rate*this.width)/2, -(this.height - this.rate*this.height)/2 + this.paddingw*this.rate/2 +  (this.tbbox - this.rate*this.height)/2],
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
    this.mc = new Hammer.Manager(this.box);
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
      this.viewBoxStyle.left = this.rate*(this.width*scale - this.targetW) + 'px'
      if((this.height*scale - this.targetH) > 0){
        this.viewBoxStyle.top = this.rate*(this.height*scale - this.targetH) + 'px'
      }
      this.viewBoxStyle.height = ((this.height*scale - this.targetH) > 0 ? this.vStartHeight*(1-this.targetH/(this.height*scale)) : this.vStartHeight) + 'px'
      this.viewBoxStyle.width = ((this.width*scale - this.targetW) > 40 ? this.vStartWidth*(1-this.targetW/(this.width*scale)) : this.vStartWidth) + 'px'
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
      this.viewBoxStyle.left = this.rate*(this.width*scale - this.targetW) + 'px'
      if((this.height*scale - this.targetH) > 0){
        this.viewBoxStyle.top = this.rate*(this.height*scale - this.targetH) + 'px'
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
        let move = (this.startLeft + maxOffsetW) < left ? maxOffsetW : e.deltaX
        this.viewBoxStyle.left = this.vStartLeft + move*this.rate +'px'
      }else{
        left = (this.startLeft - maxOffsetW) > left ? (this.startLeft - maxOffsetW) : left
        let move = (this.startLeft - maxOffsetW) > left ? -maxOffsetW : e.deltaX
        this.viewBoxStyle.left = this.vStartLeft - move*this.rate +'px'
      }
    }else{
      maxOffsetW = 0
      if(Math.abs(Math.abs(left) - Math.abs(this.startLeft)) > maxOffsetW){
        left = this.startLeft  + (e.deltaX > 0 ? maxOffsetW : -maxOffsetW)
      }
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