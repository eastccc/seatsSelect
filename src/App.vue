<template>
  <div id="app">
    <div id="seats">
      <img src="./../static/performbg.jpg.png" alt="">
      <!-- <img src="data:image/png;base64,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" style="display:block;" width="100%" alt="">
      <div id="stagebox">
        <div id="stage"></div>
      </div>
      <div id="thumbnail">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAAkBAMAAAAzy086AAAAKlBMVEVHcEzZ2dnZ2dnb29vg4ODc3NzZ2dna2trY2Nj////u7u7m5ubd3d329vYTZU6tAAAACHRSTlMAyutXEy+qg3jeFasAAALOSURBVFjD1Zg/b9NAGMZfiQA7iipWVEVijFjo2H4DxAArDEiMlRASa6iU2r7zHtvxHjtlT3LpHlN3j9Pku3D/7HOIS6I7S8SPJediS6df3rz3PGfDD6tJuoYnjeLtArxpEO4pADx93Rjcn+8oL7xvDG+H4ULrZUNwe+ecFy7MprmflL+RhRrjkRqjG2PeNkh9NZom2+L1SrxOoMb20hS3n+PCc5NpfntSHNsNyvc2ajgdmfJeFrxgEBoo80jGjjEvbDSSDYJTqumcnuh1esrYMF2YRIWSQWigdWTxg6OgkJ6SAatnXnbPt1AxNihyt8QLZwb/U5l3umalZdCzOI78mGlMf0UsFOnzXpVxDULDKWq3ZOUVTSFWoDvI/4O8qRNtXhEVStqhgeJMHiMLR2srvSOzaCh4l/XxdrZxTUJD9YPtbUSpwx1ezBebNm8eFUoXNfC6m80qJiSV5mWvpSVQXrb8An3eNuxIMzSikg8UEi6cFG1NeVdxrM/b38WFZ3pTzeJc41IQ8/BNVswSJO/Ewvq8nyp4tUNjyt3ggZuFRB+pG3YNvNdVuNqh4RFCPSEkE7bghISRZQtpCaa83UpezdBwKV8sG1WssPSe8/LYqIP3qhpXLzRwdpNG8zn2S5swERTCdXPeMSGavH9HhVloJAHBIRpW8CaDMq++n3Uew9UKDbTIfg3dYRoyo93iFfviZMJ57wghcy3e3agwDA3Hm/B1FhS8DuN1/MIkjPK4/TgutDRCA0eBhQgJafks+4Ew3TLeSLBnhvuH/j/KqxMaKPOZbcn+VX7msK0aJreB4iVk+9FJPyoMQsPluDmv8jOb7YSR2KFL3qkXLuqJCoPQwBKBpzES9WMf4rp4AMJzflnncai7h/fIXk+d7sM9rrcnvfO9vGYP9zXrEg7Qh6PB/QLQJOADcQE+HkMP977DwWq9/fziv8K+OvlWvdT+AGKH3jtCaIWxAAAAAElFTkSuQmCC" style="display:block;" width="100%" alt="">
        <div id="thumbnailview">
        </div>
      </div> -->
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
    
  },
  methods :{
    initSeats(){
      this.seats = new SeatsMap({
        el : '#seats',
        data : seatData,
        onClick : (data)=>{
          console.log(data, 'data')
          this.selection = this.seats.getSelection()
          console.log(this.seats.getSelection(), 'getSelection')
        }
      })
    },
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
@import './views/seats/index.css'
</style>
