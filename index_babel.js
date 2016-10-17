'use strict';

angular.module('ar', []).controller('main', ['$http', '$location', function ($http, $location) {

  var vm = this;
  vm.sortBy = 'count';
  vm.chart = {};

  function activate() {

    var url = '57fp60_comments.json';

    $http.get(url).then(function (res) {
      return res.data;
    }).then(function (comments) {
      vm._comments = comments;

      var all = {};
      comments.forEach(function (comment) {
        if (!(comment.author in all)) {
          all[comment.author] = {
            count: 1,
            author: comment.author,
            score: comment.score,
            average: comment.score,
            max: comment.score,
            maxlink: comment.link,
            checked: false
          };
        } else {
          var rec = all[comment.author];
          rec.count += 1;
          rec.score += comment.score;
          rec.max = Math.max(rec.max, comment.score);
          rec.average = rec.score / rec.count;
          if (rec.max === comment.score) {
            rec.maxlink = comment.link;
          }
        }
      });

      vm.comments = _.toArray(all);
      vm.sortComments();

      vm.grouped = {};
      comments.forEach(function (comment) {
        vm.grouped[comment.author] = vm.grouped[comment.author] || {
          id: comment.author,
          author: comment.author,
          comments: []
        };
        var rec = vm.grouped[comment.author];
        rec.comments.push(comment);
      });

      vm.groupComments();

      for (var ii = 0; ii < 5; ii++) {
        vm.comments[ii].checked = true;
      }

      vm.drawChart();
    });

    initChart();
  }

  vm.sortComments = function () {
    if (vm.sortBy === 'author') {
      vm.comments = _.orderBy(vm.comments, function (x) {
        return x.author.toLowerCase();
      }, 'asc');
    } else {
      vm.comments = _.orderBy(vm.comments, vm.sortBy, 'desc');
    }
  };

  vm.groupComments = function () {

    var min = moment(new Date(_.min(vm._comments.map(function (c) {
      return c.created;
    })))).round(60, 'minutes');
    var max = min.clone().add(1, 'day');

    _.each(vm.grouped, function (user) {
      user.values = {};
      user.comments.forEach(function (comment) {
        var created = moment(new Date(comment.created)).round(60, 'minutes');
        var key = created.toDate().getTime();
        if (!user.values[key]) {
          user.values[key] = {
            date: created.toDate(),
            count: 1
          };
        } else {
          user.values[key].count += 1;
        }
      });
      var cur = min.clone();
      while (cur < max) {
        if (!user.values[cur.toDate().getTime()]) {
          user.values[cur.toDate().getTime()] = {
            date: cur.toDate(),
            count: 0
          };
        }
        cur = cur.add(60, 'minutes');
      }
      user.values = _.sortBy(_.toArray(user.values), 'date');
    });
  };

  function initChart() {
    var margin = { top: 20, right: 80, bottom: 50, left: 100 };
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scaleTime().range([0, width]);
    var xAxis = d3.axisBottom(x);
    var y = d3.scaleLinear().range([height, 0]);
    var yAxis = d3.axisLeft(y);
    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#archart').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xAxisSvg = svg.append('g').attr('class', 'x axis ticks').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    var yAxisSvg = svg.append('g').attr('class', 'y axis').call(yAxis);

    var line = d3.line().x(function (d) {
      return x(d.date);
    }).y(function (d) {
      return y(d.count);
    });

    vm.chart.x = x;
    vm.chart.xAxis = xAxis;
    vm.chart.xAxisSvg = xAxisSvg;
    vm.chart.y = y;
    vm.chart.yAxis = yAxis;
    vm.chart.yAxisSvg = yAxisSvg;
    vm.chart.svg = svg;
    vm.chart.margin = margin;
    vm.chart.line = line;
    vm.chart.colors = colors;
  }

  vm.drawChart = function () {
    var data = [];
    vm.comments.forEach(function (c) {
      if (c.checked) {
        data.push(_.cloneDeep(vm.grouped[c.author]));
      }
    });
    console.log(data);

    var chart = vm.chart;
    var minDate = d3.min(vm._comments, function (c) {
      return new Date(c.created);
    });
    var maxDate = moment(minDate).add(1, 'day').toDate();

    chart.x.domain([minDate, maxDate]);
    chart.y.domain([0, d3.max(data, function (d) {
      return d3.max(d.values, function (g) {
        return g.count;
      });
    })]);
    chart.colors.domain(data.map(function (d) {
      return d.id;
    }));

    chart.xAxisSvg.call(chart.xAxis);
    chart.yAxisSvg.call(chart.yAxis);

    var users = chart.svg.selectAll('.users').data(data);

    users.exit().remove();
    var newUsers = users.enter().append('g').attr('class', 'users');
    newUsers.append('path').call(path);
    newUsers.append('text').call(label);
    var mUsers = users.merge(users);
    mUsers.select('path').call(path);
    mUsers.select('text').call(label);

    function path(selection) {
      selection.attr('class', 'line').attr('d', function (d) {
        return chart.line(d.values);
      }).style('stroke', function (d) {
        return chart.colors(d.id);
      });
    }

    function label(selection) {
      selection.datum(function (d) {
        return { id: d.id, value: d.values[0] };
      }).attr('transform', function (d) {
        return 'translate(' + chart.x(d.value.date) + ',' + chart.y(d.value.count) + ')';
      }).attr('x', 3).attr('dy', '0.1em').style('font', '10px sans-serif').style('fill', function (d) {
        return chart.colors(d.id);
      }).text(function (d) {
        return d.id;
      });
    }
  };

  vm.checkClicked = function (evt, comment) {
    evt.stopPropagation();
  };
  vm.rowClicked = function (comment) {
    comment.checked = !comment.checked;
    vm.drawChart();
  };

  activate();
}]);
