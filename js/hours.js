var margin = {top: 20, right: 120, bottom: 30, left: 0},
    width = 880 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    barWidth = Math.floor(width / 15) - 1;

var x = d3.scale.linear()
    .range([barWidth / 2, width - barWidth / 2]);

var y = d3.scale.linear()
    .range([height, 0]);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickSize(-width)
    .ticks(4)
    .tickFormat(function(d) { return d; });

// An SVG element with a bottom-right origin.
var svg = d3.select(".histo").selectAll("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// A sliding container to hold the bars by hours.
var hours = svg.append("g")
    .attr("class", "hours");

d3.csv("/js/data.csv", function(error, data) {

  // Convert strings to numbers.
  data.forEach(function(d) {
    d.date = +d.Date;
    d.hour = +d.Comparison_Type;
  });

  data = data.sort(function (a, b) {
    return b.date - a.date;
  }).slice(0, 14);
  data.reverse();

  // Update the scale domains.
  x.domain([0, 14]);
  y.domain([0, 10]);

  // Add an axis to show the population values.
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

  var rects = hours.selectAll("rect")
      .data(data)
    .enter().append("rect")
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("transform", function(d, i) { return "translate(" + x(i) + ", " + height + ")"; })
      .attr("data-title", function(d) { return d.hour + " hours"; });

  // Add labels to show hours.
  hours.selectAll("text")
      .data(data)
      .enter().append("text")
      .attr("class", "date")
      .text(function(hours) { return date_format(hours.date); })
      .attr("transform", function(d, i) { return "translate(" + (x(i) + 10) + "," + (height + 20) + ")"; });

$("rect").tooltip({container: 'body', html: true, placement:'top'}); 

  var sum = 0;
  for (var i = 7; i < 14; i++) {
        sum += data[i].hour;
  }

  function week_count(d) {
    var parseDate = d3.time.format("%Y%m%d").parse;
    return d3.time.weekOfYear(parseDate(d.date.toString()));
  }
  var this_week = week_count(data[13]);
  var last_week = this_week - 1;

  var sum_last = 0;
  var sum_this = 0;
  for (var i = 0; i < 14; i++) {
    var current_week = week_count(data[i]);
    if (current_week == this_week)
      sum_this += data[i].hour;
    if (current_week == last_week)
      sum_last += data[i].hour;
  }

  svg.append("text")
     .attr("transform", "translate(0,20)")
     .text("Last 7 days: " + sum + " hours.");

  svg.append("text")
     .attr("transform", "translate(0,40)")
     .text("Last week: " + sum_last + " hours.");

  svg.append("text")
     .attr("transform", "translate(0,60)")
     .text("This week: " + sum_this + " hours.");

   show();
});

function show() {
  d3.selectAll("rect").transition()
       .duration(500)
       .delay(function(d, i) {return (14 - i) * 50 + 1000; })
       .attr("transform", function(d, i) { return "translate(" + x(i) + "," + y(d.hour) + ")"; })
       .attr("height", function(d) { return height - y(d.hour); })
}

function date_format(date) {
  var month_string = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  date = date + 0;
  var month = Math.floor(date / 100) % 100 - 1;
  var day = date % 100;
  return month_string[month] + ". " + day;
}

