<template>
  <el-menu default-active="activeIndex" @select="handleSelectMenu" :collapse=true>
    <el-menu-item index="1">
        <i class="el-icon-mouse"></i>
      <span slot="title">开始游戏</span>
    </el-menu-item>
    <el-menu-item index="2">
        <i class="el-icon-medal-1"></i>
      <span slot="title">排行榜</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: "SideBar",
  data() {
    return {
      activeIndex: "1"
    }
  },
  methods: {
    handleSelectMenu(key) {
      this.activeIndex = key;
      console.log(typeof this.activeIndex,this.activeIndex)
      this.$emit("changeIndex",this.activeIndex)
    }
  }
}
</script>

<style scoped>

</style>