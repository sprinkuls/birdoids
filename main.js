// https://developer.mozilla.org/en-US/docs/Games/Anatomy
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript



// --- GLOBALS -----------------------------------------
const birds = [];
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let w, h;
// --- END GLOBALS -------------------------------------



// --- FUNCTIONS ---------------------------------------
function update(delta) {
    // where the logic for proper movement will go
    for (const e of birds) {
        // bounce off edges of screen
        // (need to change to account for radius but ok for now)
        let xNext = e.pos.x + (e.vel.x * delta);
        let yNext = e.pos.y + (e.vel.y * delta);

        // check to see if we'd go off the screen next frame
        if (xNext >= w || xNext <= 0) {
            e.vel.x = -e.vel.x;
        }
        if (yNext >= h || yNext <= 0) {
            e.vel.y = -e.vel.y;
        }

        e.pos.x += e.vel.x * delta;
        e.pos.y += e.vel.y * delta;
    }
}

function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // where things are actually drawn to the canvas; JSON => canvas drawing
    for (const e of birds) {
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.opacity ?? 1;
        ctx.beginPath();
        ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // draw line in direction of velocity, with magnitude based on speed of bird
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.moveTo(e.pos.x, e.pos.y);

        const magnitude = (Math.sqrt(Math.pow(e.vel.x, 2) + Math.pow(e.vel.y, 2))) * 3;
        const theta = Math.atan2(e.vel.y, e.vel.x); // in radians

        ctx.lineTo(e.pos.x + (Math.cos(theta)*magnitude), e.pos.y + (Math.sin(theta)*magnitude));
        ctx.stroke();

        /*
        // draw lines to my friends
        for (const f of e.friends) {
            ctx.beginPath();
            ctx.strokeStyle = "red";

            // from me to friend
            ctx.moveTo(e.pos.x, e.pos.y);
            ctx.lineTo(f.pos.x, f.pos.y);
            ctx.stroke();
        }
        */
    }
    ctx.globalAlpha = 1;
}

function makeDot(x, y, vx, vy) {
    return {
        pos: {x, y},
        //vel: {x: vx, y: vy},
        //vel: {x: (Math.random()-0.5)*20, y: (Math.random()-0.5)*20}, // fun random motion
        vel: {x: (Math.random()-0.5)*20, y: (Math.random()-0.5)*20}, // fun random motion
        // add accel??
        radius: 3 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 200},50%,60%)`,
        opacity: 0.5,
    };
}

function makeGrid(w, h, density=50) {
    if (density < 1) { density = 1; }

    let arr = [];
    for (let i = 0; i <= density; i++) {
        for (let j = 0; j <= density; j++) {
            let x = (i/density) * w;
            let y = (j/density) * h;
            arr.push(makeDot(x, y, 0, 0, true));
        }
    }
    return arr;
}
// --- END FUNCTIONS -----------------------------------



// --- SETUP -------------------------------------------
    // resize on resize (not a great solution rn)
    function resize() {
        canvas.width = w = window.innerWidth;
        canvas.height = h = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // initial timing
    let last = performance.now();

    // make my grid.
    birds.push(...makeGrid(w, h, 10));
    console.log(birds.length);
// --- END SETUP ----------------------------------------



// --- MAIN LOOP ----------------------------------------
function main(now) {
    requestAnimationFrame(main);

    // fix max delta to 1/30 sec
    const delta = Math.min(0.033, (now - last) / 1000);
    last = now;

    update(delta);
    draw(ctx);
}
requestAnimationFrame(main);
