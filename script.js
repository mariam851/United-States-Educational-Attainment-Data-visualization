const svg = d3.select("svg");
const tooltip = d3.select("#tooltip");

const eduURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const mapURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([
  d3.json(mapURL),
  d3.json(eduURL)
]).then(function([mapData, eduData]) {

  const education = new Map();
  eduData.forEach(d => education.set(d.fips, d));

  const color = d3.scaleThreshold()
    .domain([10, 20, 30, 40])
    .range(["#cce5ff", "#66b3ff", "#1a75ff", "#0047b3", "#00264d"]);

  const path = d3.geoPath();

  const counties = topojson.feature(mapData, mapData.objects.counties).features;

  svg.selectAll("path")
    .data(counties)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", function(d) {
      let edu = education.get(d.id);
      return color(edu ? edu.bachelorsOrHigher : 0);
    })
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      let edu = education.get(d.id);
      return edu ? edu.bachelorsOrHigher : 0;
    })
    .on("mouseover", function(event, d) {
      let edu = education.get(d.id);
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px")
        .attr("data-education", edu ? edu.bachelorsOrHigher : 0)
        .html(
          edu ? `${edu.area_name}, ${edu.state}<br>${edu.bachelorsOrHigher}%` : "there is no data"
        );
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
    });

  
  const legend = svg.append("g").attr("id", "legend").attr("transform", "translate(600,20)");

  const legendScale = d3.scaleLinear().domain([10, 40]).range([0, 200]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues([10, 20, 30, 40])
    .tickFormat(d => d + "%");

  legend.selectAll("rect")
    .data(color.domain().map((d, i) => [d, color.domain()[i + 1] || 50]))
    .enter()
    .append("rect")
    .attr("x", d => legendScale(d[0]))
    .attr("y", 0)
    .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
    .attr("height", 10)
    .attr("fill", d => color(d[0]));

  legend.append("g")
    .attr("transform", "translate(0, 10)")
    .call(legendAxis);
});
