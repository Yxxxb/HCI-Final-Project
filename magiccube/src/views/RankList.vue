<template>
  <el-container >
<!--    <el-aside width=100>-->
<!--      <SideBar class="sideBar"></SideBar>-->
<!--    </el-aside>-->
    <el-main>
      <span class="title">
        TOP 10
        </span>
      <div id="chart" class="chart">
        
      </div>
    </el-main>
  </el-container>
</template>

<script>
// import SideBar from "../components/SideBar";


// import axios from "axios";

export default {
  name: "RankList",
  data(){
    return{
      chart:null,
      name:[],
      numData:[],
      oriData:[]
    }
  },
  components: {
    // SideBar
  },
  methods:{
    createChart(){
      this.chart=this.$echarts.init(document.getElementById('chart'));
      console.log("---",this.name,this.numData)
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          name:'时间/s',
        },
        yAxis: {
          type: 'category',
          name:'昵称',
          data: this.name,
          splitLine: {show: false},
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          offset: 10,
          nameTextStyle: {
            fontSize: 15
          }
        },
        series: [
          {
            name: '时间',
            type: 'bar',
            data: this.numData,
            barWidth: 14,
            barGap: 10,
            smooth: true,
            label: {
              normal: {
                show: true,
                position: 'right',
                offset: [5, -2],
                textStyle: {
                  color: 'rgb(55,65,248)',
                  fontSize: 13
                }
              }
            },
            itemStyle: {
              emphasis: {
                barBorderRadius: 7
              },
              normal: {
                barBorderRadius: 7,
                color: new this.$echarts.graphic.LinearGradient(
                    0, 0, 1, 0,
                    [
                      {offset: 0, color: 'rgba(57,71,230,0.22)'},
                      {offset: 1, color: 'rgba(55,71,248,0.9)'}

                    ]
                )
              }
            }
          }
        ]
      };
      this.chart.setOption(option);
    },
    //获取原始数据
    getOriData(){
      // let axios = require('axios');
      // let config = {
      //   method: 'get',
      //   url: 'http://localhost:8098/api/v1/record/get/top',
      // };
      // axios(config)
      //     .then((response)=>{
      //       console.log(response.data);
      //       this.oriData=response.data;
      //       for(let data of this.oriData){
      //         console.log("setNameData",data)
      //         this.name.unshift(data.name)
      //         console.log("setNameData2",this.name)
      //       }
      //       for(let data of this.oriData){
      //         this.numData.unshift((data.time/1000))
      //         console.log("setNameData3",this.numData)
      //       }
      //       this.createChart()
      //     })
      //     .catch(function (error) {
      //       console.log(error);
      //     });
    },
    //处理数据
    setNameData(){
      for(let data in this.oriData){
        console.log("setNameData",data)
        this.name.unshift(data.name)
      }
      console.log(this.name)
    },
    setNumData(){
      for(let data of this.oriData){
        this.numData.unshift((data.time/1000))
      }
    }
  },
  created(){
    this.getOriData();
    console.log("------")
    let axios = require('axios');
    let config = {
      method: 'get',
      url: 'http://124.223.35.37:8088/search-hospital-service/api/v1/hospital/all',
    };
    axios(config)
        .then((response) => {
          console.log("this",response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
  },
  mounted() {
    //this.createChart();
  }
}
</script>

<style scoped>
.chart{
  width: 650px;
  height: 600px;
  margin: 0 auto;
}
.title{
  font-family: Annabelle;
  font-size: 50px;
  text-align: center;
  font-weight: bolder;
}
</style>