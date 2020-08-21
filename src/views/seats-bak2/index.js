
import { SVG } from '@svgdotjs/svg.js'
import Hammer from 'hammerjs'
import SeatNode from './nodeElement'


class SeatsMap {
  constructor({data = [], onClick}){
    this.data = data
    this.onClick = onClick
    const seatW = 40
    this.paddingw = 60
    this.tbbox = 164
    

    this.width = Math.max(...data.map(ele=>ele.x)) + seatW + this.paddingw
    this.height = Math.max(...data.map(ele=>ele.y)) + seatW + this.paddingw

    this.rate = Math.min(this.tbbox/this.width, this.tbbox/this.height)

    this.draw = SVG().addTo('#stage').size(this.width, this.height)
    this.thumbnailDraw = SVG().addTo('#thumbnail').size(this.width, this.height)
    this.group = this.draw.group()

    this.init()
  }
  loadData(data){

  }
  init(){
    
    const box = document.querySelector('#seatbox')
    const stage = document.querySelector('#stage')
    const stageStyle = stage.style
    stageStyle.width = this.width + 'px'
    stageStyle.height = this.height + 'px'
    
    const thumbnailbox = document.querySelector('#thumbnail')
    const viewBox = thumbnailbox.querySelector('#thumbnailview')
    const viewBoxStyle = viewBox.style
    
    // 小图视窗初始化
    let vStartTop = (this.tbbox - this.rate*this.height)/2, vStartLeft = 0, vStartHeight = this.height*this.rate, vStartWidth = this.tbbox
    viewBoxStyle.left = vStartLeft + 'px'
    viewBoxStyle.top = vStartTop + 'px'
    viewBoxStyle.height = vStartHeight + 'px'
    viewBoxStyle.width = vStartWidth + 'px'

    this.creatSeats()
    
    let targetW = box.offsetWidth
    let targetH = box.offsetHeight
    let ratew = 1, rateh = 1
    if(targetW < this.width){
      ratew = targetW / this.width
    }
    if(targetH < this.height){
      rateh = targetH / this.height
    }

    let minScale = Math.min(ratew, rateh)
    let stageLeft = 0, stageTop = 0
    let startLeft = -(this.width - minScale*this.width)/2
    let startTop = -(this.height - minScale*this.height)/2 + (targetH - minScale*this.height)/2
    stageLeft = startLeft
    stageTop = startTop
    stageStyle.transform = `translate(${stageLeft}px,${stageTop}px)scale(${minScale})`

    
    this.createSnapshot();
    //事件处理
    //添加事件
    var mc = new Hammer.Manager(box);
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));  
    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(mc.get('pan'));
    let  oldScale = minScale, curScale = minScale, moveLengthX = 0, moveLengthY = 0 
    mc.on("hammer.input", e=>{});
    mc.on("panstart", e=>{}); 
    mc.on("panmove", e=>{
      /**
       * 位移  原坐标 + 拖动距离/缩放值 
       * 
       */
      let left = stageLeft + e.deltaX
      let top = stageTop + e.deltaY
      let maxOffsetW = 60
      let maxOffsetH = 0
      //x轴
      if(targetW < curScale*this.width){
        console.log(111)
        //位移距离 （图宽 - 显示区域宽）/2  +  显示区域宽/3
        maxOffsetW = (curScale*this.width - targetW)/2 + targetW/3
        if(e.deltaX > 0){
          viewBoxStyle.left = vStartLeft - left*this.rate +'px'
          left  =  (startLeft + maxOffsetW) < left ? (startLeft + maxOffsetW) : left
          
        }else{
          viewBoxStyle.left = vStartLeft - left*this.rate +'px'
          left = (startLeft - maxOffsetW) > left ? (startLeft - maxOffsetW) : left
        }
        
      }else{
        return
        maxOffsetW = e.deltaX
        // if(Math.abs(Math.abs(left) - Math.abs(startLeft)) > maxOffsetW){
        //   maxOffsetW = (curScale*this.width - targetW)/2 + targetW/3
        // }
        
        if(e.deltaX < 0){
          console.log(e.deltaX, 1,'e.deltaX')
          left = startLeft  + maxOffsetW
          viewBoxStyle.left = vStartLeft - maxOffsetW*this.rate +'px'
          // console.log(left, vStartLeft - left*this.rate)
        }else{
          console.log(e.deltaX, 2,'e.deltaX')
          left = startLeft  + maxOffsetW
          viewBoxStyle.left = vStartLeft + maxOffsetW*this.rate +'px'
        }
       

      }
      
      //y轴
      if(targetH < curScale*this.height){
        maxOffsetH = (curScale*this.height - targetH)/2 + targetH/5
        if(e.deltaY > 0){
          top  =  (startTop + maxOffsetH) < top ? (startTop + maxOffsetH) : top
          
        }else{
          top = (startTop - maxOffsetH) > top ? (startTop - maxOffsetH) : top
        }
        viewBoxStyle.top = vStartTop - top*this.rate + 'px'
      }else{
        top = startTop
        viewBoxStyle.top = vStartTop + 'px'
      }
      moveLengthX = left
      moveLengthY = top
      stageStyle.transform = `translate(${left}px,${top}px)scale(${curScale})`

    });
    mc.on("panend", e=>{
      stageLeft = moveLengthX
      stageTop = moveLengthY
    });

    mc.on("pinchstart", e=>{

    });

    mc.on('pinchin', e=> {
      let scale = e.scale*oldScale
      if(scale > minScale){
        stageStyle.transform = `translate(${stageLeft}px,${stageTop}px)scale(${scale})`
        viewBoxStyle.height = ((this.height*scale - targetH) > 0 ? vStartHeight*(1-targetH/(this.height*scale)) : vStartHeight) + 'px'
        viewBoxStyle.width = ((this.width*scale - targetW) > 40 ? vStartWidth*(1-targetW/(this.width*scale)) : vStartWidth) + 'px'
        curScale = scale
      }
    });
    mc.on('pinchout', e=> {
      /**
       * 放大 高宽增加 使原点居中即 减小 left 和 top 的值
       * left 值计算  原left的值 - 增加的宽度/2
       */
      //转换scale
        let scale = e.scale*oldScale
        if(scale < 1){
          stageStyle.transform = `translate(${stageLeft}px,${stageTop}px)scale(${scale})`
          viewBoxStyle.height = ((this.height*scale - targetH) > 0 ? vStartHeight*targetH/(this.height*scale) : vStartHeight) + 'px'
          viewBoxStyle.width = ((this.width*scale - targetW) > 0 ? vStartWidth*targetW/(this.width*scale) : vStartWidth) + 'px'      
          curScale = scale
        }
    });
    mc.on("pinchend", e=>{
      oldScale = curScale
    });
  }
  creatSeats(){
    this.data.forEach(ele=>{
      let seatgroup = new SeatNode(ele, this.draw)
      let seat  = seatgroup.init();
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
  getSelections(){
    return this.data.filter(ele=>ele.status == 'selectd')
  }
  bindEvent(){}
}

export default SeatsMap