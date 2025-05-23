var Tile = require('./tile'),
    Face = require('./face'),
    Point = require('./point');

var Hexasphere = function(radius, numDivisions, hexSize){

    // Corners - 12
    this.radius = radius;
    var tao = 1.61803399; // Coordinates use the golden ratio (φ) to ensure regularity.
    var corners = [
        new Point(1000, tao * 1000, 0),
        new Point(-1000, tao * 1000, 0),
        new Point(1000,-tao * 1000,0),
        new Point(-1000,-tao * 1000,0),
        new Point(0,1000,tao * 1000),
        new Point(0,-1000,tao * 1000),
        new Point(0,1000,-tao * 1000),
        new Point(0,-1000,-tao * 1000),
        new Point(tao * 1000,0,1000),
        new Point(-tao * 1000,0,1000),
        new Point(tao * 1000,0,-1000),
        new Point(-tao * 1000,0,-1000)
    ];
    var points = {};
    for(var i = 0; i< corners.length; i++){
        points[corners[i]] = corners[i];
    }

    // Faces - 20
    var faces = [
        new Face(corners[0], corners[1], corners[4], false),
        new Face(corners[1], corners[9], corners[4], false),
        new Face(corners[4], corners[9], corners[5], false),
        new Face(corners[5], corners[9], corners[3], false),
        new Face(corners[2], corners[3], corners[7], false),
        new Face(corners[3], corners[2], corners[5], false),
        new Face(corners[7], corners[10], corners[2], false),
        new Face(corners[0], corners[8], corners[10], false),
        new Face(corners[0], corners[4], corners[8], false),
        new Face(corners[8], corners[2], corners[10], false),
        new Face(corners[8], corners[4], corners[5], false),
        new Face(corners[8], corners[5], corners[2], false),
        new Face(corners[1], corners[0], corners[6], false),
        new Face(corners[11], corners[1], corners[6], false),
        new Face(corners[3], corners[9], corners[11], false),
        new Face(corners[6], corners[10], corners[7], false),
        new Face(corners[3], corners[11], corners[7], false),
        new Face(corners[11], corners[6], corners[7], false),
        new Face(corners[6], corners[0], corners[10], false),
        new Face(corners[9], corners[1], corners[11], false)
    ];

    // newFaces- # newFaces = numDivisions**2 per face
    var getPointIfExists = function(point){
        if(points[point]){
            // console.log("EXISTING!");
            return points[point];
        } else {
            // console.log("NOT EXISTING!");
            points[point] = point;
            return point;
        }
    };
    var newFaces = [];
    for(var f = 0; f< faces.length; f++){
        // console.log("-0---");
        var prev = null;
        var bottom = [faces[f].points[0]];
        var left = faces[f].points[0].subdivide(faces[f].points[1], numDivisions, getPointIfExists);
        var right = faces[f].points[0].subdivide(faces[f].points[2], numDivisions, getPointIfExists);
        for(var i = 1; i<= numDivisions; i++){
            prev = bottom;
            bottom = left[i].subdivide(right[i], i, getPointIfExists);
            for(var j = 0; j< i; j++){
                var nf = new Face(prev[j], bottom[j], bottom[j+1]); 
                newFaces.push(nf);

                if(j > 0){
                    nf = new Face(prev[j-1], prev[j], bottom[j]);
                    newFaces.push(nf);
                }
            }
        }
    }
    faces = newFaces;

    // converts the mesh from a flat structure to a curved one.
    var newPoints = {};
    for(var p in points){
        var np = points[p].project(radius);
        newPoints[np] = np;
    }
    points = newPoints;

    // Create Tiles From Projected Points
    // Each point becomes a center point of a tile
    this.tiles = [];
    this.tileLookup = {};

    for(var p in points){
        var newTile = new Tile(points[p], hexSize);
        this.tiles.push(newTile);
        this.tileLookup[newTile.toString()] = newTile;
    }

    // Link Neighboring Tiles
    for(var t in this.tiles){
        var _this = this;
        this.tiles[t].neighbors = this.tiles[t].neighborIds.map(function(item){return _this.tileLookup[item]});
    }




    

};


Hexasphere.prototype.toJson = function() {

    return JSON.stringify({
        tiles: this.tiles.map(function(tile){return tile.toJson()})
    });
}

module.exports = Hexasphere;