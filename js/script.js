var frame = document.getElementById('frame');
var key = document.getElementById('key');
var chart;
var select_data = {};
var json_data = {};

var pymChild = new pym.Child();

var colors = [
  'rgba(46, 204, 113,0.33)',
  'rgba(241, 196, 15,0.33)',
  'rgba(231, 76, 60,0.33)'
];

var chart_datasets = [];

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function load_data(url, callback) {

  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var response = JSON.parse(request.responseText);
      callback(response);
      return response;

    } else {
      // We reached our target server, but it returned an error

    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();

};

// add options
var select = document.getElementById('school');

// Load schools data
load_data('schools.json', function(json) {

  select_data = json;

  for (var index in json) {

    var row = json[index];

    select.innerHTML = select.innerHTML + '<option value="' + row['DBN'] + '">' + row['School Name'] + '</option>';

  };

});

// Load Chart data
load_data('unique_data.json', function(json) {

  for (var index in json) {

    var row = json[index];
    var id = row['DBN'];
    var year = row['Cohort Year'];
    var value = row['% of cohort'];

    // if doesn't exist, create
    if ( !json_data[id] ) {
      json_data[id] = {
        'DBN': id,
        'School Name': row['School Name']
      };
    }

    json_data[id][year] = parseInt(value);

  };

  for ( var index in json_data ){

    var row = json_data[index];

    function exists(value) {

      return (value) ? value : null;

    };

    var dataset = {
      label: row['DBN'],
      fill: false,
      lineTension: 0.25,
      data: [exists(row['2005']), exists(row['2006']), exists(row['2007']), exists(row['2008']), exists(row['2009']), exists(row['2010']), exists(row['2011']), exists(row['2012'])],
      borderWidth: 1,
      spanGaps: true,
      pointRadius: 0,
      borderColor: '#ddd',
    };

    chart_datasets.push(dataset);

  };

  chart_datasets.push({
    label: 'Highlight',
    data: [null, null, null, null, null, null, 100, 100],
    fill: true,
    pointRadius: 0,
    borderColor: 'rgba(52, 152, 219, 0.1)',
    backgroundColor: 'rgba(52, 152, 219, 0.1)'
  });

  frame = frame.getContext('2d');

  frame.canvas.width = window.innerWidth - 20;
  frame.canvas.height = (window.innerHeight > 400) ? 400 : window.innerHeight;

  chart = new Chart(frame, {
      type: 'line',
      data: {
          labels: ["2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"],
          datasets: chart_datasets,
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        scales: {
          yAxes: [{
            gridLines: {
              color: '#eee',
              borderDash: [5]
            },
            scaleLabel : {
              display: true,
              labelString: "Graduation Rate",
              fontStyle: 'bold',
              fontSize: 16
            },
            ticks: {
              beginAtZero:true
            }
          }],
          xAxes: [{
            gridLines: {
              color: '#eee',
              borderDash: [5]
            },
            scaleLabel : {
              display: true,
              labelString: "Graduation Year",
              fontStyle: 'bold',
              fontSize: 16
            }
          }]
        }
      }
  });

  pymChild.sendHeight();

});

select.addEventListener("change", function(el) {

  // Find selected Ids
  var selected = select.options[select.selectedIndex].value;

  if ( selected == "All" ) {

    chart.data.datasets.map(function(row) {

      row.borderColor = "#ddd";
      row.borderWidth = 1;
      row.pointRadius = 0;

      return row;

    });

  } else {

    var comparables = select_data[selected]['Comparables'];
    comparables = comparables.split("'").join('"');
    comparables = JSON.parse(comparables);

    var color_index = 0;

    chart.data.datasets.map(function(row) {

      if ( comparables.indexOf(row.label) !== -1 ) {
        row.borderColor = colors[color_index];
        row.borderWidth = 5;
        row.pointRadius = 2;
        color_index++;
      } else {
        row.borderColor = "#ddd";
        row.borderWidth = 1;
        row.pointRadius = 0;
      };

      if ( row.label == selected ) {
        row.borderColor = "rgba(44, 62, 80,1.0)";
        row.borderWidth = 5;
        row.pointRadius = 2;
      };

      return row;

    });

    build_key(selected, comparables);

  };

  chart.update();
  pymChild.sendHeight();

});

function build_key(selected, comps) {

  var selected = json_data[selected];

  // set key html
  key.innerHTML = '<div class="key-row"><span class="block selected"></span> <strong>' + selected['School Name'] + '</strong></div>';

  var color_index = 0;

  comps.forEach( function(row) {
    row = json_data[row];
    key.innerHTML = key.innerHTML + '<div class="key-row"><span class="block comps" style="background: ' + colors[color_index] + ';"></span> ' + row['School Name'] + '</div>';
    color_index++;
  });

  pymChild.sendHeight();

};
