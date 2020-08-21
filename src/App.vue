<template>
  <div id="app">
    <div>
      <img src="./res/stage525.png" style="display:block;" width="100%" alt="">
      <div id="seatbox">
        <div id="stage">
        </div>
      </div>
      
      <div id="thumbnail">
        <img src="./res/stage350.png" style="display:block;" width="100%" alt="">
        <div id="thumbnailview">
        </div>
      </div>
    </div>
    <div style="width:100%">
      <button @click="clear">清除选中</button>
      <div v-for="(item,index) in selection">{{item.x}}--{{item.y}}--{{item.status}}</div>
    </div>
  </div>
</template>

<script>
import seatData from './views/seats/data.json';
import SeatsMap from './views/seats/index'
export default {
  name: 'App',
  data () {
    return {
      selection : [],
      methods : null
    }
  },
  mounted(){
    this.seats = new SeatsMap({
      data : seatData,
      onClick : (data)=>{
        console.log(data, 'data')
        this.selection = this.seats.getSelection()
        console.log(this.seats.getSelection(), 'getSelection')
      }
    })
  },
  methods :{
    clear(){
      this.seats.clearSelection()
      this.selection = this.seats.getSelection()
    }
  }
}
</script>

<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 500px;
  width: 100%;
  border:1px solid #ccc;
  text-align: center;
}
#app > img {
  width: 200px;
  height: 20px;
  margin: auto;
}
#seatbox{
  margin-top: 10px;
  height: 420px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
}
#stage{
  position: absolute;
  left: 0;
  top: 0;
  border: 1px solid #ff0000;
}
#debug{
  width:100%;  
  padding: 0 15px;
  overflow:auto;
}
#thumbnail{
  text-align: center;
  width: 164px;
  height: 164px;
  top: 6px;
  right: 6px;
  border-radius: 6px;
  position:absolute;
  background: rgba(0, 0, 0, .6);
  z-index: 9999;
  overflow: hidden;
}
#thumbnail img{
  width: 50%;
  margin-left: 25%;
  position: relative;
}
#thumbnail svg{
  /* width : 100%; */
  position:absolute;
  left: 2px;
}
#thumbnail #thumbnailview{
z-index: 9999999;  
position: absolute;
box-sizing: border-box;
border: 1px solid rgb(255, 45, 121);
left : 0;
top: 12px;
height: 100%;
width: 100%;
}
</style>
