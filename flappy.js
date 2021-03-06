
var

    canvas,
    ctx,
    width,
    height,

    scrollTextPos = 0,
    fgpos = 0,
    frames = 0,
    score = 0,
    pipeGapMin = 90,
    pipeGapMax = 150,
    pipeGap = pipeGapMax,
    best = localStorage.getItem("best") || 0,


    currentstate,
    states = {
        Splash: 0, Game: 1, Score: 2
    },


    okbtn,


    sharebtn,

    bird = {

        x: 70,
        y: 0,

        frame: 0,
        velocity: 0,
        animation: [0, 1, 2, 1],

        rotation: 0,
        radius: 12,

        gravity: 0.3,
        _jump: 5,


        jump: function() {
            this.velocity = -this._jump;
        },


        update: function() {

            var n = currentstate === states.Splash ? 10 : 4;
            this.frame += frames % n === 0 ? 1 : 0;
            this.frame %= this.animation.length;


            if (currentstate === states.Splash) {
                this.y = height - 222 + 5*Math.cos(frames/5);
                this.rotation = 0;
            } else { // game and score state

                this.velocity += this.gravity;
                this.y += this.velocity;


                if (this.y >= height - s_fg.height-8) {
                    this.y = height - s_fg.height-8;
                    if (currentstate === states.Game) {
                        currentstate = states.Score;
                    }

                    this.velocity = this._jump;
                }

                              if (this.velocity >= this._jump) {
                    this.frame = 1;
                    this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);
                } else {
                    this.rotation = -0.3;
                }
            }
        },


        draw: function(ctx) {
            ctx.save();

            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            var n = this.animation[this.frame];

            s_bird[n].draw(ctx, -s_bird[n].width/2, -s_bird[n].height/2);

            ctx.restore();
        }
    },

     pipes = {
        _pipes: [],

        reset: function() {
            this._pipes = [];
            pipeGap = pipeGapMax;
        },


        update: function() {

            if (frames % 150 === 0) {

                var _y = height - (s_pipeSouth.height+s_fg.height+120+200*Math.random());


                if (pipeGap > pipeGapMin) {
                    pipeGap = pipeGap -5;
                }

                this._pipes.push({
                    gap: pipeGap,
                    x: 500,
                    y: _y,
                    width: s_pipeSouth.width,
                    height: s_pipeSouth.height
                });
            }
            for (var i = 0, len = this._pipes.length; i < len; i++) {
                var p = this._pipes[i];

                if (i === 0) {

                    if ((p.x == bird.x) && (bird.y < 30) ){
                        currentstate = states.Score;
                        score--;
                    }

                    score += p.x === bird.x ? 1 : 0;


                    var cx  = Math.min(Math.max(bird.x, p.x), p.x+p.width);
                    var cy1 = Math.min(Math.max(bird.y, p.y), p.y+p.height);
                    var cy2 = Math.min(Math.max(bird.y, p.y+p.height+p.gap), p.y+2*p.height+p.gap);


                    var dx  = bird.x - cx;
                    var dy1 = bird.y - cy1;
                    var dy2 = bird.y - cy2;


                    var d1 = dx*dx + dy1*dy1;
                    var d2 = dx*dx + dy2*dy2;
                    var r = bird.radius*bird.radius;

                    if (r > d1 || r > d2) {
                        currentstate = states.Score;
                    }
                }

                p.x -= 2;
                if (p.x < -p.width) {
                    this._pipes.splice(i, 1);
                    i--;
                    len--;
                }
            }
        },


        draw: function(ctx) {
            for (var i = 0, len = this._pipes.length; i < len; i++) {
                var p = this._pipes[i];
                s_pipeSouth.draw(ctx, p.x, p.y);
                s_pipeNorth.draw(ctx, p.x, p.y+p.gap+p.height);

            }
        }
    },
    foregroundFx = {
        _flakes: [],
        _flakeTimer: null,
        _maxFlakes: 10,
        init: function() {
            this._flakeTimer = setInterval(this.addFlake(this._maxFlakes), 500);
        },
        addFlake: function(maxFlakes) {
                this._flakes.push({
                id: this._flakes.length + 1,
                x: Math.round(Math.random() * width),
                y: -10,
                drift: Math.random(),
                speed: Math.round(Math.random() * 5) + 1,
                size: (Math.random() * 3) + 2
            });

        },
        reset: function() {
            this._flakes = [];
        },
        update: function() {

            for (var i = 0; i < this._flakes.length; i++) {
                if (this._flakes[i].y < ctx.canvas.height) {
                    this._flakes[i].y += this._flakes[i].speed;
                    if (this._flakes[i].y > ctx.canvas.height)
                        this._flakes[i].y = -5;
                    this._flakes[i].x += this._flakes[i].drift;
                    if (this._flakes[i].x > ctx.canvas.width)
                        this._flakes[i].x = 0;
                }

            }

        }
    },
    backgroundFx = {
        setBGGradient: function(hour, minute) {
            var grd = ctx.createLinearGradient(0, canvas.width/2, 0, canvas.width);
            switch (hour) {
                case 0:
                    grd.addColorStop(0, '#000000');
                    grd.addColorStop(1, '#303030');
                    break;
                case 1:
                    grd.addColorStop(0.85, '#020111');
                    grd.addColorStop(1, '#191621');
                    break;
                case 2:
                    grd.addColorStop(0.6, '#020111');
                    grd.addColorStop(1, '#20202c');
                    break;
                case 3:
                    grd.addColorStop(0.1, '#020111');
                    grd.addColorStop(1, '#3a3a52');
                    break;
                case 4:
                    grd.addColorStop(0, '#20202c');
                    grd.addColorStop(1, '#515175');
                    break;
                case 5:
                    grd.addColorStop(0, '#40405c');
                    grd.addColorStop(0.8, '#6f71aa');
                    grd.addColorStop(1, '#8a76ab');
                    break;
                case 6:
                    grd.addColorStop(0, '#4a4969');
                    grd.addColorStop(0.5, '#7072ab');
                    grd.addColorStop(1, '#cd82a0');
                    break;
                case 7:
                    grd.addColorStop(0, '#757abf');
                    grd.addColorStop(0.6, '#8583be');
                    grd.addColorStop(1, '#eab0d1');
                    break;
                case 8:
                    grd.addColorStop(0, '#82addb');
                    grd.addColorStop(1, '#ebb2b1');
                    break;
                case 9:
                    grd.addColorStop(0.01, '#94c5f8');
                    grd.addColorStop(0.7, '#a6e6ff');
                    grd.addColorStop(1, '#b1b5ea');
                    break;
                case 10:
                    grd.addColorStop(0, '#b7eaff');
                    grd.addColorStop(1, '#94dfff');
                    break;
                case 11:
                    grd.addColorStop(0, '#9be2fe');
                    grd.addColorStop(1, '#67d1fb');
                    break;
                case 12:
                    grd.addColorStop(0, '#90dffe');
                    grd.addColorStop(1, '#38a3d1');
                    break;
                case 13:
                    grd.addColorStop(0, '#57c1eb');
                    grd.addColorStop(1, '#246fa8');
                    break;
                case 14:
                    grd.addColorStop(0, '#2d91c2');
                    grd.addColorStop(1, '#1e528e');
                    break;
                case 15:
                    grd.addColorStop(0, '#2473ab');
                    grd.addColorStop(0.7, '#1e528e');
                    grd.addColorStop(1, '#5b7983');
                    break;
                case 16:
                    grd.addColorStop(0, '#1e528e');
                    grd.addColorStop(0.5, '#265889');
                    grd.addColorStop(1, '#9da671');
                    break;
                case 17:
                    grd.addColorStop(0, '#1e528e');
                    grd.addColorStop(0.5, '#728a7c');
                    grd.addColorStop(1, '#e9ce5d');
                    break;
                case 18:
                    grd.addColorStop(0, '#154277');
                    grd.addColorStop(0.30, '#576e71');
                    grd.addColorStop(0.7, '#e1c45e');
                    grd.addColorStop(1, '#b26339');
                    break;
                case 19:
                    grd.addColorStop(0, '#163C52');
                    grd.addColorStop(0.3, '#4F4F47');
                    grd.addColorStop(0.6, '#C5752D');
                    grd.addColorStop(0.8, '#B7490F');
                    grd.addColorStop(1, '#2F1107');
                    break;
                case 20:
                    grd.addColorStop(0.3, '#071B26');
                    grd.addColorStop(0.8, '#8A3B12');
                    grd.addColorStop(1, '#240E03');
                    break;
                case 21:
                    grd.addColorStop(0.3, '#010A10');
                    grd.addColorStop(0.8, '#59230B');
                    grd.addColorStop(1, '#2F1107');
                    break;
                case 22:
                    grd.addColorStop(0.5, '#090401');
                    grd.addColorStop(1, '#4B1D06');
                    break;
                case 23:
                    grd.addColorStop(0.8, '#00000c');
                    grd.addColorStop(1, '#150800');
                    break;
                default:
                    grd.addColorStop(0, '#8ED6FF');
                    grd.addColorStop(1, '#004CB3');
                    break;
            }

            ctx.fillStyle = grd;
            ctx.fill();
        },
        update: function() {
            if (frames % 60 === 0) {
                var date = new Date;
                var hour = date.getHours();
                this.setBGGradient(hour);
            }
        }
    };


function onpress(evt) {

    switch (currentstate) {


        case states.Splash:
            currentstate = states.Game;
            bird.jump();
            break;


        case states.Game:
            bird.jump();
            break;


        case states.Score:


            var mx = evt.offsetX, my = evt.offsetY;

            if (mx == null || my == null) {
                mx = evt.touches[0].clientX;
                my = evt.touches[0].clientY;
            }


            if (sharebtn.x < mx && mx < sharebtn.x + sharebtn.width && sharebtn.y < my && my < sharebtn.y + sharebtn.height) {
                //location.hash='share'
                window.open('http://twitter.com/share?url=' + homeUrl + '&text=I scored ' + score +  ' on FlappyJS!!&hashtags=flappybird,flappy')
            }
            else {
// 			// check if within
                //	if (okbtn.x < mx && mx < okbtn.x + okbtn.width &&	okbtn.y < my && my < okbtn.y + okbtn.height) {
                pipes.reset();
                currentstate = states.Splash;
                score = 0;
                //location.hash='game'
                //		}
            }
            break;

    }
    evt.preventDefault();
}

/**
 * Starts and initiate the game
 */
function main() {
    // create canvas and set width/height
    canvas = document.createElement("canvas");

    width = window.innerWidth;
    height = window.innerHeight;

    //var evt = "touchStart";
    if (width >= 500) {
        width  = 320;
        height = 480;
        canvas.style.border = "1px solid #000";
        //evt = "mousedown";
    }

    // listen for input event
    //document.addEventListener(evt, onpress);
    document.addEventListener("touchstart", onpress)
    document.addEventListener("mousedown", onpress)

    canvas.width = width;
    canvas.height = height;
    scrollTextPos = width*1.5;
    if (!(!!canvas.getContext && canvas.getContext("2d"))) {
        alert("Your browser doesn't support HTML5, please update to latest version");
    }
    ctx = canvas.getContext("2d");

    currentstate = states.Splash;
    // append canvas to document
    document.body.appendChild(canvas);

    // initate graphics and buttons
    var img = new Image();
    img.onload = function() {
        initSprites(this);

        //backgroundFx.update();
        foregroundFx.init();
        //foregroundFx.update();

        okbtn = {
            x: (width - s_buttons.Ok.width)/2,
            y: height - 200,
            width: s_buttons.Ok.width,
            height: s_buttons.Ok.height
        }

        sharebtn = {
            x: (width - s_buttons.Share.width)/2,
            y: height - 150,
            width: s_buttons.Share.width,
            height: s_buttons.Share.height,
        }

        run();
    }

    if (location.hash && location.hash.toLowerCase() == '#halloween') {
        img.src = "sheet_halloween.png";
    }
    else {
        var date = new Date;
        var hour = date.getHours();
        var month = date.getMonth();

        if (month == 9 && hour >= 18) {
            img.src = "sheet_halloween.png";
        } else if (month == 9 && hour <= 6) {
            img.src = "sheet_halloween.png";
        }
        else {
            img.src = "sheet.png";
        }
    }
}

function debugLog(txt) {
    if(window.location.hash) {
        document.getElementById("consoleMe").innerHTML = txt;
    }
}

/**
 * Starts and update gameloop
 */
function run() {
    var loop = function() {
        update();
        render();
        window.requestAnimationFrame(loop, canvas);
    }
    window.requestAnimationFrame(loop, canvas);
}

/**
 * Update foreground, bird and pipes position
 */
function update() {
    frames++;

    if (currentstate !== states.Score) {
        fgpos = (fgpos - 2) % 14;
    } else {
        // set best score to maximum score
        best = Math.max(best, score);
        try {
            localStorage.setItem("best", best);
        } catch(err) {
            //needed for safari private browsing mode
        }
        scrollTextPos = width*1.5;
    }
    if (currentstate === states.Game) {
        pipes.update();
    }

    bird.update();
    backgroundFx.update();
    foregroundFx.update();
}

/**
 * Draws bird and all pipes and assets to the canvas
 */
function render() {
    // draw background color
    ctx.fillRect(0, 0, width, height);
    // draw background sprites
    s_bg.draw(ctx, 0, height - s_bg.height);
    s_bg.draw(ctx, s_bg.width, height - s_bg.height);

    pipes.draw(ctx);
    bird.draw(ctx);

    // draw foreground sprites
    s_fg.draw(ctx, fgpos, height - s_fg.height);
    s_fg.draw(ctx, fgpos+s_fg.width, height - s_fg.height);

    var width2 = width/2; // center of canvas

    if (currentstate === states.Splash) {
        // draw splash text and sprite to canvas
        s_splash.draw(ctx, width2 - s_splash.width/2, height - 300);
        s_text.GetReady.draw(ctx, width2 - s_text.GetReady.width/2, height-400);

        if (scrollTextPos < (0-s_text.FlappyBird.width-width)) {
            scrollTextPos = width*1.5;
        }

        scrollTextPos = scrollTextPos -3;
        s_text.FlappyBird.draw(ctx, scrollTextPos, s_fg.height+300);
    }
    if (currentstate === states.Score) {
        // draw gameover text and score board
        s_text.GameOver.draw(ctx, width2 - s_text.GameOver.width/2, height-500);
        s_score.draw(ctx, width2 - s_score.width/2, height-340);
        s_buttons.Ok.draw(ctx, okbtn.x, okbtn.y);
        s_buttons.Share.draw(ctx, sharebtn.x, sharebtn.y);

        // draw score and best inside the score board
        s_numberS.draw(ctx, width2-47, height-304, score, null, 10);
        s_numberS.draw(ctx, width2-47, height-262, best, null, 10);

    } else {
        // draw score to top of canvas
        s_numberB.draw(ctx, null, 20, score, width2);
    }
}

// start and run the game
window.onload = function () {
    main();
};
