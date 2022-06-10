const etendues = d3.select("#graph").node();
const width = 620;
const height = 480;
const barHeight = 550;
const margin = { top:80, bottom:20, left:100, right:100};
const innerWidth = width - margin.left - margin.right;
const innerHeight = barHeight - margin.bottom - margin.top - 100;
const geo_path = "https://raw.githubusercontent.com/Kai-Bin-Shih/information_visualization_final/main/data/map.json"
/* d3.json("https://raw.githubusercontent.com/JanTan169/Information-Visualization-Final-Project/main/Earthquake.json", function(data){
    console.log(data)
}); */

async function getData() {
    var d = await d3.json("https://raw.githubusercontent.com/JanTan169/Information-Visualization-Final-Project/main/Earthquake.json");
    return d
}

getData().then(value => {
    let data = value
    console.log(data)

    Promise.all([
        d3.json(geo_path)
    ]).then(values => {
    
        let features = values[0].features;
    
        // for test----------------------------------
        for (i = features.length - 1 ; i >= 0 ; i--){
            features[i].properties.NUMBER = 100;
        }
    
        let path = d3.geoPath().projection(
            d3.geoMercator()
                .center([121, 24])
                .scale(height * 12)
                .translate([width / 2, height / 2.5])
        );
        
        //畫布
        let svg = d3.select("body")
                .select("#svg-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .selectAll('path')
                .data(features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr("stroke","#000")  // 線的顏色
                .attr("fill-opacity", 1)
                .on('mousemove', function(event, d){
                    d3.select(this).attr("fill-opacity", 0.5);
                        let now_color = this.getAttribute("fill");
                })
                .on('mouseout', function(){
                    d3.select(this).attr("fill-opacity", 1);
                })
    
        //建立顏色漸變
        /* var maxValue = Math.max(...num)
        var minValue = Math.min(...num) */
        // for test ---------------------------------
        var maxValue = 100;
        var minValue = 50;
        
        var linear = d3.scaleLinear().domain([minValue, maxValue]).range([0,1])
        
        //定義最小值和最大值對應的顏色
        /* var a = d3.rgb(0,255,255);	
        var b = d3.rgb(0,0,255); */
    
        var a = "#98F898"
        var b = "#006400"
        
        //顏色插值函式
        var computeColor = d3.interpolate(a,b);
        
        var colorValue = []
        
        for(var i=0; i<features.length; i++) {
            var name = features[i].properties.COUNTYNAME
            var value = features[i].properties.NUMBER
            colorValue[name] = value
        }
        
        svg.attr("fill", function(d, i){
            console.log(d)
            var t = linear( colorValue[d.properties.COUNTYNAME] ); 
            var color = computeColor(t);
            return color.toString();
        })
    })
})








