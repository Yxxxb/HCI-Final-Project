<template>
  <div>
    <TopBar @getTips="handleGetTips" @cancelTips="handleCancelTips" ref="child"></TopBar>
    <div id="container" style="margin-top: 0"></div>
    <div v-if="isTips===true" class="tips">
      <div class="steps">
        <span>
          <span style="color: red;text-align: left;font-size: 60px;margin-left: 0">{{ currentSteps }}</span>
          <span style="color: black;text-align: left;font-size: 40px">/{{ totalSteps }}</span>
        </span>
      </div>
      <div style="margin-top: 20px;">
        <el-row>
          <el-col :span="12">
            <span class="nextStep">Next Step:</span>
          </el-col>
          <el-col :span="12">
            <span class="stepChar">{{ cubeSolution[currentSteps] }}</span>
          </el-col>
        </el-row>
      </div>
      <div class="imgBox">
        <img :src="imgUrl" alt="">
      </div>
    </div>
  </div>
</template>

<script>


//Three.js
import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

//Timer
import TopBar from '../components/TopBar'
// import SideBar from "../components/SideBar";

export default {
  name: "MagicCube",
  components: {
    TopBar,
    // SideBar
  },
  data() {
    return {
      //相机位置 越小图像越大
      cameraLength : 450,


      //键盘按键定义
      KEY_CHANGE_ANGLE_UPPER :'W',
      KEY_CHANGE_ANGLE_LOWER :'w',
/*      KEY_ROTATE_Z_CLOCK_UPPER:'Q',
      KEY_ROTATE_Z_CLOCK_LOWER:'q',
      KEY_ROTATE_Z_CLOCK_ANTI_UPPER:'E',
      KEY_ROTATE_Z_CLOCK_ANTI_LOWER:'e',
      KEY_ROTATE_X_CLOCK_UPPER:'Z',
      KEY_ROTATE_X_CLOCK_LOWER:'z',
      KEY_ROTATE_X_CLOCK_ANTI_UPPER:'C',
      KEY_ROTATE_X_CLOCK_ANTI_LOWER:'c',*/
      KEY_AXES_VISIBLE_UPPER:'S',
      KEY_AXES_VISIBLE_LOWER:'s',
      KEY_CHANGE_VIEW_TO_STANDARD:'1',
      KEY_SHORTCUT_UPPER:'Q',
      KEY_SHORTCUT_LOWER:'q',


      KEY_MOVE_CUBE_U_UPPER:'U',
      KEY_MOVE_CUBE_U_LOWER:'u',
      KEY_MOVE_CUBE_D_UPPER:'D',
      KEY_MOVE_CUBE_D_LOWER:'d',
      KEY_MOVE_CUBE_F_UPPER:'F',
      KEY_MOVE_CUBE_F_LOWER:'f',
      KEY_MOVE_CUBE_B_UPPER:'B',
      KEY_MOVE_CUBE_B_LOWER:'b',
      KEY_MOVE_CUBE_L_UPPER:'L',
      KEY_MOVE_CUBE_L_LOWER:'l',
      KEY_MOVE_CUBE_R_UPPER:'R',
      KEY_MOVE_CUBE_R_LOWER:'r',

      //初始化参数
      camera: null,
      scene: null,
      renderer: null,
      cube: null,
      light: null,
      materials: null,
      controller: null,
      raycaster: null,
      object: [],

      cubeLength: 50,
      clientWidth: null,
      clientHeight: null,

      isRotating: false,
      mousePosition: new Three.Vector2(),
      normalize: null,
      intersect: null,
      startPoint: null,
      movePoint: null,

      //旋转动画
      direction: null, //共六种,[yClock,yAntiClock,xClock,xAntiClock,zClock,zAntiClock]
      elements: null,//要移动的元素
      startStamp: null,
      currentStamp: null,
      lastStamp: null,
      timeOutID: null,

      isRotateOver: true,

      randomGenerateTimes: 0,

      controlEnable: false, // 是否能旋转魔方

      checkCubesRules: [["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        ["1", "2", "3", "10", "11", "12", "19", "20", "21"],
        ["1", "4", "7", "10", "13", "16", "19", "22", "25"],
        ["7", "8", "9", "16", "17", "18", "25", "26", "27"],
        ["3", "6", "9", "12", "15", "18", "21", "24", "27"],
        ["19", "20", "21", "22", "23", "24", "25", "26", "27"]], // 记录最开始魔方是如何排列的

      firstKeyDown: true,

      //魔方
      realCube:null,

      //魔方求解步骤
      cubeSolution:[],

      //是否处于求解步骤
      isTips: false,

      //当前步数
      currentSteps:0,

      //总步数
      totalSteps:0,

      //下一步公式
      nextStep:"",

      imgUrl:"",

    };
  },
  methods: {
    //初始化魔方求解器
    initRealCube(){
      const Cube = require('cubejs');
      Cube.initSolver();
      this.realCube = new Cube();
    },

    /**
     * @Description: 初始化相机
     * @author Zhao Ziqi
     * @date 2021/11/03
     * @Params null
     * @Return null
    */
    initCamera() {
      this.camera = new Three.PerspectiveCamera(
          45,
          this.clientWidth / this.clientHeight,
          1,
          1000
      );
      this.camera.lookAt(0, 1, 0);
      this.camera.position.set(0, 0, this.cameraLength);
    },

    /**
     * @Description: 初始化控制器
     * @author Zhao Ziqi
     * @date 2021/11/03
     * @Params null
     * @Return null
    */
    initController(){
      this.controller = new OrbitControls(this.camera, this.renderer.domElement);
      this.controller.target = new Three.Vector3(0, 0, 0);//设置控制点
      this.controller.enablePan =false;
      this.controller.mouseButtons={RIGHT:Three.MOUSE.ROTATE};
      this.controller.minPolarAngle = -Math.PI;
      console.log(this.controller);
    },

    //初始化渲染器
    initRenderer() {
      let container = document.getElementById("container");
      this.clientWidth = container.clientWidth;
      this.clientHeight = container.clientHeight;
      console.log("clientWidth", container.clientWidth)
      console.log("clientHeight", container.clientHeight)
      this.renderer = new Three.WebGLRenderer({antialias: true});
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setClearColor('rgb(255,255,255)');
      container.appendChild(this.renderer.domElement);
    },

    //初始化屏幕
    initScreen() {
      this.scene = new Three.Scene();
    },

    //初始化鼠标捕获器
    initRaycaster() {
      this.raycaster = new Three.Raycaster();
    },

    //初始化材料
    initMaterial() {
      let redMap = new Three.TextureLoader().load(require('../assets/picture/red.png'));
      let orangeMap = new Three.TextureLoader().load(require('../assets/picture/orange.png'));
      let yellowMap = new Three.TextureLoader().load(require('../assets/picture/yellow.png'));
      let blueMap = new Three.TextureLoader().load(require('../assets/picture/blue.png'));
      let greenMap = new Three.TextureLoader().load(require('../assets/picture/green.png'));
      let whiteMap = new Three.TextureLoader().load(require('../assets/picture/white.png'));

      let redMater = new Three.MeshBasicMaterial({map: redMap, side: Three.DoubleSide});
      let orangeMater = new Three.MeshBasicMaterial({map: orangeMap, side: Three.DoubleSide});
      let yellowMater = new Three.MeshBasicMaterial({map: yellowMap, side: Three.DoubleSide});
      let whiteMater = new Three.MeshBasicMaterial({map: whiteMap, side: Three.DoubleSide});
      let blueMater = new Three.MeshBasicMaterial({map: blueMap, side: Three.DoubleSide});
      let greenMater = new Three.MeshBasicMaterial({map: greenMap, side: Three.DoubleSide});

      this.materials = [redMater, orangeMater, yellowMater, whiteMater, blueMater, greenMater];
      console.log("this.materials",this.materials)
    },

    //初始化物体
    initObject() {
      //初始化位置参数
      let id = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          for (let k = -1; k < 2; k++) {
            let geometry = new Three.BoxGeometry(this.cubeLength, this.cubeLength, this.cubeLength);
            geometry.name = "cube";
            let mesh = new Three.Mesh(geometry, this.materials);
            mesh.position.x = i * this.cubeLength;
            mesh.position.y = j * this.cubeLength;
            mesh.position.z = k * this.cubeLength;
            id+=1;
            mesh.name = id.toString();
            this.object.push(mesh)
            this.scene.add(mesh);
            console.log(mesh)
          }
        }
      }
      //添加透明材质
      const cubeObject = new Three.BoxGeometry(3 * this.cubeLength, 3 * this.cubeLength, 3 * this.cubeLength, 1, 1, 1);
      let cubeMat = new Three.MeshBasicMaterial({vertexColors: Three.FaceColors, opacity: 0, transparent: true});
      let cubeTransparent = new Three.Mesh(cubeObject, cubeMat);
      cubeTransparent.cubeType = 'coverCube';
      this.scene.add(cubeTransparent);
      //坐标轴,红线x轴，绿线y轴，蓝线z轴
      let axes = new Three.AxesHelper(100);
      axes.position.set(-100,-100,-100)
      axes.visible=false;
      this.scene.add(axes);
      // console.log(axes);
    },

    //初始化光源
    initLight() {
      this.light = new Three.AmbientLight("0x000080");
      this.scene.add(this.light);
    },

    //event-鼠标事件 获得点击点
    getIntersects(event) {
      event.preventDefault();
      let container = document.getElementById("container")
      let getBoundingClientRect = container.getBoundingClientRect()
      this.mousePosition.x = ((event.clientX - getBoundingClientRect.left) / this.clientWidth) * 2 - 1;
      this.mousePosition.y = -((event.clientY - getBoundingClientRect.top) / this.clientHeight) * 2 + 1;
      // console.log("mouse",event)
      this.raycaster.setFromCamera(this.mousePosition, this.camera);
      let intersects = this.raycaster.intersectObjects(this.scene.children);
      // console.log(intersects);
      if (intersects.length) {
        if (intersects[0].object.cubeType === 'coverCube') {
          this.intersect = intersects[1];
          this.normalize = intersects[0].face.normal;
        } else {
          this.intersect = intersects[0];
          this.normalize = intersects[1].face.normal;
        }
      }
    },

    //工具函数，获取最小的角度
    getMinAngle(angleList) {
      let min = angleList[0];
      for (let i = 1; i < angleList.length; i++) {
        if (angleList[i] < min) {
          min = angleList[i];
        }
      }
      return min;
    },

    //获取转动方向，绕哪个轴，顺、逆时针
    getDirection(vector3) {
      //魔方转动的六个方向
      let xLine = new Three.Vector3(1, 0, 0);//X轴正方向
      let xLineAd = new Three.Vector3(-1, 0, 0);//X轴负方向
      let yLine = new Three.Vector3(0, 1, 0);//Y轴正方向
      let yLineAd = new Three.Vector3(0, -1, 0);//Y轴负方向
      let zLine = new Three.Vector3(0, 0, 1);//Z轴正方向
      let zLineAd = new Three.Vector3(0, 0, -1);//Z轴负方向

      let zClock = "zClock";
      let zAntiClock = "zAntiClock";
      let xClock = "xClock";
      let xAntiClock = "xAntiClock";
      let yClock = "yClock";
      let yAntiClock = "yAntiClock";

      let direction;
      //判断差向量和x、y、z轴的夹角
      let xAngle = vector3.angleTo(xLine);
      let xAngleAd = vector3.angleTo(xLineAd);
      let yAngle = vector3.angleTo(yLine);
      let yAngleAd = vector3.angleTo(yLineAd);
      let zAngle = vector3.angleTo(zLine);
      let zAngleAd = vector3.angleTo(zLineAd);

      let minAngle = this.getMinAngle([xAngle, xAngleAd, yAngle, yAngleAd, zAngle, zAngleAd]);//最小夹角
      if (minAngle === xAngle) {
        if (this.normalize.equals(yLine)) {
          direction = zClock;//绕z轴顺时针
        } else if (this.normalize.equals(yLineAd)) {
          direction = zAntiClock;//绕z轴逆时针
        } else if (this.normalize.equals(zLine)) {
          direction = yAntiClock;//绕y轴逆时针
        } else {
          direction = yClock;//绕y轴顺时针
        }
      } else if (minAngle === xAngleAd) {
        if (this.normalize.equals(yLine)) {
          direction = zAntiClock;//绕z轴逆时针
        } else if (this.normalize.equals(yLineAd)) {
          direction = zClock;//绕z轴顺时针
        } else if (this.normalize.equals(zLine)) {
          direction = yClock;//绕y轴顺时针
        } else {
          direction = yAntiClock;//绕y轴逆时针
        }
      } else if (minAngle === yAngle) {
        if (this.normalize.equals(zLine)) {
          direction = xAntiClock//绕x轴逆时针
        } else if (this.normalize.equals(zLineAd)) {
          direction = xClock;//绕x轴顺时针
        } else if (this.normalize.equals(xLine)) {
          direction = zAntiClock;//绕z轴逆时针
        } else {
          direction = zClock;//绕z轴顺时针
        }
      } else if (minAngle === yAngleAd) {
        if (this.normalize.equals(zLine)) {
          direction = xClock;//绕x轴顺时针
        } else if (this.normalize.equals(zLineAd)) {
          direction = xAntiClock;//绕x轴逆时针
        } else if (this.normalize.equals(xLine)) {
          direction = zClock;//绕z轴顺时针
        } else {
          direction = zAntiClock;//绕z轴逆时针
        }
      } else if (minAngle === zAngle) {
        if (this.normalize.equals(yLine)) {
          direction = xClock;//绕x轴顺时针
        } else if (this.normalize.equals(yLineAd)) {
          direction = xAntiClock;//绕x轴逆时针
        } else if (this.normalize.equals(xLine)) {
          direction = yClock;//绕y轴顺时针
        } else {
          direction = yAntiClock;//绕y轴逆时针
        }
      } else {
        if (this.normalize.equals(yLine)) {
          direction = xAntiClock;//绕x轴逆时针
        } else if (this.normalize.equals(yLineAd)) {
          direction = xClock;//绕x轴顺时针
        } else if (this.normalize.equals(xLine)) {
          direction = yAntiClock;//绕y轴逆时针
        } else {
          direction = yClock;//绕y轴顺时针
        }
      }
      return direction;
    },

    /**
     * @Description: 获取要转动的目标
     * @author Zhao Ziqi
     * @date 2021/11/25
     * @Params direction
     * @Return cubes
    */
    getRotateCubes(direction) {
      console.log("this.intersect.object",this.intersect.object)
      let cubes = [];
      for (let i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].type === "Mesh") {
          if (this.scene.children[i].geometry.name === "cube") {
            if ((direction === "zClock"|| direction === "zAntiClock") && this.scene.children[i].position.z === this.intersect.object.position.z) {
              cubes.push(this.scene.children[i]);
            } else if ((direction === "yClock" || direction === "yAntiClock") && this.scene.children[i].position.y === this.intersect.object.position.y) {
              cubes.push(this.scene.children[i]);
            } else if ((direction === "xClock" || direction === "xAntiClock") && this.scene.children[i].position.x === this.intersect.object.position.x) {
              cubes.push(this.scene.children[i]);
            }
          }
        }
      }
      return cubes;
    },

    //获得随机旋转物体的函数
    getRandomRotateCubes(direction) {
      let cubes = [];
      let position = [this.cubeLength, 0, -this.cubeLength];
      let rotatePosition = position[Math.floor(Math.random() * 3)];
      console.log("rotatePosition", rotatePosition);
      console.log("direction", direction);
      for (let i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].type === "Mesh") {
          if (this.scene.children[i].geometry.name === "cube") {
            if ((direction === "zClock" || direction === "zAntiClock") && this.scene.children[i].position.z === rotatePosition) {
              cubes.push(this.scene.children[i]);
            } else if ((direction === "yClock" || direction === "yAntiClock") && this.scene.children[i].position.y === rotatePosition) {
              cubes.push(this.scene.children[i]);
            } else if ((direction === "xClock" || direction === "xAntiClock") && this.scene.children[i].position.x === rotatePosition) {
              cubes.push(this.scene.children[i]);
            }
          }
        }
      }
      return cubes;
    },

    //消除浮点数误差
    nearNumber(a) {
      let x = a;
      if (Math.abs(x - 0) < 1e-6) {
        x = 0;
      } else if (Math.abs(x - this.cubeLength) < 1e-6) {
        x = this.cubeLength;
      } else if (Math.abs(x + this.cubeLength) < 1e-6) {
        x = -this.cubeLength;
      }
      return x;
    },

    //绕轴旋转
    rotateAroundWorldY(obj, rad) {
      // console.log("rotateAroundWorldY",obj);
      let x0 = obj.position.x;
      let z0 = obj.position.z;
      let q = new Three.Quaternion();
      q.setFromAxisAngle(new Three.Vector3(0, 1, 0), rad);
      obj.quaternion.premultiply(q);
      obj.position.x = Math.cos(rad) * x0 + Math.sin(rad) * z0;
      obj.position.z = Math.cos(rad) * z0 - Math.sin(rad) * x0;
      obj.position.x = this.nearNumber(obj.position.x);
      obj.position.z = this.nearNumber(obj.position.z);
      // console.log("obj",obj);
    },
    rotateAroundWorldZ(obj, rad) {
      // console.log("rotateAroundWorldZ");
      let x0 = obj.position.x;
      let y0 = obj.position.y;
      let q = new Three.Quaternion();
      q.setFromAxisAngle(new Three.Vector3(0, 0, 1), rad);
      obj.quaternion.premultiply(q);
      obj.position.x = Math.cos(rad) * x0 - Math.sin(rad) * y0;
      obj.position.y = Math.cos(rad) * y0 + Math.sin(rad) * x0;
      obj.position.x = this.nearNumber(obj.position.x);
      obj.position.y = this.nearNumber(obj.position.y);
    },
    rotateAroundWorldX(obj, rad) {
      // console.log("rotateAroundWorldX");
      let y0 = obj.position.y;
      let z0 = obj.position.z;
      let q = new Three.Quaternion();
      q.setFromAxisAngle(new Three.Vector3(1, 0, 0), rad);
      obj.quaternion.premultiply(q);
      obj.position.y = Math.cos(rad) * y0 - Math.sin(rad) * z0;
      obj.position.z = Math.cos(rad) * z0 + Math.sin(rad) * y0;
      obj.position.y = this.nearNumber(obj.position.y);
      obj.position.z = this.nearNumber(obj.position.z);
    },

    //根据要移动的物体和方向转动魔方
    rotateCubes(){
      if (this.direction === "zClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldZ(this.elements[i], -90 * Math.PI / 180);
        }
      } else if (this.direction === "zAntiClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldZ(this.elements[i], 90 * Math.PI / 180);
        }
      } else if (this.direction === "yClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldY(this.elements[i], -90 * Math.PI / 180);
        }
      } else if (this.direction === "yAntiClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldY(this.elements[i], 90 * Math.PI / 180);
        }
      } else if (this.direction === "xClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldX(this.elements[i], 90 * Math.PI / 180);
        }
      } else {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldX(this.elements[i], -90 * Math.PI / 180);
        }
      }
    },

    //渲染动画的函数
    rotateAnimation() {
      // console.log("rotateAnimation",this.elements);
      this.lastStamp = this.currentStamp;
      this.currentStamp = new Date().getTime();
      let totalTime = 300;//转动的总运动时间
      if (this.startStamp == null) {
        this.startStamp = this.currentStamp;
        this.lastStamp = this.currentStamp;
      }
      if (this.currentStamp - this.startStamp >= totalTime) {
        this.currentStamp = this.startStamp + totalTime;
        this.isRotating = false;
      }
      // console.log("startStamp",this.startStamp)
      // console.log("currentStamp",this.currentStamp)
      // console.log("lastStamp",this.lastStamp)
      if (this.direction === "zClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldZ(this.elements[i], -90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      } else if (this.direction === "zAntiClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldZ(this.elements[i], 90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      } else if (this.direction === "yClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldY(this.elements[i], -90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      } else if (this.direction === "yAntiClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldY(this.elements[i], 90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      } else if (this.direction === "xClock") {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldX(this.elements[i], 90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      } else {
        for (let i = 0; i < this.elements.length; i++) {
          this.rotateAroundWorldX(this.elements[i], -90 * Math.PI / 180 * (this.currentStamp - this.lastStamp) / totalTime);
        }
      }
      if (this.currentStamp - this.startStamp >= totalTime) {
        cancelAnimationFrame(this.timeOutID)
        this.isRotateOver = true;
        console.log("cancel", this.currentStamp - this.startStamp, "ms");
      }
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      if (this.currentStamp - this.startStamp < totalTime) {
        //   this.renderer.render(this.scene, this.camera);
        //   setTimeout(function (){
        //     this.rotateAnimation(elements,direction,new Date().getTime(),startStamp,currentStamp);
        //   },20)
        // console.log("continue", this.currentStamp - this.startStamp, "ms");
        requestAnimationFrame(this.rotateAnimation);
      }
      // window.requestAnimationFrame(function(timestamp){
      //   this.rotateAnimation(elements,direction,timestamp,startStamp,currentStamp);
      // });
    },

    //鼠标点击-开始转动
    startCube(event) {
      console.log(event);
      if(event.button === 0 &&!this.isRotating) {
        this.controller.enabled = false; //控制器无法转动
        if (this.isRotateOver) {
          this.direction = null;
          this.elements = null;
          this.lastStamp = null;
          this.currentStamp = null;
          this.startStamp = null;
          this.isRotateOver = false;
        }
        console.log("startCube");
        this.getIntersects(event);
        // console.log(this.intersect);
        if (this.intersect) { // 魔方没有在转动且点击到正确位置
          this.startPoint = this.intersect.point;
          // console.log(this.intersect);
        }
      }
      else{
        this.controller.enabled = true;
      }
    },

    //移动过程中的函数
    moveCube(event) {
      // console.log("moveCube");
      if (this.intersect) {
        // console.log(this.startPoint);
        if (!this.isRotating && this.startPoint) {//魔方没有进行转动且满足进行转动的条件
          this.getIntersects(event);
          this.movePoint = this.intersect.point;
          if (!this.movePoint.equals(this.startPoint)) {//和起始点不一样则意味着可以得到移动向量了
            console.log("rotate");
            this.isRotating = true;//转动标识置为true
            let sub = this.movePoint.sub(this.startPoint);//计算转动向量
            this.direction = this.getDirection(sub);//获得方向
            this.elements = this.getRotateCubes(this.direction, this.intersect);
            // console.log("this.elements[4]",this.elements[4])
            console.log("this.direction",this.direction)
            if(this.isElementsLegal(this.elements)) {
              let moveChar = this.setRealCubeMove(this.elements,this.direction)//移动所代表的的字母
              this.realCube.move(moveChar)
              if(this.isTips) this.handleMove(moveChar)
              this.timeOutID = requestAnimationFrame(this.rotateAnimation);
            }
            else{
              this.isRotateOver = true;
              this.isRotating = false;
            }
          }
        }
      }
    },

    //停止转动函数
    stopCube() {
      console.log("stopCube");
      this.intersect = null;
      this.startPoint = null
      this.controller.enabled = true;
    },

    /**
     * @Description: 判断有没有移动中间块
     * @author Zhao Ziqi
     * @date 2021/12/13
     * @Params this.elements
     * @Return boolean
    */
    isElementsLegal(elements){
      for(let element of elements){
        if(element.name==="14")
          return false
      }
      return true
    },

    /**
     * @Description: 根据移动的元素及方向来设置真实魔方体的移动
     * @author Zhao Ziqi
     * @date 2021/12/13
     * @Params elements
     * @Return null
    */
    setRealCubeMove(elements, direction){
      let moveOrder = ""//移动命令
      for(let element of elements) {
        if (element.name === "5" && direction === "xClock") {//第五个即为中间点
          moveOrder = "L";
        } else if (element.name === "5" && direction === "xAntiClock") {
          moveOrder = "L'";
        } else if (element.name === "23" && direction === "xAntiClock") {
          moveOrder = "R";
        } else if (element.name === "23" && direction === "xClock") {
          moveOrder = "R'";
        } else if (element.name === "17" && direction === "yClock") {
          moveOrder = "U";
        } else if (element.name === "17" && direction === "yAntiClock") {
          moveOrder = "U'";
        } else if (element.name === "11" && direction === "yAntiClock") {
          moveOrder = "D";
        } else if (element.name === "11" && direction === "yClock") {
          moveOrder = "D'";
        } else if (element.name === "15" && direction === "zClock") {
          moveOrder = "F";
        } else if (element.name === "15" && direction === "zAntiClock") {
          moveOrder = "F'";
        } else if (element.name === "13" && direction === "zAntiClock") {
          moveOrder = "B";
        } else if (element.name === "13" && direction === "zClock") {
          moveOrder = "B'";
        }
      }
      if(moveOrder==="") console.log("moveOrder===\"\"",elements,direction)
      return moveOrder
    },

    /**
     * @Description: 求解魔方，解析公式，将180度旋转分为两步，复制到this.cubeSolution
     * @author Zhao Ziqi
     * @date 2021/12/13
     * @Params null
     * @Return null
    */
    getCubeSolution(){
      this.cubeSolution=[];
      let originSolution = this.realCube.solve();
      console.log("originSolution'",originSolution,"'",typeof originSolution);
      let splitSolution = originSolution.trim().split(/\s+/)
      // console.log(splitSolution)
      for(let char of splitSolution){
        if(char.length===1) this.cubeSolution.push(char)
        else if(char[1]==='2'){
          this.cubeSolution.push(char[0])
          this.cubeSolution.push(char[0])
        }
        else this.cubeSolution.push(char)
      }
      console.log(this.cubeSolution)
    },

    //循环渲染
    render() {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render)
    },

    //初始化
    init() {
      this.initRenderer();
      this.initCamera();
      this.initController();
      this.initScreen();
      this.initLight();
      this.initMaterial();
      this.initRaycaster();
      this.initObject();
    },

    /**
     * @Description: 处理鼠标按下事件
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params event
     * @Return null
    */
    handleKeyDown(event){
      if((event.key===this.KEY_CHANGE_ANGLE_UPPER||event.key === this.KEY_CHANGE_ANGLE_LOWER)&&this.firstKeyDown) {//按w切换视角
        console.log(event)
        console.log(this.camera);
        this.camera.position.set(-this.camera.position.x,-this.camera.position.y,-this.camera.position.z);
        this.camera.lookAt(this.camera.up.x,this.camera.up.y,this.camera.up.z);
        this.firstKeyDown=false;
      }
    },

    /**
     * @Description: 处理鼠标弹起事件
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params event
     * @Return null
    */
    handleKeyUp(event){
      if(event.key===this.KEY_CHANGE_ANGLE_UPPER||event.key === this.KEY_CHANGE_ANGLE_LOWER) {//按w切换视角
        console.log(event)
        console.log(this.camera);
        this.camera.position.set(-this.camera.position.x,-this.camera.position.y,-this.camera.position.z);
        this.camera.lookAt(this.camera.up.x,this.camera.up.y,this.camera.up.z);
        this.firstKeyDown=true;
      }
      else if(event.key===this.KEY_SHORTCUT_UPPER||event.key===this.KEY_SHORTCUT_LOWER){
        this.$refs.child.handleShowDrawer()
      }
/*      else if(event.key===this.KEY_ROTATE_X_CLOCK_LOWER||event.key===this.KEY_ROTATE_X_CLOCK_UPPER){
        this.allRotate('xClock');
      }
      else if(event.key===this.KEY_ROTATE_X_CLOCK_ANTI_LOWER||event.key===this.KEY_ROTATE_X_CLOCK_ANTI_UPPER){
        this.allRotate('xAntiClock');
      }
      else if(event.key===this.KEY_ROTATE_Z_CLOCK_LOWER||event.key===this.KEY_ROTATE_Z_CLOCK_UPPER){
        this.allRotate('zClock');
      }
      else if(event.key===this.KEY_ROTATE_Z_CLOCK_ANTI_LOWER||event.key===this.KEY_ROTATE_Z_CLOCK_ANTI_UPPER){
        this.allRotate('zAntiClock');
      }*/
      else if(event.key===this.KEY_CHANGE_VIEW_TO_STANDARD){
        this.camera.position.set(266,207,496);
        this.camera.lookAt(this.camera.up.x,this.camera.up.y,this.camera.up.z);
      }
      else if(event.key===this.KEY_AXES_VISIBLE_UPPER||event.key===this.KEY_AXES_VISIBLE_LOWER){
        for (let i = 0; i < this.scene.children.length; i++) {
          if (this.scene.children[i].type === "AxesHelper") {
            this.scene.children[i].visible=!this.scene.children[i].visible;
          }
        }
      }
      if((event.key===this.KEY_MOVE_CUBE_U_LOWER||event.key===this.KEY_MOVE_CUBE_U_UPPER||
          event.key===this.KEY_MOVE_CUBE_D_LOWER||event.key===this.KEY_MOVE_CUBE_D_UPPER||
          event.key===this.KEY_MOVE_CUBE_F_LOWER||event.key===this.KEY_MOVE_CUBE_F_UPPER||
          event.key===this.KEY_MOVE_CUBE_B_LOWER||event.key===this.KEY_MOVE_CUBE_B_UPPER||
          event.key===this.KEY_MOVE_CUBE_L_LOWER||event.key===this.KEY_MOVE_CUBE_L_UPPER||
          event.key===this.KEY_MOVE_CUBE_R_LOWER||event.key===this.KEY_MOVE_CUBE_R_UPPER)&&this.controlEnable){
        // if(this.isTips){
          if (this.isRotateOver) {
            this.direction = null;
            this.elements = null;
            this.lastStamp = null;
            this.currentStamp = null;
            this.startStamp = null;
            this.isRotateOver = false;
          }
          if(event.altKey===false){
            this.moveCubeByKey(event.key.toLowerCase())
          }
          else{
            let key = event.key.toLowerCase()+'\''
            this.moveCubeByKey(key)
            // console.log(key)
          }
          // console.log("this.moveCubeByKey(event.key.toLowerCase())",event.key.toLowerCase())
          this.stopCube();
        // }
      }
    },

    //执行函数
    run() {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      document.addEventListener('keydown',this.handleKeyDown,false);
      document.addEventListener('keyup',this.handleKeyUp,false);
      if(this.controlEnable) {
        this.renderer.domElement.addEventListener('mousedown', this.startCube, false);
        this.renderer.domElement.addEventListener('mousemove', this.moveCube, false);
        this.renderer.domElement.addEventListener('mouseup', this.stopCube, false);
      }
      requestAnimationFrame(this.run)
    },

    /**
     * @Description: 所有小方块绕轴转动，xClock/xAntiClock/zClock/zAntiClock
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params direction
     * @Return null
    */
    allRotate(direction){
      this.direction = direction;
      let cubes = [];
      for (let i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].type === "Mesh") {
          if (this.scene.children[i].geometry.name === "cube") {
            cubes.push(this.scene.children[i])
          }
        }
      }
      this.elements=cubes;
      this.rotateCubes();
    },

    /**
     * @Description: 随机打乱
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params null
     * @Return null
    */
    getRandomCubes() {
      while(this.randomGenerateTimes<100) {
        let allDirection = ["yClock", "yAntiClock", "xClock", "xAntiClock", "zClock", "zAntiClock"]
        this.direction = allDirection[Math.floor(Math.random() * 6)];//获得方向
        this.elements = this.getRandomRotateCubes(this.direction);
        if(this.isElementsLegal(this.elements)) {
          // console.log(this.setRealCubeMove(this.elements, this.direction))
          this.realCube.move(this.setRealCubeMove(this.elements, this.direction))
          this.rotateCubes();
        }
        this.randomGenerateTimes += 1;
        // console.log("this.direction", this.direction)
        // console.log("this.elements", this.elements);
      }
      this.randomGenerateTimes=0;
    },

    /**
     * @Description: 工具函数
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params arr，value
     * @Return boolean
    */
    isInArray(arr,value){
      for(let i = 0; i < arr.length; i++){
        if(value === arr[i]){
          return true;
        }
      }
      return false;
    },

    /**
     * @Description: 原先整齐排在一起的魔方，重新排好后一定还在一起，检测是否在一起，传入之前在一起的魔方块的id
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params null
     * @Return null
    */
    commitRules(array){
      let positionArray = [];
      for (let i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].type === "Mesh") {
          if (this.scene.children[i].geometry.name === "cube"&&this.isInArray(array,this.scene.children[i].name)) {
            positionArray.push(this.scene.children[i].position);
          }
        }
      }
      let isCommit = true;
      let xCommit = true;
      let yCommit = true;
      let zCommit = true;
      let standardX = positionArray[0].x;
      let standardY = positionArray[0].y;
      let standardZ = positionArray[0].z;
      for(let i =0;i<positionArray.length;i++){
        if(positionArray[i].x!==standardX){
          xCommit=false;
        }
      }
      for(let i =0;i<positionArray.length;i++){
        if(positionArray[i].y!==standardY){
          yCommit=false;
        }
      }
      for(let i =0;i<positionArray.length;i++){
        if(positionArray[i].z!==standardZ){
          zCommit=false;
        }
      }
      isCommit = xCommit || yCommit || zCommit;
      return isCommit;
    },

    /**
     * @Description: 确认魔方有没有拼完
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params null
     * @Return null
    */
    commitCubes(){
      let isCommit = true;
      for(let i =0;i<this.checkCubesRules.length;i++){
        if(!this.commitRules(this.checkCubesRules[i])){
          isCommit=false;
        }
      }
      console.log(isCommit)
      return isCommit;
    },

    /**
     * @Description: 判断魔方一面有没有拼完
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params null
     * @Return null
    */
    commitSingle(){
      let isCommit = false;
      for(let i =0;i<this.checkCubesRules.length;i++){
        console.log("this.commitRules(this.checkCubesRules[i])",this.commitRules(this.checkCubesRules[i]))
        if(this.commitRules(this.checkCubesRules[i])){
          isCommit=true;
        }
      }
      return isCommit;
    },

    //可以操纵
    setControlEnable(){
      this.controlEnable = true;
    },

    /**
     * @Description: 不能操纵
     * @author Zhao Ziqi
     * @date 2021/12/15
     * @Params null
     * @Return null
    */
    cancelControlEnable(){
      this.controlEnable = false;
      this.renderer.domElement.removeEventListener('mousedown', this.startCube, false);
      this.renderer.domElement.removeEventListener('mousemove', this.moveCube, false);
      this.renderer.domElement.removeEventListener('mouseup', this.stopCube, false);
      // this.getCubeSolution()
      // console.log("this.camera.position",this.camera)
      // this.initController();
    },

    /**
     * @Description: 开启提示
     * @author Zhao Ziqi
     * @date 2021/12/13
     * @Params
     * @Return
    */
    handleGetTips(){
      this.isTips=true
      //移动视角
      this.camera.position.set(266,207,496);
      this.camera.lookAt(this.camera.up.x,this.camera.up.y,this.camera.up.z);
      //求解算法
      this.getCubeSolution()
      this.totalSteps=this.cubeSolution.length;
      this.currentSteps=0
      //弹出提示
      this.$notify({
        title: '开启提示',
        dangerouslyUseHTMLString: true,
        message: '从当前状态复原共需要<strong>'+this.cubeSolution.length+'</strong>步，为了方便您的操作，请保持视角在此状态，或按键<strong>\'1\'</strong>回到此视角状态',
        duration: 3000,
        offset: 80,
        type: 'success'
      });
      //更新图片显示路径
      this.getImgSrc()
    },

    /**
     * @Description: 关闭提示
     * @author Zhao Ziqi
     * @date 2021/12/13
     * @Params
     * @Return
    */
    handleCancelTips(){
      this.isTips=false
      this.$notify({
        title: '关闭提示',
        message: '提示已关闭，你可以通过点击左上角的按钮重新打开',
        duration: 3000,
        type: 'success',
        offset: 80,
      });
    },

    /**
     * @Description: 判断本次移动是否符合提示的规则并作出相应的处理
     * @author Zhao Ziqi
     * @date 2021/12/14
     * @Params 本次移动所代表的字母
     * @Return null
    */
    handleMove(move){
      console.log("handleMove")
      if(move===this.cubeSolution[this.currentSteps]){//符合移动
        this.currentSteps+=1
      }
      else{//重新进行提示
        this.$notify.error({
          title: '移动错误',
          dangerouslyUseHTMLString: true,
          message: '已为您重新规划移动方式',
          duration: 3000,
          offset: 80,
        });
        this.getCubeSolution()
        this.totalSteps=this.cubeSolution.length;
        this.currentSteps=0
      }
      if(this.currentSteps===this.totalSteps){
        this.$notify({
          title: '完成',
          dangerouslyUseHTMLString: true,
          message: '魔方已经复原，现在关闭提示',
          duration: 5000,
          type:"success",
          offset: 80,
        });
        this.$refs.child.cancelTips()
      }
      else this.getImgSrc()
    },

    //获得提示图片的图片路径
    getImgSrc(){
      this.imgUrl=require("@/assets/picture/"+this.cubeSolution[this.currentSteps]+".png")
    },

    /**
     * @Description: 通过按键来控制魔方的移动
     * @author Zhao Ziqi
     * @date 2021/12/14
     * @Params key[u('),d('),l('),r('),b('),f('),]
     * @Return null
    */
    moveCubeByKey(key){
      console.log(key)
      this.isRotating = true;//转动标识置为true
      this.setOptionsByKey(key)
      let moveChar = this.setRealCubeMove(this.elements,this.direction)//移动所代表的的字母
      this.realCube.move(moveChar)
      if(this.isTips) this.handleMove(moveChar)
      this.timeOutID = requestAnimationFrame(this.rotateAnimation);
      this.isRotateOver = true;
      this.isRotating = false;
    },

    /**
     * @Description: 根据按键来设置旋转的物体与方向
     * @author Zhao Ziqi
     * @date 2021/12/14
     * @Params
     * @Return
    */
    setOptionsByKey(key) {
      let elementsName = "";//中心块名字
      let cube = null;
      /*[["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        ["1", "2", "3", "10", "11", "12", "19", "20", "21"],
        ["1", "4", "7", "10", "13", "16", "19", "22", "25"],
        ["7", "8", "9", "16", "17", "18", "25", "26", "27"],
        ["3", "6", "9", "12", "15", "18", "21", "24", "27"],
        ["19", "20", "21", "22", "23", "24", "25", "26", "27"]], // 记录最开始魔方是如何排列的*/
      if (key[0] === 'u') {
        elementsName = "17";
        if (key.length === 1) this.direction = "yClock"
        else this.direction = "yAntiClock"
      }
      else if (key[0] === 'd') {
        elementsName = "11"
        if (key.length === 1) this.direction = "yAntiClock"
        else this.direction = "yClock"
      }
      else if (key[0] === 'l') {
        elementsName = "5"
        if (key.length === 1) this.direction = "xClock"
        else this.direction = "xAntiClock"
      }
      else if (key[0] === 'r') {
        elementsName = "23"
        if (key.length === 1) this.direction = "xAntiClock"
        else this.direction = "xClock"
      }
      else if (key[0] === 'f') {
        elementsName = "15"
        if (key.length === 1) this.direction = "zClock"
        else this.direction = "zAntiClock"
      }
      else {
        elementsName = "13"
        if (key.length === 1) this.direction = "zAntiClock"
        else this.direction = "zClock"
      }
      cube=this.findElementsByName(elementsName);
      this.elements = this.getRotateCubesByKey(cube)
      console.log("this.elements = cubes;",this.elements)
    },

    /**
     * @Description: 根据name从this.elements找到elements
     * @author Zhao Ziqi
     * @date 2021/12/14
     * @Params
     * @Return element/null
     */
    findElementsByName(name){
      for (let i = 0; i < this.scene.children.length; i++)
        if (this.scene.children[i].type === "Mesh")
          if (this.scene.children[i].geometry.name === "cube")
            if(this.scene.children[i].name===name){
              console.log(this.scene.children[i])
              return this.scene.children[i]
            }
    },

    /**
     * @Description: 字母旋转时获得旋转的方块
     * @author Zhao Ziqi
     * @date 2021/12/14
     * @Params cube 中心块Mesh对象
     * @Return cubes
    */
    getRotateCubesByKey(cube) {
      let cubes = [];
      for (let i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].type === "Mesh") {
          if (this.scene.children[i].geometry.name === "cube") {
            if ((this.direction === "zClock"|| this.direction === "zAntiClock") && this.scene.children[i].position.z === cube.position.z) {
              cubes.push(this.scene.children[i]);
            } else if ((this.direction === "yClock" || this.direction === "yAntiClock") && this.scene.children[i].position.y === cube.position.y) {
              cubes.push(this.scene.children[i]);
            } else if ((this.direction === "xClock" || this.direction === "xAntiClock") && this.scene.children[i].position.x === cube.position.x) {
              cubes.push(this.scene.children[i]);
            }
          }
        }
      }
      return cubes;
    },



  },

  mounted() {
    this.initRealCube();
    this.init();
    this.getRandomCubes();
    this.run();
  },
};

</script>

<style scoped>
#container {
  height: 700px;
  width: 1100px;
  border-style: solid;
  border-width: 1px 1px 1px 1px;
  margin: 0 auto;
}
.background {
  background-size: cover;
  width: 100%;
  height: 100%;
  background: aliceblue;
  position: fixed;
}
.tips{
  height: 350px;
  width: 300px;
  position: absolute;
  top: 40%;
  right: 10px;
  background: white;
  border-style: solid;
  border-width: 1px;
}
.steps{
  text-align: left;
  color: black;
  font-family: ShiGuang,serif;
  display: inline-block;
  height: 50px;
}
.nextStep{
  text-align: left;
  font-size: 30px;
  color: black;
  font-family: Speedline,serif;
}
.stepChar{
  text-align: left;
  font-size: 60px;
  font-weight: bolder;
  color: red;
  font-family: Speedline,serif;
}
.imgBox{
  width: 200px;
  height: 140px;
  margin: 0 auto;
}
.sideBar{
  margin-top: 200px;
  margin-left: 20px;
}
</style>
