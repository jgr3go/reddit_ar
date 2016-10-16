angular
  .module('ar', [])
  .controller('main', ["$http", function ($http) {

    let vm = this;
    vm.sortBy = 'count';
    vm.chart = {};

    function activate() {

      $http.get('/57fp60_comments.json')
        .then(res => res.data)
        .then(comments => {
          vm._comments = comments;
          
          let all = {};
          comments.forEach(comment => {
            if (!(comment.author in all)) {
              all[comment.author] = {
                count: 1,
                author: comment.author,
                score: comment.score,
                average: comment.score,
                max: comment.score,
                maxlink: comment.link,
                checked: false,
              };
            } else {
              let rec = all[comment.author];
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
          comments.forEach(comment => {
            vm.grouped[comment.author] = vm.grouped[comment.author] || {
              author: comment.author,
              comments: []
            };
            let rec = vm.grouped[comment.author];
            rec.comments.push(comment);
          });

          vm.groupComments();

          for (let ii = 0; ii < 5; ii++) {
            vm.comments[ii].checked = true;
          }

          vm.drawChart();

        });

        initChart();

      }

      vm.sortComments = function () {
        if (vm.sortBy === 'author') {
          vm.comments = _.orderBy(vm.comments, x => x.author.toLowerCase(), 'asc');
        } else {
          vm.comments = _.orderBy(vm.comments, vm.sortBy, 'desc');
        }
      };

      vm.groupComments = function () {
        _.each(vm.grouped, user => {
          delete user.grouped;
          user.grouped = {};
          user.comments.forEach(comment => {
            let key = moment(new Date(comment.created)).round(60, 'minutes');
            if (!user.grouped[key]) {
              user.grouped[key] = {
                date: key.toDate(),
                count: 1
              };
            } else {
              user.grouped[key].count += 1;
            }
          });
          user.grouped = _.sortBy(_.toArray(user.grouped), 'date');
        });
      };

      function initChart() {
        let margin = {top: 20, right: 30, bottom: 50, left: 100};
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;

        let x = d3.scaleTime().range([0, width]);
        let xAxis = d3.axisBottom(x);
        let y = d3.scaleLinear().range([height, 0]);
        let yAxis = d3.axisLeft(y);
        let colors = d3.scaleOrdinal(d3.schemeCategory20c);

        let svg = d3.select('#archart')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        let xAxisSvg = svg.append('g')
          .attr('class', 'x axis ticks')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis);
        let yAxisSvg = svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis); 

        let line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.count));

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

      vm.drawChart = function() {
        let data = [];
        vm.comments.forEach(c => {
          if (c.checked) {
            data.push(_.cloneDeep(vm.grouped[c.author]));
          }
        });

        let chart = vm.chart;
        let minDate = d3.min(vm._comments, c => new Date(c.created));
        let maxDate = moment(minDate).add(1, 'day').toDate();
        
        chart.x.domain([minDate, maxDate]);
        chart.y.domain([
          0,
          d3.max(data, d => d3.max(d.grouped, g => g.count))
        ]);
        chart.colors.domain(data.map(d => d.author));

        chart.xAxisSvg.call(chart.xAxis);
        chart.yAxisSvg.call(chart.yAxis);

        let users = chart.svg.selectAll('.users')
          .data(data);

        users.enter()
            .append('g')
              .attr('class', 'users')
            .append('path')
              .attr('class', 'line')
              .attr('d', d => chart.line(d.grouped))
              .style('stroke', d => chart.colors(d.author));
        users.exit().remove();

      }

      vm.checkClicked = function (evt, comment) {
        evt.stopPropagation();
      };
      vm.rowClicked = function (comment) {
        comment.checked = !comment.checked;
        vm.drawChart();
      };

      activate();

  }]);