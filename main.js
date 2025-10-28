// https://developer.mozilla.org/en-US/docs/Games/Anatomy
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
// https://www.red3d.com/cwr/boids/



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


        // update velocity
        //e.vel.x += e.acc.x * delta;
        //e.vel.y += e.acc.y * delta;


        // stupid lazy hack O(n^2) way to find nearby birds
        // find what birds are nearby
        // massive TODO, need an actually efficient way to get this info
        for (const f of birds) {
            let distTo = Math.sqrt(Math.pow(e.pos.x - f.pos.x, 2) + Math.pow(e.pos.y - f.pos.y, 2));

            if (distTo <= 100 && !Object.is(e,f)) {
                e.friends.add(f);
                f.friends.add(e);
            } else {
                e.friends.delete(f);
                e.friends.delete(e);
            }
        }

        //
        if (e.friends.size > 0) {
            // BEHAVIOR 1: ALIGNMENT
            const friendVelocities = Array.from(e.friends).map(obj => obj.vel);
            const friendThetas = friendVelocities.map(vel => Math.atan2(vel.y, vel.x)); // in radians!
            const avgTheta = friendThetas.reduce((partial, x) => (partial + x), 0) / friendThetas.length;
            // aim my accel in that direction
            // use current accel's magnitude? and then would allow it to later be offset by repulsion.. yah
            //const accelMag = Math.sqrt(Math.pow(e.acc.x, 2) + Math.pow(e.acc.y, 2));
            const accelMag = 40;
            e.acc.x = Math.cos(avgTheta)*accelMag;
            e.acc.y = Math.sin(avgTheta)*accelMag;

            //e.vel.x += Math.cos(avgTheta)*accelMag/10;
            //e.vel.y += Math.sin(avgTheta)*accelMag/10;
            //console.log('e')
        }

        e.vel.x = Math.min(Math.max(e.vel.x + e.acc.x * delta, -30), 30);
        e.vel.y = Math.min(Math.max(e.vel.y + e.acc.y * delta, -30), 30);

        // update where we are last
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
        ctx.strokeStyle = "SkyBlue";
        ctx.moveTo(e.pos.x, e.pos.y);

        //const magnitude = (Math.sqrt(Math.pow(e.vel.x, 2) + Math.pow(e.vel.y, 2))) * 3;
        const magnitude = 10;
        const theta = Math.atan2(e.vel.y, e.vel.x); // in radians

        ctx.lineTo(e.pos.x + (Math.cos(theta)*magnitude), e.pos.y + (Math.sin(theta)*magnitude));
        ctx.stroke();

        // draw lines to my friends
        for (const f of e.friends) {
            ctx.strokeStyle = "grey";
            ctx.globalAlpha = 0.04;

            // from me to friend
            ctx.beginPath();
            ctx.moveTo(e.pos.x, e.pos.y);
            ctx.lineTo(f.pos.x, f.pos.y);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}

function makeBird(x, y, vx, vy) {
    return {
        pos: {x, y},
        //vel: {x: vx, y: vy},
        //vel: {x: (Math.random()-0.5)*40, y: (Math.random()-0.5)*40}, // fun random motion
        //vel: {x: (Math.random()-0.5)*20, y: 0}, // fun sideways motion
        vel: {x: (Math.random()-0.5)*20, y: 0}, // fun sideways motion
        acc: {x: (Math.random()-0.5)*20,  y: (Math.random()-0.5)*20 }, // fun random accel
        //acc: {x: 0,  y: 30 }, // fun downward accel
        friends: new Set(),
        radius: 3 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 200},50%,60%)`,
        opacity: 0.5,
    };
}

function makeBirdProper(x, y, vx, vy, ax, ay) {
    return {
        pos: {x, y},
        vel: {x: vx, y: vy},
        acc: {x: ax,  y: ay },
        friends: new Set(),
        radius: 3 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 200},50%,60%)`,
        opacity: 0.5,
    };
}

function makeGrid(w, h, density=50) {
    if (density < 1) { density = 1; }

    let arr = [];
    for (let i = 0; i <= density-1; i++) {
        for (let j = 0; j <= density-1; j++) {
            let x = (i/density) * w;
            let y = (j/density) * h;
            arr.push(makeBird(x, y, 0, 0, true));
        }
    }
    return arr;
}

// denser birds at the center, bouncing off edges leads to less interesting behavior
function makeGridCenter(w, h, density=50) {
    if (density < 1) { density = 1; }
    // keep to middle 50 of width/height
    let widthBorder = 0.25 * w;
    let heightBorder = 0.25 * h;

    let arr = [];
    for (let i = 0; i <= density-1; i++) {
        for (let j = 0; j <= density-1; j++) {
            let x = ((i/density) * (w/2)) + widthBorder;
            let y = ((j/density) * (h/2)) + heightBorder;
            arr.push(makeBird(x, y, 0, 0, true));
        }
    }
    return arr;
}

function makeGridProper(w, h, density=50) {
    if (density < 1) { density = 1; }

    let arr = [];
    for (let i = 0; i <= density-1; i++) {
        for (let j = 0; j <= density-1; j++) {
            let x = (i/density) * w;
            let y = (j/density) * h;
            arr.push(makeBirdProper(x, y, 2, 2, 3, 3));
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
    //birds.push(...makeGridProper(w, h, 10));
    birds.push(...makeGridCenter(w, h, 10));
    //birds.push(makeBirdProper(400, 400, 10, 0, 5, 5));
    //birds.push(makeBirdProper(480, 400,  0, 10, 5, 5));
    console.log(`${birds.length} birds`);
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
