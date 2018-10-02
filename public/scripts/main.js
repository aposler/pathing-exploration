// Add some Javascript code here, to run on the front end.
window.addEventListener('load', mainFunc);
//Once the page is loaded, mainFunc is run. mainFunc just adds a 
//callback function for clicks on the "resultsTable" object
function mainFunc() {
    var dimensions = document.getElementById("dimensions");
    var enter = document.getElementById("enterDimen");
    var username = document.getElementById("username");
    var saveGrid = document.getElementById("save");
    if (dimensions) {
        dimensions.onkeypress = onDimensionsPress;
    }

    if (enter) {
        enter.onclick = onEnterClick;
    }

    if (enter && dimensions && username) {
        gridInit(10);
    }
}

//Draws the grid to the specified number when enter is pressed, and checks input
//number for validity
function onDimensionsPress(event) {
    if (!event) {
        event = window.event;
    }
    var keyPressed = event.keyPressed || event.which;
    if (keyPressed === 13) {
        var dimensions = event.target.value;
        dimensions = Number(dimensions);
        if (dimensions > 1 && dimensions <= 50) {
            var element = document.getElementById("inputDescr");
            element.innerHTML = "Enter one number, it will be used as both Length and Width";
            gridInit(dimensions);
        } else {
            var element = document.getElementById("inputDescr");
            element.innerHTML = "Enter one number, it will be used as both Length and Width. Number must be at least 2 and no more than 50";
        }
    }
}

//Draws the grid to the specified number when enter is pressed, and check input
//number for validity
function onEnterClick(event) {
    var dimensions = document.getElementById("dimensions").value;
    dimensions = Number(dimensions);
    if (dimensions > 1 && dimensions <= 50) {
        var element = document.getElementById("inputDescr");
        element.innerHTML = "Enter one number, it will be used as both Length and Width";
        gridInit(dimensions);
    } else {
        var element = document.getElementById("inputDescr");
        element.innerHTML = "Enter one number, it will be used as both Length and Width. Number must be at least 2 and no more than 50";
    }
}

//Draws a grid of dimensions by dimensions, with each square being blocksize by
//blocksize pixels, and the entire thing being offset from the top and left by offSet
function gridDraw(blockSize, offSet, dimensions, fill, ctx) {
    ctx.lineWidth = 3;
    var offSetFull = Math.floor(ctx.canvas.width % dimensions);
    var gridEnd = (ctx.canvas.width - (offSetFull - offSet));
    if (fill) {
        for (var i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (var j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.fillRect(i, j, blockSize, blockSize);
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    } else {
        for (var i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (var j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    }
}

//Calculate the offSet to fit a grid of dimensions by dimensions
//in the center of a 600 by 600 pixel canvas. Also calculates the maximum size of each square of
//the grid, creates a backend 2d array of dimensions by dimensions, and then calls
//drawGrid to draw the grid with the calculated specifications Additionally, defines useful
//variables used throughout diffent event calls from buttons and the mouse, as well as the
//event functions for these interactions and some functions necessary for the snake game and 
//the path solving function to work
function gridInit(dimensions) {
    var canvases = {
        "aStar": { "canvas": document.getElementById("aStarCanvas") },
        "breadth": { "canvas": document.getElementById("breadthCanvas") },
        "depth": { "canvas": document.getElementById("depthCanvas") }
    };
    var mouseClicked = false;
    var exCanvas = canvases.aStar.canvas;
    var offSet = Math.floor((exCanvas.clientWidth % dimensions) / 2);
    var initWidth = exCanvas.clientWidth;
    var blockSize = Math.floor(exCanvas.clientWidth / dimensions);
    var errorMent = document.getElementById("errorText");
    errorMent.innerHTML = "Message Text: ";
    var fillOrRemove = false; //Variable that tells whether the current mouse dragging should fill blocks or
    //remove unoccupied ones
    // ctx.strokeStyle = "blue";
    // ctx.fillStyle = "white";
    // ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    var curCanvases = Object.values(canvases);
    for (var i = 0; i < curCanvases.length; ++i) {
        var curVal = curCanvases[i];
        curVal.canvas.height = curVal.canvas.clientHeight;
        curVal.canvas.width = curVal.canvas.clientWidth;
        curVal.ctx = curVal.canvas.getContext("2d");
        curVal.solved = false;
    }
    curCanvases = Object.values(canvases);
    //    curFields = Object.getOwnPropertyNames(canvases);

    for (var i = 0; i < curCanvases.length; ++i) {
        //      var curField = curFields[i];
        var curVal = curCanvases[i];
        curVal.ctx.fillStyle = "white";
        curVal.ctx.strokeStyle = "blue";
        gridDraw(blockSize, offSet, dimensions, true, curVal.ctx);
        curVal.backArray = [];
        for (var j = 0; j < dimensions; ++j) {
            curVal.backArray.push([]);
            curVal.backArray[j].length = dimensions;
            curVal.backArray[j].fill(0);
        }
        curVal.canvas.onmouseup = gridsMouseUp;
        curVal.canvas.onmousedown = gridsMouseDown;
        curVal.canvas.onmouseleave = gridsMouseLeave;
        curVal.canvas.onmousemove = gridsMouseMove;
    }

    function gridsMouseUp(event) {
        mouseClicked = false;
    }

    function gridsMouseDown(event) {
        var borderOffset = 5;
        var resizedOffSet = Math.ceil((this.clientWidth / initWidth) * offSet);
        var resizedBlockSize = Math.floor((this.clientWidth - (resizedOffSet * 2)) / dimensions);
        var xDown = event.layerX - (this.offsetLeft + borderOffset + resizedOffSet);
        var yDown = event.layerY - (this.offsetTop + borderOffset + resizedOffSet);
        var xDex = Math.floor(xDown / resizedBlockSize);
        var yDex = Math.floor(yDown / resizedBlockSize);
        for (var i = 0; i < curCanvases.length; ++i) {
            curVal = curCanvases[i];
            if (curVal.solved) {
                reInitGrid(curVal.backArray, dimensions, blockSize, offSet, curVal.ctx);
                curVal.solved = false;
            }
            if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                if (curVal.backArray[xDex][yDex] === 0) {
                    fillOrRemove = true;
                    curVal.ctx.fillStyle = "brown";
                    curVal.ctx.strokeStyle = "blue";
                    curVal.backArray[xDex][yDex] = 1;
                    curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                } else {
                    fillOrRemove = false;
                    curVal.ctx.fillStyle = "white";
                    curVal.ctx.strokeStyle = "blue";
                    curVal.backArray[xDex][yDex] = 0;
                    curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                }
                mouseClicked = true;
            }
        }
    }

    function gridsMouseLeave(event) {
        mouseClicked = false;
    }

    function gridsMouseMove(event) {
        if (mouseClicked) {
            var borderOffset = 5;
            var resizedOffSet = Math.floor((this.clientWidth / initWidth) * offSet);
            var resizedBlockSize = Math.floor((this.clientWidth - (resizedOffSet * 2)) / dimensions);
            var xDown = event.layerX - (this.offsetLeft + borderOffset + resizedOffSet);
            var yDown = event.layerY - (this.offsetTop + borderOffset + resizedOffSet);
            var xDex = Math.floor(xDown / resizedBlockSize);
            var yDex = Math.floor(yDown / resizedBlockSize);
            for (var i = 0; i < curCanvases.length; ++i) {
                curVal = curCanvases[i];
                if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                    if (fillOrRemove) {
                        curVal.ctx.fillStyle = "brown";
                        curVal.ctx.strokeStyle = "blue";
                        curVal.backArray[xDex][yDex] = 1;
                        curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                        curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    } else {
                        curVal.ctx.fillStyle = "white";
                        curVal.ctx.strokeStyle = "blue";
                        curVal.backArray[xDex][yDex] = 0;
                        curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                        curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    }
                }
            }
        }
    }

    //Signals the pathing algorithm to start solving the maze if snake is not being played and
    //if it has not already been solved. Also sets the solved flag to true.
    document.getElementById("solve").onclick = function (event) {
        var aStarPath = new aStar(canvases.aStar.backArray, blockSize, offSet, canvases.aStar.ctx);
        var breadthPath = new breadth(canvases.breadth.backArray, blockSize, offSet, canvases.breadth.ctx);
        var depthPath = new depth(canvases.depth.backArray, blockSize, offSet, canvases.depth.ctx);

        continuePath(blockSize, offSet, aStarPath, breadthPath, depthPath);

        for (var i = 0; i < curCanvases.length; ++i) {
            curVal = curCanvases[i];
            curVal.solved = true;
        }
    }

    //Reinitializes the grid upon pressing the restart button.
    document.getElementById("restart").onclick = function (event) {
        gridInit(dimensions);
    }

    var username = document.getElementById("username");
    username.onkeypress = function (event) {
        if (!event) {
            event = window.event;
        }
        var keyPressed = event.keyPressed || event.which;
        if (keyPressed === 13) {
            var dimensions = event.target.value;
            dimensions = Number(dimensions);
            if (dimensions > 1 && dimensions <= 50) {
                var element = document.getElementById("inputDescr");
                element.innerHTML = "Enter one number, it will be used as both Length and Width";
                gridInit(dimensions);
            } else {
                var element = document.getElementById("inputDescr");
                element.innerHTML = "Enter one number, it will be used as both Length and Width. Number must be at least 2 and no more than 50";
            }
        }
    }

    var saveGrid = document.getElementById("save");
    saveGrid.onclick = function (event) {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        var exCanvas = canvases.aStar;

        var sendStruct = {
            "requestType": "add",
            "username": username.value,
            "grid": stripBackArray(exCanvas.backArray)
        };

        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var nameBox = document.getElementById("nameBox");
                nameBox.options.length = 0;
                var names = JSON.parse(httpReq.responseText);
                for (var i = 0; i < names.length; ++i) {
                    var curOption = document.createElement("option");
                    curOption.text = names[i].gridName;
                    nameBox.add(curOption);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }

    var enterUser = document.getElementById("enterUser");
    enterUser.onclick = function (event) {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        var sendStruct = {
            "requestType": "request",
            "username": username.value,
        };
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var nameBox = document.getElementById("nameBox");
                nameBox.options.length = 0;
                var names = JSON.parse(httpReq.responseText);
                for (var i = 0; i < names.length; ++i) {
                    var curOption = document.createElement("option");
                    curOption.text = names[i].gridName;
                    nameBox.add(curOption);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }

    var loadGrid = document.getElementById("load");
    loadGrid.onclick = function (event) {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        var exCanvas = canvases.aStar;

        var nameBox = document.getElementById("nameBox");
        var gridName = nameBox.options[nameBox.selectedIndex].text;
        var sendStruct = {
            "requestType": "grid",
            "username": username.value,
            "gridName": gridName
        };
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var gridRes = JSON.parse(httpReq.responseText);
                for (var i = 0; i < curCanvases.length; ++i) {
                    var grid = JSON.parse(gridRes.grid);
                    var curVal = curCanvases[i];
                    curVal.backArray = grid;
                    reInitGrid(grid, dimensions, blockSize, offSet, curVal.ctx);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }
}

function stripBackArray(backArray) {
    var newArray = [];
    for (i = 0; i < backArray.length; ++i) {
        newArray.push([]);
        for (j = 0; j < backArray[i].length; ++j) {
            if (backArray[i][j] != 1) {
                newArray[i][j] = 0;
            } else {
                newArray[i][j] = 1;
            }
        }
    }
    return newArray;
}

//Goes through the grid and redraws every block the way it was, unless it was part of the solved path or set
//to 2 by the pathing algorith. Solved path blocks are redrawn to empty, and all spots set to 2 are set to 0.
function reInitGrid(grid, dimensions, blockSize, offSet, ctx) {
    for (var i = 0; i < dimensions; i++) {
        for (var j = 0; j < dimensions; j++) {
            if (grid[i][j] === 2 || grid[i][j] === 0) {
                grid[i][j] = 0;
                ctx.fillStyle = "white";
                ctx.strokeStyle = "blue";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            } else {
                ctx.fillStyle = "brown";
                ctx.strokeStyle = "blue";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            }
        }
    }
}


//pathNode function that contains the position, value (combination of estimated cost
//to end and movement cost from start), estimated cost to end, movement cost from beginning,
//and parent node you travel to this node from.
class aStarPathNode {
    constructor(xPos, yPos, worth, estCost, moveCost, parent) {
        this._x = xPos;
        this._y = yPos;
        this._worth = worth;
        this._estCost = estCost;
        this._moveCost = moveCost;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get worth() {
        return this._worth;
    }

    set worth(value) {
        this._worth = value;
    }

    get moveCost() {
        return this._moveCost;
    }

    set moveCost(value) {
        this._moveCost = value;
    }

    get estCost() {
        return this._estCost;
    }

    set estCost(value) {
        this._estCost = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}

//pathNode function that contains the position, value (combination of estimated cost
//to end and movement cost from start), estimated cost to end, movement cost from beginning,
//and parent node you travel to this node from.
class depthBreadthPathNode {
    constructor(xPos, yPos, parent) {
        this._x = xPos;
        this._y = yPos;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}


//A path class, used to store the open list and perform actions on them. I ideally would
//have had this, the pathNode class, and the other path functions in another class but
//I did not do that for browser compatibility issues.
class aStarPath {
    constructor() {
        this._open = [];
    }

    //Checks the open array to see if the existing node with the given x and y exists. If the node exists then
    //the function checks if the new version of the node has a smaller move cost, and if it does then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    update(xPos, yPos, value, parentNode) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                if (tempNode.moveCost > value) {
                    tempNode.worth = tempNode.estCost + value;
                    tempNode.moveCost = value;
                    tempNode.parent = parentNode;
                }
                return true;
            }
        }
        return false;
    }

    //Adds the node to the open array if the node does not already exist in the array. If it already exists
    //it checks if the new version of the node has a smaller move cost. if it has a better move cost then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    add(node) {
        if (!(this.update(node.x, node.y, node.moveCost, node.parent))) {
            this._open.push(node);
        }
    }

    //Deletes the node from the open list. It is named swap because traditionally
    //A* would have a closed list of nodes that have already been checked that you would
    //swap the node into. I did not implement the closed list because I simply set visited nodes in the grid,
    //so this function only removes the node from open
    swap(xPos, yPos) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                ((this._open).splice(i, 1))[0];
                return true;
            }
        }
        return false;
    }

    //Returns a boolean on whether or not the open array has values
    valid() {
        if ((this._open).length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    //Determines the next node and returns it. Returns the node from open with the lowest
    //worth. If there are multiple nodes with the same worth it will check if any are directly adjacent to 
    //the current node. If only one is  directly adjacent then it returns that one, but if there are multiple it
    //chooses them in the importance right->down->left->up. If none are adjacent it chooses 
    //the first one it finds in the list, starting from 0.
    next(node) {
        var least = (this._open)[0];
        var proximity = 5;
        (this._open).forEach(function (element) {
            if (element.worth < least.worth) {
                least = element;
            } else if (element.worth === least.worth) {
                var newProximity;
                if (element.x === node.x) {
                    if (element.y - 1 === node.y) {
                        newProximity = 2;
                    } else if (element.y + 1 === node.y) {
                        newProximity = 4;
                    }
                }
                if (element.y === node.y) {
                    if (element.x - 1 === node.x) {
                        newProximity = 1;
                    } else if (element.x + 1 === node.x) {
                        newProximity = 3;
                    }
                }
                if (newProximity < proximity) {
                    least = element;
                    proximity = newProximity;
                }
            }
        });
        return least;
    }

    get open() {
        return this._open;
    }
}

class aStar {
    constructor(grid, blockSize, offSet, ctx) {
        this.grid = grid;
        this.ctx = ctx;
        this.pathMain = new aStarPath();
        var lastEntry = this.grid.length - 1;
        this.curNode = new aStarPathNode(0, 0, (this.grid.length * 2), (this.grid.length * 2), 0, null);
        if (this.grid[0][0] === 0) {
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathMain.add(this.curNode);
        }
    }

    update(blockSize, offSet) {
        var lastEntry = this.grid.length - 1;
        if (this.pathMain.valid() && ((this.curNode.x !== (lastEntry)) || (this.curNode.y !== (lastEntry)))) {
            this.grid[this.curNode.x][this.curNode.y] = 2;
            this.pathMain.swap(this.curNode.x, this.curNode.y);
            aStarAddPath(this.curNode, this.pathMain, this.grid);
            this.curNode = this.pathMain.next(this.curNode);
            if (!this.curNode) {
                this.pathFound = true;
                return;
            }
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        if (this.pathMain.valid()) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.curNode, blockSize, offSet, this.ctx)
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Path found successfully";
        } else {
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Could not find path";
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
        }
    }
}

class breadth {
    constructor(grid, blockSize, offSet, ctx) {
        this.grid = grid;
        this.ctx = ctx;
        this._open = [];
        var lastEntry = this.grid.length - 1;
        var curNode = new depthBreadthPathNode(0, 0, null);
        if (this.grid[0][0] === 0) {
            this.grid[0][0] = 2;
            this._open.push(curNode);
        }
    }

    update(blockSize, offSet) {
        if (this._open.length <= 0) {
            this.pathFound = true;
            return;
        }
        var lastEntry = this.grid.length - 1;
        var curNode = this._open.shift();
        if (((curNode.x !== (lastEntry)) || (curNode.y !== (lastEntry)))) {
            breadthAddPath(curNode, this._open, this.grid);
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.finalNode = curNode;
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        if (this.finalNode) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.finalNode, blockSize, offSet, this.ctx)
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Path found successfully";
        } else {
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Could not find path";
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
        }
    }
}


class depth {
    constructor(grid, blockSize, offSet, ctx) {
        this.grid = grid;
        this.ctx = ctx;
        this._open = [];
        var lastEntry = this.grid.length - 1;
        var curNode = new depthBreadthPathNode(0, 0, null);
        if (this.grid[0][0] === 0) {
            this._open.push(curNode);
        }
    }

    update(blockSize, offSet) {
        if (this._open.length <= 0) {
            this.pathFound = true;
            return;
        }
        var lastEntry = this.grid.length - 1;
        var curNode = this._open.pop();
        this.grid[curNode.x][curNode.y] = 2;
        if (((curNode.x !== (lastEntry)) || (curNode.y !== (lastEntry)))) {
            depthAddPath(curNode, this._open, this.grid);
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.finalNode = curNode;
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        if (this.finalNode) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.finalNode, blockSize, offSet, this.ctx)
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Path found successfully";
        } else {
            var errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Could not find path";
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
        }
    }
}

//Calculates the least cost to the bottom right corner from the top corner. Avoids any obstacles
//created by the user, a
function aStarPathing(grid, blockSize, offSet, ctx) {
    var curPath = new aStar(grid, blockSize, offSet, ctx);
    var pathDone = true;

    continuePath(grid, blockSize, offSet, ctx, curPath);
}

function continuePath(blockSize, offSet, aStarPath, breadthPath, depthPath) {
    if (aStarPath.completed != true) {
        if (aStarPath.pathFound != true) {
            aStarPath.update(blockSize, offSet);
        } else {
            aStarPath.complete(blockSize, offSet);
        }
    }

    if (breadthPath.completed != true) {
        if (breadthPath.pathFound != true) {
            breadthPath.update(blockSize, offSet);
        } else {
            breadthPath.complete(blockSize, offSet);
        }
    }

    if (depthPath.completed != true) {
        if (depthPath.pathFound != true) {
            depthPath.update(blockSize, offSet);
        } else {
            depthPath.complete(blockSize, offSet);
        }
    }

    if (aStarPath.completed != true || breadthPath.completed != true || depthPath.completed != true) {
        setTimeout(continuePath, 25, blockSize, offSet, aStarPath, breadthPath, depthPath);
        return;
    }
}

//Draws the path back to the origin from the given node in green
function drawPath(node, blockSize, offSet, ctx) {
    if (node !== null) {
        ctx.fillRect((node.x * blockSize) + offSet, (node.y * blockSize) + offSet, blockSize, blockSize);
        ctx.strokeRect((node.x * blockSize) + offSet, (node.y * blockSize) + offSet, blockSize, blockSize);
        setTimeout(drawPath, 25, node.parent, blockSize, offSet, ctx);
    }
}

// Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function aStarAddPath(parentNode, pathMain, grid) {
    var pathTemp = checkPath(parentNode.x - 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x, parentNode.y - 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x + 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x, parentNode.y + 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
}

function depthAddPath(parentNode, open, grid) {
    if (validPoint(parentNode.x - 1, parentNode.y, grid)) {
        var leftNode = new depthBreadthPathNode(parentNode.x - 1, parentNode.y, parentNode);
        open.push(leftNode);
    }
    if (validPoint(parentNode.x, parentNode.y - 1, grid)) {
        var upNode = new depthBreadthPathNode(parentNode.x, parentNode.y - 1, parentNode);
        open.push(upNode);
    }
    if (validPoint(parentNode.x, parentNode.y + 1, grid)) {
        var downNode = new depthBreadthPathNode(parentNode.x, parentNode.y + 1, parentNode);
        open.push(downNode);
    }
    if (validPoint(parentNode.x + 1, parentNode.y, grid)) {
        var rightNode = new depthBreadthPathNode(parentNode.x + 1, parentNode.y, parentNode);
        open.push(rightNode);
    }
}

function breadthAddPath(parentNode, open, grid) {
    if (validPoint(parentNode.x - 1, parentNode.y, grid)) {
        var leftNode = new depthBreadthPathNode(parentNode.x - 1, parentNode.y, parentNode);
        grid[parentNode.x - 1][parentNode.y] = 2;
        open.push(leftNode);
    }
    if (validPoint(parentNode.x, parentNode.y - 1, grid)) {
        var upNode = new depthBreadthPathNode(parentNode.x, parentNode.y - 1, parentNode);
        grid[parentNode.x][parentNode.y - 1] = 2;
        open.push(upNode);
    }
    if (validPoint(parentNode.x + 1, parentNode.y, grid)) {
        var rightNode = new depthBreadthPathNode(parentNode.x + 1, parentNode.y, parentNode);
        grid[parentNode.x + 1][parentNode.y] = 2;
        open.push(rightNode);
    }
    if (validPoint(parentNode.x, parentNode.y + 1, grid)) {
        var downNode = new depthBreadthPathNode(parentNode.x, parentNode.y + 1, parentNode);
        grid[parentNode.x][parentNode.y + 1] = 2;
        open.push(downNode);
    }
}

// Determines if the given location is valid, and if it is calculates the correct movement distance from
// the origin(moveCost), the estimated travel time to the endpoint(estCost), and the combination of the
// two. Returns a node object created with those values if the location is valid, otherwise returns false;
function checkPath(xPos, yPos, moveCost, parentNode, grid) {
    if (validPoint(xPos, yPos, grid)) {
        var lastEntry = grid.length - 1;
        var shortPath = (lastEntry - xPos) + (lastEntry - yPos);
        var pathCost = shortPath + moveCost;
        return new aStarPathNode(xPos, yPos, pathCost, shortPath, moveCost, parentNode);
    } else {
        return false;
    }
}

// Deterimines whether or not the desired point is valid (within the grid and walkable)
function validPoint(xPos, yPos, grid) {
    if (xPos >= 0 && xPos < grid.length && yPos >= 0 && yPos < grid.length
        && grid[xPos][yPos] === 0) {
        return true;
    } else {
        return false;
    }
}