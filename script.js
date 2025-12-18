
// Make charts responsive to window resize
function updateChartDimensions() {
  const chartContainer = document.querySelector('.chart');
  if (!chartContainer) return;
  
  const containerWidth = chartContainer.clientWidth;
  
  // Update global dimensions
  if (window.innerWidth <= 480) {
    width = containerWidth - 40;
    height = 350;
    margin = { top: 50, right: 30, bottom: 60, left: 60 };
  } else if (window.innerWidth <= 768) {
    width = containerWidth - 60;
    height = 400;
    margin = { top: 55, right: 40, bottom: 70, left: 70 };
  } else if (window.innerWidth <= 1024) {
    width = containerWidth - 80;
    height = 450;
    margin = { top: 60, right: 50, bottom: 80, left: 80 };
  } else {
    width = 900;
    height = 600;
    margin = { top: 60, right: 120, bottom: 80, left: 100 };
  }
  
  // Re-render charts if on analysis page
  if (document.getElementById('analysis-page').classList.contains('active')) {
    renderScatterPlot();
    renderAttentionMap();
    renderVisitorsMap();
    if (typeof renderEventsChart !== 'undefined') {
      renderEventsChart();
    }
  }
}

// Add resize event listener
window.addEventListener('resize', updateChartDimensions);

// Also call it when loading the analysis page
function showAnalysis() {
  document.getElementById("landing-page").classList.remove("active");
  document.getElementById("analysis-page").classList.add("active");
  window.scrollTo(0, 0);
  
  // Update dimensions before loading charts
  updateChartDimensions();
  setTimeout(loadDataAndRenderCharts, 100);
}

/* ================= PAGE NAVIGATION ================= */

function showAnalysis() {
  document.getElementById("landing-page").classList.remove("active");
  document.getElementById("analysis-page").classList.add("active");
  window.scrollTo(0, 0);
  setTimeout(loadDataAndRenderCharts, 100);
}

function showLanding() {
  document.getElementById("analysis-page").classList.remove("active");
  document.getElementById("landing-page").classList.add("active");
  window.scrollTo(0, 0);
}

/* ================= D3 VISUALISATIONS ================= */
// Global variables
let data = [];
let width = 900;
let height = 600;
let margin = { top: 60, right: 120, bottom: 80, left: 100 };


// Load CSV data and render all charts
async function loadDataAndRenderCharts() {
    try {
        // Load CSV data using D3
        data = await d3.csv("data.csv", d3.autoType);
        
        // Check if data loaded correctly
        if (!data || data.length === 0) {
            throw new Error("No data loaded from CSV file");
        }
        
        console.log("Data loaded from CSV:", data);
        
        // Standardize column names (handle spaces in CSV headers)
        data = data.map(d => ({
            Country: d.Country || d["Country"],
            AttentionIndex: d["Attention Index"] || d["AttentionIndex"] || d.AttentionIndex,
            Population: d.Population,
            Visitors: d.Visitors || d.Vistors, // Note: "Vistors" vs "Visitors" in your data
            VisitorsPer100k: d["Visitors per 100k"] || d["VisitorsPer100k"] || d.VisitorsPer100k
        }));
        
        // Convert all numeric fields to numbers (in case autoType didn't work)
        data.forEach(d => {
            d.AttentionIndex = +d.AttentionIndex;
            d.Population = +d.Population;
            d.Visitors = +d.Visitors;
            d.VisitorsPer100k = +d.VisitorsPer100k;
        });
        
        console.log("Processed data:", data);
        
        // Render all charts
        renderScatterPlot();
        renderAttentionMap();
        renderVisitorsMap();
        renderEventsChart();
        
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('scatter-plot').innerHTML = 
            `<div style="text-align: center; padding: 20px;">
                <p style="color: red; margin-bottom: 10px;">Error loading data: ${error.message}</p>
                <p style="color: #666; font-size: 14px;">Please ensure:</p>
                <ul style="text-align: left; display: inline-block; color: #666;">
                    <li>data.csv file exists in the data/ folder</li>
                    <li>CSV format is correct</li>
                    <li>Column names match: Country, Attention Index, Population, Visitors, Visitors per 100k</li>
                </ul>
            </div>`;
    }
}

// Scatter Plot: Visitors per 100k vs Attention Index
function renderScatterPlot() {
    const container = document.getElementById('scatter-plot');
    container.innerHTML = "";
    
    // Create SVG
    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create scales with some padding
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AttentionIndex) * 1.05])
        .range([0, chartWidth])
        .nice();
    
    const yScale = d3.scaleLog()  // Using log scale because of large range in VisitorsPer100k
        .domain([1, d3.max(data, d => d.VisitorsPer100k) * 1.2])
        .range([chartHeight, 0])
        .nice();
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(d => d);
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(8, d => d.toLocaleString());
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);
    
    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 45)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("K-pop Attention Index");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -50)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Visitors per 100k Population (log scale)");
    
    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", chartWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "35px")
        .style("font-weight", "700")
        .text("K-pop Attention vs Visitors to South Korea");
    
    
    // Create size scale for circles based on total visitors
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Visitors)])
        .range([4, 25]);
    
    // Create color scale based on attention level
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, d3.max(data, d => d.AttentionIndex)]);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "12px")
        .style("font-family", "Source Sans 3, sans-serif")
        .style("font-size", "13px")
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("z-index", "1000");
    
    // Draw circles for each country
    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.AttentionIndex))
        .attr("cy", d => yScale(d.VisitorsPer100k))
        .attr("r", d => sizeScale(d.Visitors))
        .attr("fill", d => colorScale(d.AttentionIndex))
        .attr("opacity", 0.8)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Highlight this circle
            d3.select(this)
                .attr("opacity", 1)
                .attr("stroke", "#333")
                .attr("stroke-width", 2);
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            
            tooltip.html(`
                <div style="margin-bottom: 5px;">
                    <strong style="font-size: 14px; color: #2c3e50;">${d.Country}</strong>
                </div>
                <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 3px;">
                    <span style="display: inline-block; width: 120px;">Attention Index:</span>
                    <strong style="color: #2c3e50;">${d.AttentionIndex}</strong>
                </div>
                <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 3px;">
                    <span style="display: inline-block; width: 120px;">Visitors/100k:</span>
                    <strong style="color: #2c3e50;">${d.VisitorsPer100k.toLocaleString()}</strong>
                </div>
                <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 3px;">
                    <span style="display: inline-block; width: 120px;">Total Visitors:</span>
                    <strong style="color: #2c3e50;">${d.Visitors.toLocaleString()}</strong>
                </div>
                <div style="color: #7f8c8d; font-size: 12px;">
                    <span style="display: inline-block; width: 120px;">Population:</span>
                    <strong style="color: #2c3e50;">${d.Population.toLocaleString()}</strong>
                </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            // Restore circle appearance
            d3.select(this)
                .attr("opacity", 0.8)
                .attr("stroke", "white")
                .attr("stroke-width", 1.5);
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add country labels for interesting points
    const interestingCountries = ["China", "Taiwan", "Singapore", "Hong Kong", "Japan", "United States", "Thailand", "Philippines", "Vietnam"];
    
    svg.selectAll(".country-label")
        .data(data.filter(d => interestingCountries.includes(d.Country)))
        .enter()
        .append("text")
        .attr("class", "country-label")
        .attr("x", d => xScale(d.AttentionIndex) + sizeScale(d.Visitors) + 5)
        .attr("y", d => yScale(d.VisitorsPer100k) + 4)
        .text(d => d.Country)
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50")
        .style("text-shadow", "1px 1px 2px white");
    
    // Add trend line using linear regression
    addTrendLine(svg, xScale, yScale, chartHeight);
    
    // Add legend for circle sizes
    addSizeLegend(svg, chartWidth, chartHeight, sizeScale);
    
    // Add color legend
    addColorLegend(svg, chartWidth, chartHeight, colorScale);
}

// Add trend line to the scatter plot
function addTrendLine(svg, xScale, yScale, chartHeight) {
    // Simple linear regression
    const n = data.length;
    const sumX = d3.sum(data, d => d.AttentionIndex);
    const sumY = d3.sum(data, d => Math.log10(d.VisitorsPer100k));
    const sumXY = d3.sum(data, d => d.AttentionIndex * Math.log10(d.VisitorsPer100k));
    const sumX2 = d3.sum(data, d => d.AttentionIndex * d.AttentionIndex);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate line endpoints
    const x1 = 0;
    const y1 = Math.pow(10, slope * x1 + intercept);
    const x2 = d3.max(data, d => d.AttentionIndex);
    const y2 = Math.pow(10, slope * x2 + intercept);
    
    // Draw trend line
    svg.append("line")
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "#e74c3c")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0.7);
    
    // Add trend line label
    svg.append("text")
        .attr("x", xScale(x2) - 10)
        .attr("y", yScale(y2) - 10)
        .text("Trend line")
        .style("font-size", "11px")
        .style("fill", "#e74c3c")
        .style("font-weight", "600");
}

// Add legend for circle sizes
function addSizeLegend(svg, chartWidth, chartHeight, sizeScale) {
    const legendX = chartWidth + 20;
    const legendY = 20;
    
    // Legend title
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY)
        .text("Total Visitors")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50");
    
    // Legend sample sizes
    const sampleSizes = [10000, 100000, 1000000];
    
    sampleSizes.forEach((size, i) => {
        const y = legendY + 25 + i * 30;
        
        // Circle
        svg.append("circle")
            .attr("cx", legendX + 10)
            .attr("cy", y)
            .attr("r", sizeScale(size))
            .attr("fill", "#3498db")
            .attr("opacity", 0.7)
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 1);
        
        // Label
        svg.append("text")
            .attr("x", legendX + 25 + sizeScale(size))
            .attr("y", y + 4)
            .text(size.toLocaleString())
            .style("font-size", "11px")
            .style("fill", "#2c3e50");
    });
}

// Add color legend
function addColorLegend(svg, chartWidth, chartHeight, colorScale) {
    const legendX = chartWidth + 20;
    const legendY = 140;
    
    // Legend title
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY)
        .text("Attention Index")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50");
    
    // Create gradient for color legend
    const legendWidth = 150;
    const legendHeight = 15;
    
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");
    
    // Add color stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
        const offset = (i / numStops) * 100;
        const value = (d3.max(data, d => d.AttentionIndex) / numStops) * i;
        gradient.append("stop")
            .attr("offset", `${offset}%`)
            .attr("stop-color", colorScale(value));
    }
    
    // Draw gradient rectangle
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY + 15)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient)");
    
    // Add scale labels
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY + 35)
        .text("Low")
        .style("font-size", "10px")
        .style("fill", "#7f8c8d");
    
    svg.append("text")
        .attr("x", legendX + legendWidth)
        .attr("y", legendY + 35)
        .text("High")
        .style("font-size", "10px")
        .style("fill", "#7f8c8d")
        .style("text-anchor", "end");
}

// Map visualization: Global Distribution of K-pop Attention
function renderAttentionMap() {
    const container = document.getElementById('attention-map');
    container.innerHTML = "";
    
    // Create SVG
    const svg = d3.select("#attention-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Create a projection for world map
    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 2]);
    
    const path = d3.geoPath().projection(projection);
    
    // Create color scale for K-pop attention (darker = more attention)
    const attentionColorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(data, d => d.AttentionIndex)]);
    
    // Load world map data
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;
        
        // Draw base map with attention shading
        svg.selectAll(".country")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => {
                const countryData = findCountryData(d.properties.name);
                return countryData ? attentionColorScale(countryData.AttentionIndex) : "#f5f5f5";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.9)
            .on("mouseover", function(event, d) {
                const countryData = findCountryData(d.properties.name);
                if (countryData) {
                    d3.select(this)
                        .attr("stroke", "#333")
                        .attr("stroke-width", 2);
                    
                    showMapTooltip(event, countryData, d.properties.name);
                }
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5);
                hideMapTooltip();
            });
        
        // Add attention color legend
        addAttentionMapLegend(svg, width, height, attentionColorScale);
        
        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "35px")
            .style("font-weight", "700")
            .style("fill", "#010911ff")
            .text("Global Distribution of K-pop Attention");
        
    }).catch(error => {
        console.error("Error loading map data:", error);
        renderAlternativeAttentionMap();
    });
}

// Helper function to find country data for the map
function findCountryData(countryName) {
    // Handle country name variations between map data and CSV
    const countryVariations = {
        "United States of America": "United States",
        "United States": "United States",
        "USA": "United States",
        "UK": "United Kingdom",
        "United Kingdom": "United Kingdom",
        "Great Britain": "United Kingdom",
        "UAE": "United Arab Emirates",
        "United Arab Emirates": "United Arab Emirates",
        "Russia": "Russia",
        "Russian Federation": "Russia",
        "South Korea": "South Korea",
        "Korea, Republic of": "South Korea",
        "Korea, South": "South Korea",
        "North Korea": "North Korea",
        "Korea, Democratic People's Republic of": "North Korea",
        "Korea, North": "North Korea",
        "China": "China",
        "People's Republic of China": "China",
        "Hong Kong SAR China": "Hong Kong",
        "Hong Kong": "Hong Kong",
        "Taiwan": "Taiwan",
        "Taiwan, Province of China": "Taiwan",
        "Macao": "Macao",
        "Macau": "Macao",
        "Czechia": "Czech Republic",
        "Czech Republic": "Czech Republic",
        "Macedonia": "North Macedonia",
        "North Macedonia": "North Macedonia",
        "Bosnia and Herzegovina": "Bosnia Herzegovina",
        "Bosnia Herzegovina": "Bosnia Herzegovina",
        "Ivory Coast": "Côte d'Ivoire",
        "Côte d'Ivoire": "Côte d'Ivoire"
    };
    
    const normalizedName = countryVariations[countryName] || countryName;
    
    return data.find(d => 
        d.Country.toLowerCase() === normalizedName.toLowerCase() ||
        countryName.toLowerCase().includes(d.Country.toLowerCase()) ||
        d.Country.toLowerCase().includes(countryName.toLowerCase())
    );
}

// Add attention color legend for map
function addAttentionMapLegend(svg, width, height, colorScale) {
    const legendX = width - 200;
    const legendY = 100;
    const legendWidth = 180;
    const legendHeight = 15;
    
    // Create gradient for attention color legend
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "attention-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");
    
    // Add color stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
        const offset = (i / numStops) * 100;
        const value = (d3.max(data, d => d.AttentionIndex) / numStops) * i;
        gradient.append("stop")
            .attr("offset", `${offset}%`)
            .attr("stop-color", colorScale(value));
    }
    
    // Draw gradient rectangle
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#attention-gradient)")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5);
    
    // Add legend title
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY - 10)
        .text("K-pop Attention Index")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50");
    
    // Add scale labels
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY + 30)
        .text("Low (Light)")
        .style("font-size", "10px")
        .style("fill", "#7f8c8d");
    
    svg.append("text")
        .attr("x", legendX + legendWidth)
        .attr("y", legendY + 30)
        .text("High (Dark)")
        .style("font-size", "10px")
        .style("fill", "#7f8c8d")
        .style("text-anchor", "end");
}

// Show map tooltip
function showMapTooltip(event, countryData, countryName) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "map-tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "12px")
        .style("font-family", "Source Sans 3, sans-serif")
        .style("font-size", "13px")
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .html(`
            <div style="margin-bottom: 5px;">
                <strong style="font-size: 14px; color: #2c3e50;">${countryName}</strong>
            </div>
            <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 3px;">
                <span style="display: inline-block; width: 120px;">Attention Index:</span>
                <strong style="color: #2c3e50;">${countryData.AttentionIndex}</strong>
            </div>
            <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 3px;">
                <span style="display: inline-block; width: 120px;">Visitors/100k:</span>
                <strong style="color: #2c3e50;">${countryData.VisitorsPer100k.toLocaleString()}</strong>
            </div>
        `);
    
    tooltip.style("left", (event.pageX + 15) + "px")
           .style("top", (event.pageY - 28) + "px");
}

// Hide map tooltip
function hideMapTooltip() {
    d3.selectAll(".map-tooltip").remove();
}

// Alternative visualization if map data fails to load
function renderAlternativeAttentionMap() {
    const container = document.getElementById('attention-map');
    container.innerHTML = "";
    
    const svg = d3.select("#attention-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Create a simple bar chart of top 20 countries by attention
    const topCountries = [...data]
        .sort((a, b) => b.AttentionIndex - a.AttentionIndex)
        .slice(0, 20);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const xScale = d3.scaleBand()
        .domain(topCountries.map(d => d.Country))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(topCountries, d => d.AttentionIndex)])
        .range([height - margin.bottom, margin.top]);
    
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(topCountries, d => d.AttentionIndex)]);
    
    svg.selectAll("rect")
        .data(topCountries)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Country))
        .attr("y", d => yScale(d.AttentionIndex))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.AttentionIndex))
        .attr("fill", d => colorScale(d.AttentionIndex))
        .attr("opacity", 0.8);
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "35px")
        .style("font-weight", "700")
        .text("Top 20 Countries by K-pop Attention");
    
    // Add subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#7f8c8d")
        .text("Alternative visualization - World map data unavailable");
    
    addAttentionMapLegend(svg, width, height, colorScale);
}

// Visitors Map: Circle size represents visitors per capita
function renderVisitorsMap() {
    const container = document.getElementById('visitors-map');
    if (!container) return;
    
    container.innerHTML = "";
    
    const svg = d3.select("#visitors-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Create a projection for world map
    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 2]);
    
    const path = d3.geoPath().projection(projection);
    
    // Create size scale for visitors per capita circles
    const visitorsSizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.VisitorsPer100k)])
        .range([3, 40]); // Increased max size for better visibility
    
    // Load world map data
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;
        
        // Draw base map
        svg.selectAll(".country-base")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", "country-base")
            .attr("d", path)
            .attr("fill", "#f5f5f5")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5);
        
        // Add circles for visitors per capita
        data.forEach(d => {
            // Get country coordinates
            const coords = getCountryCoordinates(d.Country);
            if (coords) {
                const projectedCoords = projection(coords);
                if (projectedCoords) {
                    svg.append("circle")
                        .attr("cx", projectedCoords[0])
                        .attr("cy", projectedCoords[1])
                        .attr("r", visitorsSizeScale(d.VisitorsPer100k))
                        .attr("fill", "rgba(255, 140, 0, 0.7)") // Orange circles for visitors
                        .attr("stroke", "white")
                        .attr("stroke-width", 1.5)
                        .attr("class", "visitor-circle")
                        .style("cursor", "pointer")
                        .datum(d) // Attach data to circle
                        .on("mouseover", function(event, d) {
                            d3.select(this)
                                .attr("fill", "rgba(255, 69, 0, 0.9)")
                                .attr("stroke", "#333")
                                .attr("stroke-width", 2);
                            
                            showMapTooltip(event, d, d.Country);
                        })
                        .on("mouseout", function(event, d) {
                            d3.select(this)
                                .attr("fill", "rgba(255, 140, 0, 0.7)")
                                .attr("stroke", "white")
                                .attr("stroke-width", 1.5);
                            hideMapTooltip();
                        });
                }
            }
        });
        
        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "35px")
            .style("font-weight", "700")
            .style("fill", "#031324ff")
            .text("Visitors to South Korea per Capita");
        
        // Add legend for circle sizes
        const legendX = width - 200;
        const legendY = 100;
        
        // Legend title
        svg.append("text")
            .attr("x", legendX)
            .attr("y", legendY - 10)
            .text("Visitors per 100k")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", "#2c3e50");
        
        // Sample sizes for legend
        const sampleSizes = [100, 1000, 5000];
        
        sampleSizes.forEach((size, i) => {
            const y = legendY + 20 + i * 40;
            const radius = visitorsSizeScale(size);
            
            // Circle
            svg.append("circle")
                .attr("cx", legendX + 20)
                .attr("cy", y)
                .attr("r", radius)
                .attr("fill", "rgba(255, 140, 0, 0.7)")
                .attr("stroke", "#2c3e50")
                .attr("stroke-width", 1);
            
            // Label
            svg.append("text")
                .attr("x", legendX + 50)
                .attr("y", y + 4)
                .text(size.toLocaleString())
                .style("font-size", "11px")
                .style("fill", "#2c3e50");
        });
        
    }).catch(error => {
        console.error("Error loading map data for visitors map:", error);
        renderAlternativeVisitorsMap();
    });
}

// Helper function to get approximate country coordinates
function getCountryCoordinates(countryName) {
    // Approximate coordinates for countries in your dataset
    const countryCoordinates = {
        "Argentina": [-64, -34],
        "Australia": [133, -25],
        "Austria": [14, 47],
        "Bangladesh": [90, 24],
        "Belgium": [4, 50],
        "Brazil": [-55, -10],
        "Bulgaria": [25, 43],
        "Cambodia": [105, 13],
        "Canada": [-106, 56],
        "Chile": [-71, -30],
        "China": [105, 35],
        "Colombia": [-74, 4],
        "Denmark": [10, 56],
        "Egypt": [30, 27],
        "Finland": [26, 64],
        "France": [2, 46],
        "Germany": [10, 51],
        "Greece": [22, 39],
        "Hong Kong": [114, 22],
        "Hungary": [20, 47],
        "India": [79, 22],
        "Indonesia": [120, -5],
        "Ireland": [-8, 53],
        "Israel": [35, 31],
        "Italy": [12, 42],
        "Japan": [138, 36],
        "Kazakhstan": [68, 48],
        "Kyrgyzstan": [75, 41],
        "Malaysia": [112, 3],
        "Mexico": [-102, 23],
        "Morocco": [-7, 32],
        "Nepal": [84, 28],
        "Netherlands": [5, 52],
        "New Zealand": [174, -41],
        "Norway": [10, 62],
        "Pakistan": [69, 30],
        "Peru": [-76, -10],
        "Philippines": [122, 13],
        "Poland": [20, 52],
        "Portugal": [-8, 39],
        "Romania": [25, 46],
        "Russia": [100, 60],
        "Saudi Arabia": [45, 25],
        "Singapore": [104, 1],
        "South Africa": [24, -29],
        "Spain": [-4, 40],
        "Sri Lanka": [81, 7],
        "Sweden": [18, 62],
        "Switzerland": [8, 47],
        "Taiwan": [121, 24],
        "Thailand": [101, 15],
        "Ukraine": [32, 49],
        "United Arab Emirates": [54, 24],
        "United Kingdom": [-2, 54],
        "United States": [-98, 38],
        "Uzbekistan": [64, 41],
        "Vietnam": [106, 16]
    };
    
    return countryCoordinates[countryName] || null;
}

// Alternative visualization for visitors map
function renderAlternativeVisitorsMap() {
    const container = document.getElementById('visitors-map');
    container.innerHTML = "";
    
    const svg = d3.select("#visitors-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Create a bar chart of top 15 countries by visitors per capita
    const topCountries = [...data]
        .sort((a, b) => b.VisitorsPer100k - a.VisitorsPer100k)
        .slice(0, 15);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const xScale = d3.scaleBand()
        .domain(topCountries.map(d => d.Country))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(topCountries, d => d.VisitorsPer100k)])
        .range([height - margin.bottom, margin.top]);
    
    // Color scale based on visitors per capita
    const colorScale = d3.scaleSequential(d3.interpolateOranges)
        .domain([0, d3.max(topCountries, d => d.VisitorsPer100k)]);
    
    // Draw bars
    svg.selectAll("rect")
        .data(topCountries)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Country))
        .attr("y", d => yScale(d.VisitorsPer100k))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.VisitorsPer100k))
        .attr("fill", d => colorScale(d.VisitorsPer100k))
        .attr("opacity", 0.8);
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "35px")
        .style("font-weight", "700")
        .text("Top 15 Countries by Visitors per 100k");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#7f8c8d")
        .text("Alternative visualization - Larger bars = more visitors per capita");
}

// Visualization: Countries with notable K-Pop events vs visitor rates
function renderEventsChart() {
    const container = document.getElementById('events-chart');
    if (!container) return;
    
    container.innerHTML = "";
    
    const svg = d3.select("#events-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define major K-Pop events by country
    const kpopEvents = {
        "United States": [
            { year: "2012", event: "PSY - Gangnam Style viral" },
            { year: "2017", event: "BTS at AMAs debut" },
            { year: "2019", event: "BTS stadium tour" },
            { year: "2020", event: "Dynamite #1 Billboard" }
        ],
        "Japan": [
            { year: "2011", event: "KARA & SNSD Japan debut" },
            { year: "2015", event: "TWICE Japan debut" },
            { year: "2019", event: "BTS Dome Tour" }
        ],
        "China": [
            { year: "2014", event: "EXO-M Chinese subunit" },
            { year: "2016", event: "Korean content restrictions" },
            { year: "2020", event: "BTS China fanbase growth" }
        ],
        "Philippines": [
            { year: "2012", event: "K-Pop festivals start" },
            { year: "2018", event: "BTS concert sold out" }
        ],
        "Thailand": [
            { year: "2011", event: "2PM popularity surge" },
            { year: "2019", event: "BLACKPINK concert" }
        ],
        "France": [
            { year: "2011", event: "K-Pop flashmobs" },
            { year: "2019", event: "BTS Stade de France" }
        ]
    };
    
    // Filter data to only countries with defined events
    const countriesWithEvents = data.filter(d => kpopEvents[d.Country]);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleBand()
        .domain(countriesWithEvents.map(d => d.Country))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(countriesWithEvents, d => d.VisitorsPer100k)])
        .range([height - margin.bottom, margin.top]);
    
    // Create bars
    svg.selectAll("rect")
        .data(countriesWithEvents)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Country))
        .attr("y", d => yScale(d.VisitorsPer100k))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.VisitorsPer100k))
        .attr("fill", d => d.Country === "United States" ? "#e74c3c" : "#3498db")
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
            showEventTooltip(event, d, kpopEvents[d.Country]);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
            hideTooltip();
        });
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    
    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "35px")
        .style("font-weight", "700")
        .text("K-Pop Events Impact on Tourism");
    
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Country");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left - 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Visitors per 100k");
}

function showEventTooltip(event, countryData, events) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "event-tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "12px")
        .style("font-family", "Source Sans 3, sans-serif")
        .style("font-size", "13px")
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("max-width", "300px")
        .html(`
            <div style="margin-bottom: 8px;">
                <strong style="font-size: 14px; color: #2c3e50;">${countryData.Country}</strong>
            </div>
            <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">
                <span style="display: inline-block; width: 100px;">Visitors/100k:</span>
                <strong style="color: #2c3e50;">${countryData.VisitorsPer100k.toLocaleString()}</strong>
            </div>
            <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px;">
                <strong style="font-size: 12px; color: #2c3e50;">Major K-Pop Events Timeline:</strong>
            </div>
            <div style="margin-top: 5px;">
                ${events.map(e => `
                    <div style="margin-bottom: 4px; font-size: 11px;">
                        <span style="color: #e74c3c; font-weight: 600;">${e.year}:</span>
                        <span style="color: #2c3e50; margin-left: 5px;">${e.event}</span>
                    </div>
                `).join('')}
            </div>
        `);
    
    tooltip.style("left", (event.pageX + 15) + "px")
           .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    d3.selectAll(".event-tooltip").remove();
}


// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // If already on analysis page, load charts
    if (document.getElementById('analysis-page').classList.contains('active')) {
        loadDataAndRenderCharts();
    }
});

