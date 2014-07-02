var Level = function(level){
    
    this.terrainPoints,this.minimumBound,this.maximumBound;
    
    this.setRange = function(min,max){
        this.minimumBound = min;
        this.maximumBound = max;
    }
    
    this.setLevelData = function(levelDefinition){        
        this.terrainPoints = levelDefinition;
    }
    
};