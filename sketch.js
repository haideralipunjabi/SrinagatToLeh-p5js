let pts = [];
let cp = [];

let images = [];
let canvas;
let padding = 20;
let canvasSize;
let teamData = {};
let font;
let logo;
let strokeWeightSize = 20;
const goal = 500000;

let teamConsts = {};
async function getTeamData() {
    const sheetID = '1NyK1nFiYTe2GoOh0ldIEsebYTHMUWnAZsRp0jAOAuek';
    const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

    return await fetch(sheetURL)
        .then(response => response.text())
        .then(data => {
            const json = JSON.parse(data.substring(47).slice(0, -2));
            const headers = json.table.cols.map(col => col.label?.trim().toLowerCase());
            const rows = json.table.rows;
            const teamIndex = headers.indexOf('team');
            const stepsIndex = headers.indexOf('steps tracked');

            let teamTotals = {}

            rows.forEach(row => {
                const stepsCell = row.c[stepsIndex];
                const teamCell = row.c[teamIndex];
                if (stepsCell && teamCell) {
                    const steps = parseInt(stepsCell.v, 10);
                    const team = teamCell.v.trim();
                    if (!isNaN(steps)) {
                        teamTotals[team] = (teamTotals[team] || 0) + steps;
                    }
                }
            });
            const entries = Object.entries(teamTotals);

            const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
            return Object.fromEntries(sortedEntries);
        });
}

function preload() {
    images = [
        loadImage("/assets/srinagar.png"),
        loadImage("/assets/ganderbal.png"),
        loadImage("/assets/zojila.png"),
        loadImage("/assets/drass.png"),
        loadImage("/assets/kargil.png"),
        loadImage("/assets/ladakh.png")
    ];
    teamConsts = {
        "Cycos": {
            "color": [255, 182, 193],
            "image": loadImage("/assets/cycos.png")
        },
        "Akal se paidal": {
            "color": [174, 198, 207],
            "image": loadImage("/assets/asp.png")
        },
        "Walkie Talkies": {
            "color": [119, 221, 119],
            "image": loadImage("/assets/wt.png")
        },
        "Walking Dead": {
            "color": [255, 255, 153],
            "image": loadImage("/assets/wd.png")
        },
        "Legs Miserables": {
            "color": [203, 192, 255],
            "image": loadImage("/assets/lm.png")
        }
    }
    font = loadFont('/assets/font.ttf');
    logo = loadImage("/assets/logo.png");

}

function setup() {
    let availableWidth = windowWidth - 2 * padding;
    let availableHeight = windowHeight - 2 * padding;
    canvasSize = min(availableWidth, availableHeight);

    canvas = createCanvas(canvasSize, canvasSize,);
    centerCanvas();
    strokeCap(ROUND);
    // textFont(font);
    textSize(canvasSize / 50);
    textAlign(CENTER, CENTER);
    pixelDensity(10);

    saveButton = createButton("Save");
    // saveButton.position(canvasSize * 0.9, canvasSize * 0.95);
    saveButton.mousePressed(saveCanvasImage);
}
function windowResized() {
    let availableWidth = windowWidth - 2 * padding;
    let availableHeight = windowHeight - 2 * padding;
    let canvasSize = min(availableWidth, availableHeight);

    resizeCanvas(canvasSize, canvasSize);
    centerCanvas();
}
function centerCanvas() {
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
}

function drawTeamPlot(teamName, samplePoints) {
    let progress = teamData[teamName] / goal;
    let teamColor = color(...teamConsts[teamName]["color"]);
    console.log(teamColor)
    if (progress > 2) {
        progress = 2;
    }
    let progress2 = 0;
    if (progress > 1.0) {
        progress2 = progress - 1;
        progress = 1;
    }
    let progressCount = floor(progress * samplePoints.length);
    let progressCount2 = floor(progress2 * samplePoints.length);


    console.log(samplePoints.length);

    stroke(teamColor);
    strokeWeight(strokeWeightSize);
    noFill();
    beginShape();
    for (let i = 0; i < progressCount; i++) {
        let pt = samplePoints[i];
        vertex(pt.x, pt.y);
    }
    endShape();

    beginShape();
    for (let i = 0; i < progressCount2; i++) {
        let pt = samplePoints[samplePoints.length - 1 - i];
        vertex(pt.x, pt.y);
    }
    lastPoint = samplePoints[progressCount];
    if (progress2 != 0) {
        lastPoint = samplePoints[samplePoints.length - 1 - progressCount2];
    }
    image(teamConsts[teamName]["image"], lastPoint.x - (canvasSize / 30), lastPoint.y - (canvasSize / 30), canvasSize / 15, canvasSize / 15,);

    endShape();
}

function draw() {
    if (Object.keys(teamData).length == 0) return;
    background(229, 217, 200);
    strokeWeightSize = canvasSize / 30;

    let p0 = createVector(canvasSize * 0.1, canvasSize * 0.9);
    let p1 = createVector(canvasSize * 0.6, canvasSize * 0.7);
    let p2 = createVector(canvasSize * 0.2, canvasSize * 0.5);
    let p3 = createVector(canvasSize * 0.8, canvasSize * 0.4);
    let p4 = createVector(canvasSize * 0.4, canvasSize * 0.2);
    let p5 = createVector(canvasSize * 0.9, canvasSize * 0.18);

    pts = [p0, p1, p2, p3, p4, p5];



    cp = [];
    cp.push(pts[0]);
    for (let i = 0; i < pts.length; i++) {
        cp.push(pts[i]);
    }
    cp.push(pts[pts.length - 1]);

    noFill();
    stroke(200);
    strokeWeight(strokeWeightSize);
    beginShape();
    for (let i = 0; i < cp.length; i++) {
        curveVertex(cp[i].x, cp[i].y);
    }
    endShape();

    let samplePoints = [];
    let nSamplesPerSegment = 100;
    for (let i = 0; i < cp.length - 3; i++) {
        for (let j = 0; j < nSamplesPerSegment; j++) {
            let t = j / nSamplesPerSegment;
            let x = curvePoint(cp[i].x, cp[i + 1].x, cp[i + 2].x, cp[i + 3].x, t);
            let y = curvePoint(cp[i].y, cp[i + 1].y, cp[i + 2].y, cp[i + 3].y, t);
            samplePoints.push(createVector(x, y));
        }
    }
    samplePoints.push(pts[pts.length - 1]);

    for (team of Object.keys(teamData)) {
        drawTeamPlot(team, samplePoints)
    }

    fill(248, 155, 53);
    noStroke();

    offsets = [
        createVector(-canvasSize * 0.1, -canvasSize * 0.1),
        createVector(canvasSize * 0.01, -canvasSize * 0.1),
        createVector(-canvasSize * 0.15, -canvasSize * 0.1),
        createVector(canvasSize * 0.01, -canvasSize * 0.1),
        createVector(-canvasSize * 0.15, -canvasSize * 0.1),
        createVector(-canvasSize * 0.1, -canvasSize * 0.1),
    ]
    for (let i = 0; i < pts.length; i++) {
        image(images[i], pts[i].x + offsets[i].x, pts[i].y + offsets[i].y, canvasSize / 7, canvasSize / 7);
    }
    image(logo, canvasSize * 0.85 - ((canvasSize / 5) / 2), canvasSize * 0.62, canvasSize / 5, canvasSize / 5,);
    // text("Steps:", canvasSize * 0.85, canvasSize * 0.85);
    // text(totalSteps, canvasSize * 0.85, canvasSize * 0.9);
    noLoop();
}
function saveCanvasImage() {
    saveCanvas(canvas, 'srinagar-to-leh', 'png');
}
window.addEventListener("DOMContentLoaded", async () => {
    teamData = (await getTeamData());
    console.log(teamData)
});