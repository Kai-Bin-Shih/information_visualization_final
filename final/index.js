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

// get data from github
async function getData() {
    var d = await d3.json("https://raw.githubusercontent.com/JanTan169/Information-Visualization-Final-Project/main/Earthquake.json");
    return d
}

// initialize
var dataList = []
updateAll()

// update
function updateAll() {

    let beginDate = document.querySelector('input[type="date"][id="beginDate"]');
    begin = beginDate.value;

    let endDate = document.querySelector('input[type="date"][id="endDate"]');
    end = endDate.value;

    // remove previous output
    d3.selectAll("path").remove()
    d3.selectAll("svg").remove()
    d3.selectAll("text").remove()

    // 這裡的data是全部的data
    getData().then(value => {
        let data = value
        console.log(getSelectedData(begin, end))
    
        Promise.all([
            d3.json(geo_path)
        ]).then(values => {
        
            let features = values[0].features;
        
            // for test----------------------------------
            for (i = features.length - 1 ; i >= 0 ; i--){
                features[i].properties.NUMBER = 50;
            }
            
            var projection = d3.geoMercator()
                                .center([121, 24])
                                .scale(height * 12)
                                .translate([width / 2, height / 2.5])

            let path = d3.geoPath().projection(projection);
            
            // svg
            let svg = d3.select("body")
                    .select("#svg-container")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)

            var layer1 = svg.append("g")
            var layer2 = svg.append("g")

            var mapGraph = layer1.selectAll('path')
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
                    

            var pointGraph = layer2.selectAll("circle")
                    .data(getSelectedData(begin, end))
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        return projection([d.EpicenterLon, d.EpicenterLat])[0];
                    })
                    .attr("cy", function(d) {
                        return projection([d.EpicenterLon, d.EpicenterLat])[1];
                    }) 
                    .style("fill", function(d) {
                        if(parseFloat(d.MagnitudeValue) <= 3) {
                            return "#55AA00";
                        } else if (parseFloat(d.MagnitudeValue) > 3 && parseFloat(d.MagnitudeValue) <= 4) {
                            return "#227700"; 
                        } else if (parseFloat(d.MagnitudeValue) > 4 && parseFloat(d.MagnitudeValue) <= 5) {
                            return "#FFCC22";
                        } else if (parseFloat(d.MagnitudeValue) > 5 && parseFloat(d.MagnitudeValue) <= 6) {
                            return "#EE7700";
                        } else {
                            return "#CC0000";
                        }
                    })
                    .attr("r", 2)
            
            var pointGroup = ["<=3", "3~4", "4~5", "5~6", ">6"]
            var pointColorGroup = ["#55AA00", "#227700", "#FFCC22", "#EE7700", "#CC0000"]

            var pointLabel = layer2.selectAll("rect")
                    .data(pointGroup)
                    .enter()
                    .append("circle")
                    .attr("cx", 80)
                    .attr("cy", function(d,i){ return 10 + i * 25})
                    .attr("r", 7)
                    .style("fill", function(d,i){ return pointColorGroup[i]})

            var pointText = layer2.selectAll("text")
                    .data(pointGroup)
                    .enter()
                    .append("text")
                    .attr("x", 80 + 20*.8)
                    .attr("y", function(d,i){ return 11 + i * 25})
                    .style("fill", function(d,i){ return pointColorGroup[i]})
                    .text(function(d){ return d})
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    
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
        
            var a = "#AAAAAA"
            var b = "#444444"
            
            //顏色插值函式
            var computeColor = d3.interpolate(a,b);
            
            var colorValue = []
            
            for(var i=0; i<features.length; i++) {
                var name = features[i].properties.COUNTYNAME
                var value = features[i].properties.NUMBER
                colorValue[name] = value
            }
            
            mapGraph.attr("fill", function(d, i){
                //console.log(d)
                var t = linear( colorValue[d.properties.COUNTYNAME] ); 
                var color = computeColor(t);
                return color.toString();
            })
        })
    
        // get selected data by date
        function getSelectedData(begin, end) {
            
            let beginDate = new Date(begin);
            let endDate = new Date(end);

            dataList = []
            var currentDate = ""
            for(index in data) {
                var d = data[index].Year + "-" + data[index].Month + "-" + data[index].Day;
                let date = new Date(d);
                if(date.getTime() >= beginDate.getTime() && date.getTime() <= endDate.getTime()) {
                    dataList.push(data[index]);
                } else {
                    continue;
                }
                
            }
            return dataList;
        }
    
        
    })
}

function autoUpdate(begin, end) {
    let beginDate = new Date(begin)
    
}

function addOneDay(date, days){
    var res = new Date(date);
    res.setDate(res.getDate() + days);
    return res;
}








