// Define the SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins 
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define the dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
    // will need to include this id in the html file
    .select('#kj_dataviz')
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a group to the SVG area and translate it to the right and down to adhere to the set margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Load json file 
d3.json("/yeargamedata3").then(function(gameData, err) {
    if (err) throw err;

    // Print the mergedData
    console.log(gameData);
    
    // // Parse datetime
    // var parseTime = d3.timeFormat("%Y-%m3-%d")

    // Format the data
    gameData.forEach(function(data) {
        data.Year = +data.Year;
        // data.datetime = parseTime(data.datetime);
        // data.players = +data.players;
        data["Twitch Users"] = +data["Twitch Users"]
    });
    
    genres = new Set ()
    gameData.forEach(function(data) {
        genres.add(data.Genre)
    })

    lineData = {}
    

    genres.forEach(g => {
        line = []
        gameData.forEach(d => {
            if (d.Genre == g) {
                line.push([d.Year, d["Twitch Users"]])
            }
        })
        lineData[g] = line
        // userData[g] = gameData.filter(d => {
        //     if (d.Genre == g) {
        //         return d["Twitch Users"]
        //     }
        // })
    })
    // console.log(genres)
    // console.log(lineData)
    



    // Group the data: one array for each value of the x axis
    var sumstat = d3.nest()
        .key(function(d) {
            return d.Year;
        })
        .entries(gameData);
    
    // Stack the data: each group will be represented on top of each other
    var gameViews = gameData[0]["Twitch Users"]
    var gameType = gameData[0]["Year"]
   
    var stackedData = d3.stack()
        .keys(gameType)
        .value(function(d, key) {
            console.log(key)
            console.log(d)
            return d.values[key]["Twitch Users"]
        })
        (sumstat)
    
    
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(gameData, d => d.Year))
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(gameData, d => d["Twitch Users"])])
        .range([height, 0]);

    // Create axes
    var xAxis = d3.axisBottom(xLinearScale).ticks(5);
    var yAxis = d3.axisLeft(yLinearScale);

    // // Color palette
    var color = d3.scaleOrdinal()
        .domain(gameViews)
        .range(["#03fca5", "#037bfc", "#ba03fc", "#fc9d03", "#0341fc"])

    // append axes
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    
    chartGroup.append("g")
        .call(yAxis);
    
    genres.forEach(g => {
        var line = d3.line()
            .x(d => xLinearScale(d[0]))
            .y(d => yLinearScale(d[1]));
        chartGroup.append("path")  // trouble area 
            .attr("fill", "none")
            // .attr("stroke", "blue")
            .attr("stroke-width", 5)
            .attr("d", line(lineData[g]));
    })


    
    // // Show the area
    chartGroup.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")  // trouble area
            .style("fill", function(d) {
                name = gameViews[d.key];
                console.log(name)
                return color(name);
            })
            .attr("d", d3.area()
                .x(function(d, i) {
                    console.log(d)
                    console.log(d.data)
                    console.log(d.data.key)
                    return x(d.data.key);
                })
                .y0(function(d) {
                    
                    return y(d[0]);
                })
                .y1(function(d) {
                    return y(d[1]);
                })
            )
     
 })
    

    