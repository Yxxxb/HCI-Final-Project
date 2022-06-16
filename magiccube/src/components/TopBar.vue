<template>
  <el-main>
    <el-row style="max-height: 200px;margin-top: 20px">
      <el-col :span="2">&nbsp;</el-col>
      <el-col :span="2">
        <el-select v-model="selectValue" placeholder="请选择" style="width: 100px">
          <el-option
              v-for="item in selectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-switch
            v-model="switchValue"
            active-text="开启提示"
            inactive-text="关闭提示"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :width=50
        @change="changeTips()">
        </el-switch>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="6">
          <el-col :span="6">
            <p class="Timer">{{ minuteString }}</p>
          </el-col>
          <el-col :span="3">
            <p class="Colon">:</p>
          </el-col>
          <el-col :span="6">
            <p class="Timer">{{ secondString }}</p>
          </el-col>
          <el-col :span="3">
            <p class="Colon">:</p>
          </el-col>
          <el-col :span="6">
            <p class="Timer">{{ millisecondString }}</p>
          </el-col>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="3">
        <el-button @click="handleShowDrawer()">
          游戏说明
        </el-button>
      </el-col>
      <el-col :span="1" >
        <el-button type="primary" icon="el-icon-video-play" circle @click="startHandler"></el-button>
      </el-col>
      <el-col :span="1" >
        <el-button type="info" icon="el-icon-video-pause" circle @click="endHandler"></el-button>
      </el-col>
      <el-col :span="1" >
        <el-button type="warning" icon="el-icon-refresh" circle @click="resetHandler"></el-button>
      </el-col>
      <el-col :span="1" >
        <el-button type="success" icon="el-icon-circle-check" circle @click="commitHandler"></el-button>
      </el-col>
    </el-row>
    <el-drawer
        title="游戏说明"
        :visible.sync="showDrawer"
        direction="ltr"
        :modal-append-to-body='false'
        size="30%">
      <span class="drawerSpan">
        <strong>
          W/w :
        </strong>
        <span>
          查看魔方背面
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          S/s :
        </strong>
        <span>
          显示/关闭坐标轴
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          1 :
        </strong>
        <span>
          将视野变为标准角度
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+U/u 即 公式U'/U:
        </strong>
        <span>
          (逆)顺时针旋转魔方上面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+D/d 即 公式D'/D:
        </strong>
        <span>
          (逆)顺时针旋转魔方下面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+R/r 即 公式R'/R:
        </strong>
        <span>
          (逆)顺时针旋转魔方右面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+L/l 即 公式L'/L:
        </strong>
        <span>
          (逆)顺时针旋转魔方左面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+F/f 即 公式F'/F:
        </strong>
        <span>
          (逆)顺时针旋转魔方前面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          (Alt)+B/b 即 公式B'/B:
        </strong>
        <span>
          (逆)顺时针旋转魔方后面一层
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          Q/q :
        </strong>
        <span>
          打开游戏说明
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          蓝色按钮 :
        </strong>
        <span>
          开始游戏
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          灰色按钮 :
        </strong>
        <span>
          暂停计时
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          橘色按钮 :
        </strong>
        <span>
          重置游戏
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          绿色按钮 :
        </strong>
        <span>
          检测是否已完成
        </span>
      </span>
      <p></p>
      <span class="drawerSpan">
        <strong>
          鼠标右键移动魔方、左键转动魔方
        </strong>
      </span>
    </el-drawer>
  </el-main>
</template>

<script>

export default {
  name: 'TopBar',
  data() {
    return {
      flag: null,
      isTiming: false,
      minute: 0,
      second: 0,
      millisecond: 0,//表示10毫秒
      totalTime:0,//总时间
      minuteString: "00",
      secondString: "00",
      millisecondString: "00",

      isPaused: true,
      // isReset: true

      //选择器的值
      switchValue:false,

      //展示指南
      showDrawer:false,

      selectOptions: [{
        value: '1',
        label: '拼六面'
      }, {
        value: '2',
        label: '拼一面'
      }],
      selectValue:"1"
    }
  },
  methods: {
    // 开始计时
    startHandler() {
      this.isPaused = false;
      this.$parent.setControlEnable();
      if (!this.isTiming) {
        this.isTiming = true;
        this.flag = setInterval(() => {
          this.millisecond += 1;
          if (this.millisecond === 100) {
            this.millisecond = 0;
            this.second += 1;
          }
          if (this.second === 60) {
            this.second = 0;
            this.minute += 1;
          }
          this.allToString();
          this.totalTime+=10;
          // if(this.totalTime===1000) {
          //   console.log(this.flag)
          //   clearInterval(this.flag);
          // }
        }, 10)
      }
    },
    allToString() {
      this.minuteString = this.minute.toString();
      this.millisecondString = this.millisecond.toString();
      this.secondString = this.second.toString();
      if(this.millisecond<10) {
        this.millisecondString="0" + this.millisecond.toString();
      }
      if(this.minute<10) {
        this.minuteString="0" + this.minute.toString();
      }
      if(this.second<10) {
        this.secondString="0" + this.second.toString();
      }
      // this.minuteString = this.minute !== 0 ? this.minute.toString() : "00";
      // this.secondString = this.second !== 0 ? this.second.toString() : "00";
      // this.millisecondString = this.millisecond !== 0 ? this.millisecond.toString() : "00";
    },
    // 暂停计时
    endHandler() {
      clearInterval(this.flag)
      this.isTiming = false;
      if(!this.isPaused) {
        this.isPaused = true;
        this.$parent.cancelControlEnable();
      }
    },
    resetHandler(){
      this.endHandler();
      this.minute=0;
      this.second=0;
      this.millisecond=0;
      this.allToString();
      this.totalTime=0;
      this.$parent.getRandomCubes();
      if(this.switchValue) {
        this.cancelTips()
      }
    },
    commitHandler(){
      console.log("commit")
      if(this.selectValue==='2'){
        let result = this.$parent.commitSingle();
        if(!result) {
          this.$message({
            showClose: true,
            message: '您的魔方还未拼完',
            type: 'error'
          });
        }
        else{
          this.$message({
            message: '恭喜你完成了第一面',
            type: 'success'
          });
          this.resetHandler()
        }
        return
      }
      let theDate = new Date()
      this.endHandler();
      let result = this.$parent.commitCubes();
      if(!result) {
        this.$message({
          showClose: true,
          message: '您的魔方还未拼完',
          type: 'error'
        });
      }
      else {
        this.$prompt('请输入你的姓名', '恭喜您已完成魔方挑战!', {
          confirmButtonText: '确定',
          showCancelButton: false,
        }).then(({ value }) => {
          console.log("here")
          let name = value;
          let timeString = this.minute+":"+this.second+"'"+this.millisecond
          let time = this.totalTime
          let day = theDate.getDate()
          let month = theDate.getMonth()+1
          let axios = require('axios');
          let FormData = require('form-data');
          let data = new FormData();
          data.append('name', name);
          data.append('timeString', timeString);
          data.append('time', time);
          data.append('day',day);
          data.append('month',month);
          let config = {
            method: 'post',
            url: 'http://localhost:8098/api/v1/record/post/add',
            data: data
          };

          axios(config)
              .then((response)=>{
                console.log(response);
                this.$message({
                  type: 'success',
                  message: '上传成功!您的成绩是' + this.minute+":"+this.second+"'"+this.millisecond
                });
                this.resetHandler()
              })
              .catch(function (error) {
                console.log(error);
              });

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      }
    },

    changeTips(){
      console.log("changeTips")
      if(this.switchValue===true)  this.$emit("getTips")
      else this.$emit("cancelTips")
    },
    cancelTips(){
      this.switchValue = false;
      this.$emit("cancelTips")
    },

    /**
     * @Description: 开启快捷键提示框
     * @author Zhao Ziqi
     * @date 2021/12/20
     * @Params null
     * @Return null
    */
    handleShowDrawer(){
      this.showDrawer=true;
    }

  }
}
</script>


<style scoped>
.Timer {
  font-family: Cute,serif;
  font-size: 300%;
  vertical-align: text-top;
}

.Colon {
  font-size: 270%;
}
.drawerSpan{
  margin-left: 30px;
}
</style>