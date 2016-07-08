var svg = document.getElementById("svgroot");
var message = document.getElementById("status");

// Cells
var cells = []; 
var cellSize = 20;
var cellRows = 20;
var cellCols = 20;
var factions = ["empty","red","grn"];


function gridCell(x,y,id){
  var isKilled = false;
  var inGroup = false;
  var faction = factions[0];
  var cellid = "cell_x"+x+"y"+y;
  var position = { x: x, y: y };
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); 
  var groupBorder = document.createElementNS("http://www.w3.org/2000/svg", "circle"); 
  
  //cells around clockwise from above
  var cellsAround = [false,false,false,false,false,false,false,false]
  
  svg.appendChild(rect); 
  
  
  rect.setAttribute("width", cellSize); 
  rect.setAttribute("height", cellSize); 
  rect.setAttribute("fill","#ffffff");
  rect.setAttribute("stroke","#000000");
  rect.setAttribute("id",cellid);
  rect.setAttribute("x", position.x);
  rect.setAttribute("y", position.y);

  //groupBorder.setAttribute("d", "m );
  groupBorder.setAttribute("cx", position.x+cellSize/2);
  groupBorder.setAttribute("cy", position.y+cellSize/2);
  groupBorder.setAttribute("r", cellSize*1.5);
  groupBorder.setAttribute("id","h_"+cellid);
  groupBorder.setAttribute("stroke","black");
  groupBorder.setAttribute("fill","none");
  groupBorder.setAttribute("stroke-width",2);
     
  this.cellAbove = function(){
    return cellsAround[0];
  }
  this.cellBelow = function(){
    return cellsAround[4];
  }
  this.cellRight = function(){
    return cellsAround[2];
  }
  this.cellLeft = function(){
    return cellsAround[6];
  }
  this.cellAboveLeft = function(){
    return cellsAround[7];
  }
  this.cellAboveRight = function(){
    return cellsAround[1];
  }
  this.cellBelowRight = function(){
    return cellsAround[3];
  }
  this.cellBelowLeft = function(){
    return cellsAround[5];
  }
  this.getCellsAround = function(){
    cellsAround[0] = getCell("cell_x"+position.x+"y"+(position.y-cellSize));            //cellAbove
    cellsAround[1] = getCell("cell_x"+(position.x+cellSize)+"y"+(position.y-cellSize)); //cellAboveRight
    cellsAround[2] = getCell("cell_x"+(position.x+cellSize)+"y"+position.y);            //cellRight
    cellsAround[3] = getCell("cell_x"+(position.x+cellSize)+"y"+(position.y+cellSize)); //cellBelowRight
    cellsAround[4] = getCell("cell_x"+position.x+"y"+(position.y+cellSize));            //cellBelow
    cellsAround[5] = getCell("cell_x"+(position.x-cellSize)+"y"+(position.y+cellSize)); //cellBelowLeft
    cellsAround[6] = getCell("cell_x"+(position.x-cellSize)+"y"+position.y);            //cellLeft
    cellsAround[7] = getCell("cell_x"+(position.x-cellSize)+"y"+(position.y-cellSize)); //cellAboveLeft
    return cellsAround;
  }
  
  this.resetCell = function () {
    isKilled = false;
    inGroup = false
    faction = factions[0];
    this.cellCapture(faction);
  }
  this.cellId = function () {
    return cellid;
  }
  this.faction = function () {
    return faction;
  }
  this.isKilled = function () {
    return isKilled;
  }
  this.inGroup = function () {
    return inGroup;
  }
  this.setInGroup = function (newInGroup) {
    if (svg.getElementById("h_"+cellid)){
      svg.removeChild(groupBorder);
    }
    if (newInGroup || inGroup){ 
      svg.appendChild(groupBorder);
    }
    inGroup = newInGroup;
  }
  
  this.cellCapture = function(newFaction) {
  //expect a literal faction "red", "grn" etc
    cellStyle = "url(#g_";
    if(faction == "empty"){
      cellStyle += newFaction + ")";
      faction = newFaction;
    }else if (faction != newFaction && !(isKilled)){
      //if new faction, make dead, keep same faction
      cellStyle += faction;
      cellStyle += "_dead)"
      isKilled = true;
      
    }else{
       return false;
    }
    rect.setAttribute("fill",cellStyle);
    //if surounded by 8 of same colour then increase power
    
    //if killed - no longer can have group next to us
    if (isKilled){
      for (var index = 0; index < cellsAround.length; index++){
        if (cellsAround[index] && cellsAround[index].inGroup){
          setInGroup = false;
        }
      }
    }
    return true;
  }
  
}



function getCell(celltoGet) {
  for (var index = 0; index < cells.length; index++) {
        if (cells[index].cellId() == celltoGet){
          return cells[index];
        }
    }
   return false;
}

//checks if we can move into this cell id as this player
function canMove(faction,cellId){
  var moveOK = false;
  var centreCell = getCell(cellId);
  
  
  if (centreCell){ //if we have a cell
    //find surounding squares
    var cellsAround = centreCell.getCellsAround();
    cellsAdjacent =  [cellsAround[0], cellsAround[2], cellsAround[4] ,cellsAround[6]];
   } else { // no cell = no move
    return moveOK; //false
   }
   
   var cellCount = checkAround(centreCell);
   // if we have 8 plus ourselves we have a group for our faction 
   if (cellCount[faction] == 8 && !centreCell.isKilled()){ 
      centreCell.setInGroup(true);
   }
   //if this cell hasn't got 8 - then we can kill it's group
   if (cellCount[centreCell.faction()] < 8 ){ 
     centreCell.setInGroup(false);
   }
   

    //can't move into own square
   if (centreCell.faction() != faction) {
    for (var i = 0; i < cellsAdjacent.length; i++) {
        //check if at least one surrounding square is same faction and isn't killed
       if (cellsAdjacent[i] && cellsAdjacent[i].faction() == faction && !cellsAdjacent[i].isKilled()){
        moveOK = true;
        return moveOK;
       }
       //if other faction but we've killed it then we can move
       if (cellsAdjacent[i] && cellsAdjacent[i].faction() != faction && cellsAdjacent[i].isKilled()){
        moveOK = true;
        return moveOK;
       }
      }   
    }

    
  return moveOK;
}

function checkAround(centreCell){
  //While we're here - check if inGroup
    var cellCount = {};
    cellCount[factions[0]]=0;
    cellCount[factions[1]]=0;
    cellCount[factions[2]]=0;
    var cellsAround = centreCell.getCellsAround();
    for (var i = 0; i < cellsAround.length; i++) {
        //check count of cells of factions not killed and not in existing group
       if (cellsAround[i] && !cellsAround[i].isKilled() && !cellsAround[i].inGroup()){
        cellCount[cellsAround[i].faction()]++;
       }
    }
    return cellCount;
 }
    



function generateGrid() {
    // Reset existing
    for (var index = 0; index < cells.length; index++) {
        cells[index].resetCell();
    }

    // Creating new ones
    var cellIndex = 0;

    for (var x = 0; x < cellCols; x++) {
        for (var y = 0; y < cellRows; y++) {
            cells[cellIndex++] = new gridCell(x * cellSize, y * cellSize,cellIndex-1);
        }
    }
    
    getCell("cell_x0y0").cellCapture("red");
    getCell("cell_x"+(cellSize*(cellCols-1))+"y0").cellCapture("grn");
}