import * as THREE from "three";
import $ from "jquery";

import {noise} from "./noise.js";

import "../less/app.less";

window.debounce = function (fn, delay) {
    var timer = null;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

"use strict";

function Ocean() {
    this.initOffset();

    setTimeout(this.initialize.bind(this), 10);
}

Ocean.prototype.initialize = function () {
    this.config = {
        width: window.innerWidth,
        height: window.innerHeight,
        worldWidth: 200,
        worldHeight: 250,
        viewAngle: 45,
        aspectRatio: window.innerWidth / window.innerHeight,
        near: 0.000001,
        far: 2000,
        container: document.getElementById('background2'),
        scroll_container: document.getElementById("scroll_container"),
        measure: document.getElementById("measure"),
        maxWaveTop: 0,
        maxWaveBot: 3,
        maxVelocity: 0.02,
        waveSpeed: 0.001,
        lightPowerFrontRight: 2.6,
        lightPowerFrontLeft: 1.8,
        wireFrame: false,
        fps: 24,
        paused: !window.chrome,
        is_canvas: false,
        scrollTop: 7
    }

    this.initPlayback();
    this.detectWebGL();

    // Init generals
    this.initScene();
    this.initCamera();
    this.initLighting();

    // Create objects
    this.initSprites();
    this.createOceanPlane();
    this.initWaves();
    this.permuteWaves();
    this.createOceanFarPlane();
    //this.drawStars();

    this._last_render = performance.now();

    var render = debounce(function () {
       // this.drawStars();
        this.needs_update = true;
    }.bind(this), 100);

    window.onresize = function () {
        this.initOffset();
     //   var offset = (window.innerHeight + 533.5555555440001) / 46.44444444444444;
        //this.camera.position.z = Math.floor(this.config.worldHeight / 2) + offset;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.updateProjectionMatrix();
        render();
    }.bind(this);

    var play = document.getElementById("icons");
    var rx = document.getElementById("scroll_container");
    var measure = document.getElementById("measure")

    document.getElementById("scroll_container").onscroll = () => {
        this.needs_update = true;
      //  play.style.top = Math.min(rx.scrollTop + window.innerHeight - 60, measure.offsetHeight + measure.offsetTop) + "px";
    };

    this.renderFrame();

}

Ocean.prototype.drawOceanTexture = function () {
    var canvas = document.createElement("canvas");

    var size = 14;
    var text = "Hello, World!"
    var backgroundMargin = 100
    var backGroundColor = "#ff0000"
    var color = "#00ff00"

    var context = canvas.getContext("2d");
    var textWidth = context.measureText(text).width;

    canvas.width = 500;
    canvas.height = 500;

    context.fillStyle = "#467378";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //  for (var i = 0; i < numStars; i ++) {

    //     var height  = Math.random() * window.innerHeight / 2
    //     var size    = Math.random() > 0.9 ? (Math.random() > 0.7 ? 3 : 2) : 1;
    //     var opacity = 1 - Math.min(1, Math.sqrt((height * 1.1) / (window.innerHeight / 2)))

    //     context.fillStyle = "rgba(255,255,255," + opacity + ")";
    //     context.fillRect(Math.random() * window.innerWidth, height, size, size);
    // }

    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            var large = Math.abs(noise(i * 1 / 10, j * 1 / 10, 1));
            context.fillStyle = "rgba(255,255,255," + large + ")";
            context.fillRect(i, j, 1, 1);
        }
    }

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    return texture;
}

Ocean.prototype.drawStars = function () {

    //Math.seedrandom("skyline")

    var ctx = document.getElementById("stars").getContext("2d");

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight / 2;

    // var numStars = window.innerWidth * (window.innerHeight / 2) * (1 / 300);

    // for (var i = 0; i < numStars; i ++) {

    //     var height  = Math.random() * window.innerHeight / 2
    //     var size    = Math.random() > 0.9 ? (Math.random() > 0.7 ? 3 : 2) : 1;
    //     var opacity = 1 - Math.min(1, Math.sqrt((height * 1.1) / (window.innerHeight / 2)))

    //     ctx.fillStyle = "rgba(255,255,255," + opacity + ")";
    //     ctx.fillRect(Math.random() * window.innerWidth, height, size, size);
    // }


    var data = [];

    for (var x = 0; x < ctx.canvas.width + 50; x += 10) {
        data[x / 10] = [];
        for (var y = -100; y < ctx.canvas.height + 50; y += 50) {
            var variance = (x - (window.innerWidth / 2)) * (19 * ((window.innerHeight / 2) - y) / (window.innerHeight / 2));
            data[x / 10][y / 50] = [x + (Math.random() * 20) - 10 + variance, y + (Math.random() * 80) - 40];
        }
    }

    for (var x = 0; x < data.length - 1; x++) {
        for (var y = 0; y < data[x].length - 1; y++) {
            ctx.fillStyle = "rgba(255,255,255," + (Math.random() * 0.2 * (1 - ((y * 50 + 30) / (window.innerHeight / 2)))) + ")";
            ctx.beginPath();
            ctx.moveTo(data[x][y][0], data[x][y][1]);
            ctx.lineTo(data[x + 1][y][0], data[x + 1][y][1]);
            ctx.lineTo(data[x + 1][y + 1][0], data[x + 1][y + 1][1]);
            ctx.lineTo(data[x][y + 1][0], data[x][y + 1][1]);
            ctx.lineTo(data[x][y][0], data[x][y][1]);
            ctx.closePath();
            ctx.fill();

            // ctx.fillRect(data[x][y][0], data[x][y][1], data[x + 1][y][0] - data[x][y][0], data[x][y + 1][1] - data[x][y][1]);
        }
    }
}

Ocean.prototype.initPlayback = function () {
    this.elem = $("#play");
    this.config.paused = !this.config.paused;
    this.needs_update = true;
    this.elem.click(function () {
        if (this.config.paused) {
            this.elem.removeClass("icon-play");
            this.elem.addClass("icon-pause");
            this.config.paused = false;
        } else {
            this.elem.removeClass("icon-pause");
            this.elem.addClass("icon-play");
            this.config.paused = true;
        }
    }.bind(this));
    this.elem.click();
}

Ocean.prototype.initOffset = function () {
    //       $("#title").css({"padding-top": window.innerHeight / 2 - 32})

}

Ocean.prototype.setCanvas = function () {
    try {
        this.renderer = new THREE.CanvasRenderer();
        $("body").append("<div class='alert'>" +
            "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
            "<strong>Your browser does not support WebGL!</strong> You'll need this for an <a href='http://get.webgl.org/'>optimal experience</a>" +
            "</div>");

        //   this.config.worldHeight = 200;
        // this.config.worldWidth = 200;
        // this.config.fps = 24;

        this.elem.removeClass("icon-pause");
        this.elem.addClass("icon-play");

        this.config.paused = true;
        this.config.is_canvas = true;
        this.needs_update = true;
    } catch (e) {
        $("body").append("<div class='alert'>" +
            "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
            "<strong>Your browser does not support Canvas!</strong> Please <a href='http://get.webgl.org/'>upgrade</a> your browser </a>" +
            "</div>");
    }
}

Ocean.prototype.detectWebGL = function () {
    if (!window.WebGLRenderingContext)
        this.setCanvas();
    try {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    } catch (e) {
        this.setCanvas();
    }
}

Ocean.prototype.initScene = function () {
    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x061D36, 0.008);
    this.scene2.fog = new THREE.FogExp2(0x000000, 0.008);

    this.renderer.setSize(this.config.width, this.config.height);
    this.config.container.appendChild(this.renderer.domElement);
}

Ocean.prototype.initSprites = function () {
                // var material = new THREE.SpriteMaterial( {
                //     map: new THREE.Texture( generateSprite() ),
                //     blending: THREE.AdditiveBlending
                // } );

    // create the particle variables
    let texture = new THREE.Texture( generateSprite() );
    texture.needsUpdate = true;
    var particleCount = 2000,
        particles = new THREE.Geometry(),
        pMaterial = new THREE.ParticleBasicMaterial({
          color: 0xFFFFFF,
          map: texture,
          size: 3,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
    pMaterial.depthWrite = false;

    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

      // create a particle with random
      // position values, -250 -> 250
      var randomX = Math.random(),
          pX = Math.random() * this.config.worldWidth - (this.config.worldWidth / 2),
          pY = randomX * randomX *  randomX * randomX * randomX * randomX * 50 - 50,
          pZ = Math.random() * (this.config.worldHeight / 2),
          particle = new THREE.Vector3(pX, pY, pZ)

      // add it to the geometry
      particles.vertices.push(particle);
    }

    // create the particle system
    var particleSystem = new THREE.ParticleSystem(
        particles,
        pMaterial);
    this.sprites = particleSystem;
    this.sprites.sortParticles = true;

    // add it to the scene
    this.scene2.add(particleSystem);
}






     
            function generateSprite() {
                var canvas = window._canvas = document.createElement( 'canvas' );
                canvas.width = 16;
                canvas.height = 16;
                var context = canvas.getContext( '2d' );
                var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
                gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
                gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
                gradient.addColorStop( 0.4, 'rgba(0,0,64,0.5)' );
                gradient.addColorStop( 1, 'rgba(0,0,0,0)' );
                context.fillStyle = gradient;
                context.fillRect( 0, 0, canvas.width, canvas.height );
                return canvas;
            }

Ocean.prototype.initCamera = function () {
    this.camera = new THREE.PerspectiveCamera(
        this.config.viewAngle,
        this.config.aspectRatio,
        this.config.near,
        this.config.far
    );

    this.camera.position.x = 0;
  //  this.camera.position.y = 16;
   // var offset = (window.innerHeight + 533.5555555440001) / 46.44444444444444;
    let offset = this.config.aspectRatio 

    //45 = 2 * Math.atan( 32 / ( 2 * dist ) ) * ( 180 / Math.PI )
    var rx = this.config.scroll_container.scrollTop;
    var blockHeight = this.config.measure.offsetHeight;

    let height = this.config.scrollTop + 2.5; //(this.config.scrollTop - (rx / blockHeight) * this.config.scrollTop) * 2;
    var dist = ((height * 2) / Math.tan((this.config.viewAngle / 2) / (180 / Math.PI))) / 2;


    this.camera.position.z = Math.floor(this.config.worldHeight / 2) + dist;
}

Ocean.prototype.initLighting = function () {
    this.directionalLightFrontRight = new THREE.DirectionalLight(0x061D36 /*0xfef4d1*/ , this.config.lightPowerFrontRight);
    this.directionalLightFrontRight.position.set(80, 40, 40);
    this.directionalLightFrontRight.castShadow = false;
    this.scene.add(this.directionalLightFrontRight);

    this.directionalLightFrontLeft = new THREE.DirectionalLight(0xfef4d1, this.config.lightPowerFrontLeft);
    this.directionalLightFrontLeft.position.set(-80, 20, 50);
    this.directionalLightFrontLeft.castShadow = false;
    this.scene.add(this.directionalLightFrontLeft);

    this.directionalBottom = new THREE.DirectionalLight(0xfef4d1 /*0xfef4d1*/ , this.config.lightPowerFrontRight);
    this.directionalBottom.position.set(0, -40, 0);
    this.directionalBottom.castShadow = false;
    this.scene.add(this.directionalBottom);

    this.directionalLightFrontRight.intensity = this.config.lightPowerFrontRight;
    this.directionalLightFrontLeft.intensity = this.config.lightPowerFrontLeft;

    this.ambientLight = new THREE.AmbientLight(0x000044);
}

Ocean.prototype.createOceanPlane = function () {
    this.oceanPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(this.config.worldWidth, this.config.worldHeight, this.config.worldWidth / 4, this.config.worldHeight / 8),
        new THREE.MeshLambertMaterial({
            wireframe: this.config.wireFrame,
            color: 0x467378, //0x11b6e5,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        })
    );

   // THREE.GeometryUtils.triangulateQuads(this.oceanPlane.geometry);

    this.oceanPlane.dynamic = true;
    this.oceanPlane.rotation.x = -(Math.PI / 2);

    for (var i = 0; i < this.oceanPlane.geometry.vertices.length; i++) {
        if (this.oceanPlane.geometry.vertices[i].y > (0 - (this.config.worldHeight / 2))) {

            this.oceanPlane.geometry.vertices[i].x =
                (this.oceanPlane.geometry.vertices[i].x + Math.random() * 5) - 2.5;

            this.oceanPlane.geometry.vertices[i].y =
                (this.oceanPlane.geometry.vertices[i].y + Math.random() * 5) - 2.5; 
        } else {
            this.oceanPlane.geometry.vertices[i].z = 2.5;
        }
    }

    this.oceanPlane.geometry.computeVertexNormals();

    this.scene.add(this.oceanPlane);
}

Ocean.prototype.createOceanFarPlane = function () {
    this.oceanFarPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(this.config.worldWidth * 2, 50, 1, 1),
        new THREE.ShaderMaterial({
            uniforms:{
              "color1" : {
                type : "c",
                value : new THREE.Color(0x467378)
              },
              "color2" : {
                type : "c",
                value : new THREE.Color(0x000000)
              },
            },
            transparent: true,
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
            `,
                        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            void main() {
                float stretch = min(1.0, (1.0 - pow(vUv.y, 2.0)) * 2.5);
                float stretch2 = min(1.0, (1.0 - pow(vUv.y, 4.0)) * 3.0);
                gl_FragColor = vec4(mix(color1, color2, stretch2), stretch * 0.3 + 0.65);
            }`
        })
        // new THREE.MeshBasicMaterial({
        //     wireframe: this.config.wireFrame,
        //     color: 0x467378,
        //     shading: THREE.FlatShading,
        //     transparent: true,
        //     opacity:0.7
        // })
    );

    //this.oceanFarPlane.rotation.x = (Math.PI / 2); // - 0.0005;
    //this.oceanFarPlane.position.x = 0;
    this.oceanFarPlane.position.y = -25 + 2.5;
    this.oceanFarPlane.position.z = Math.ceil(this.config.worldHeight / 2) + 6;

    this.scene.add(this.oceanFarPlane);

    this.oceanNearPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(10000000, this.config.worldHeight + 1000000, 1, 1),
        new THREE.MeshLambertMaterial({
            wireframe: this.config.wireFrame,
            color: 0x467378,
            shading: THREE.FlatShading,
          //  transparent: true,
         //   opacity:0.7
        })
    );

    this.oceanNearPlane.rotation.x = (Math.PI / 2);

    //this.oceanFarPlane.rotation.x = (Math.PI / 2); // - 0.0005;
    //this.oceanNearPlane.position.x = 0;
    this.oceanNearPlane.position.y = 2.5;
    //this.oceanNearPlane.position.
    this.oceanNearPlane.position.z = 6 - (1000000 / 2); //-(this.config.worldHeight / 2);

    this.scene.add(this.oceanNearPlane);

}

var inc = 0;
var large_freq = 1 / 50;
var small_freq = 1 / 2;
var z = 0;

var waveDatas = [];

Ocean.prototype.initWaves = function () {
    for (var z = 0; z < 500; z++) {
        var vertex, waveData = [];
        for (var i = 0; i < this.oceanPlane.geometry.vertices.length - this.config.worldWidth / 4; i++) {
            vertex = this.oceanPlane.geometry.vertices[i];
            if (vertex.y > (0 - (this.config.worldHeight / 2))) {
                var small = Math.abs(noise(vertex.x * small_freq, vertex.y * small_freq, z / 500)) * 3;
                waveData.push(small);
            }
        }
        waveDatas.push(waveData);
    }
}


Ocean.prototype.permuteWaves = function () {
    var speed = 1000 / this.config.fps / 16666.666666666664;

    var vertex;
    z += speed; //0.001;
    var zz = Math.abs(Math.floor(z * 1000) % (waveDatas.length * 2) - waveDatas.length);
    var maxVert = this.oceanPlane.geometry.vertices.length - (this.config.worldWidth / 4);
    inc = 0;

    for (var i = 0; i < maxVert; i++) {
        vertex = this.oceanPlane.geometry.vertices[i];
        var large = Math.abs(noise(vertex.x * large_freq, vertex.y * large_freq, z)) * 13;
        //var small = Math.abs(noise(vertex.x * small_freq,vertex.y * small_freq, z * 2)) * 3;
        // vertex.z = large; // + small;
        vertex.z = large + waveDatas[zz][i] - 1;
    }

    this.oceanPlane.geometry.verticesNeedUpdate = true;
    this.oceanPlane.geometry.normalsNeedUpdate = true;

    this.oceanPlane.geometry.computeFaceNormals();
}


Ocean.prototype.renderFrame = function () {

    window.requestAnimationFrame(function () {
        this.renderFrame();
    }.bind(this));

    if (/* !this.needs_update && */ (performance.now() - this._last_render) <= 1000 / this.config.fps) {
        return;
    }
    this._last_render = performance.now();
    

    let rx = this.config.scroll_container.scrollTop;
    let blockHeight = (window.innerHeight / 2);

    let should_render = !this.config.paused || this.needs_update;

    if (should_render) {
        if (!this.needs_update) {
            this.permuteWaves();
        }
        this.renderer.autoClear = false;
        this.camera.position.y = (this.config.scrollTop - (rx / blockHeight) * this.config.scrollTop) + 2.5;
        this.sprites.material.opacity = Math.min(1, Math.abs(Math.min(this.camera.position.y + 20, 0)) / 20);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.renderer.clear(false, true, false);
       // this.renderer.clearDepth();
        this.renderer.render(this.scene2, this.camera);
    }

    this.needs_update = false;
}

window.addEventListener('load', function () {
    new Ocean();
})



