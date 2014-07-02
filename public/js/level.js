var Level = function(level){
    
    this.setRange = function(min,max){
        this.minimumBound = min;
        this.maximumBound = max;
    }
    
    this.setLevelData = function(levelDefinition){        
        this.terrainPoints = levelDefinition;
    }
    
};

// To use insie node.js with require:
if (typeof exports !== 'undefined') {
	exports.Level = Level;
}