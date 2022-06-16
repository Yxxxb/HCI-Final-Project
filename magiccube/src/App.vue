<template>
  <el-container class="background">
<!--    <el-aside width=100>-->
<!--      <SideBar class="sideBar" @changeIndex="handleIndex"></SideBar>-->
<!--    </el-aside>-->
    <el-main>
      <MagicCube v-if="index==='1'"></MagicCube>
<!--      <RankList v-if="index==='2'"></RankList>-->
    </el-main>
  </el-container>
</template>

<script>
import MagicCube from "./views/MagicCube";
// import SideBar from "./components/SideBar";
// import RankList from "./views/RankList";

export default {
  name: 'App',
  components: {
    MagicCube,
    // SideBar, RankList
  },
  data(){
    return{
      index:"1"
    }
  },
  methods:{
    handleIndex(index){
      this.index=index
    }
  }
}
</script>

<style scoped>
.background {
  background-size: cover;
  width: 100%;
  height: 100%;
  background: aliceblue;
  position: fixed;
  margin-top: 0;
}
.sideBar{
  margin-top: 270px;
  margin-left: 20px;
}
</style>
