let EVENTS = [];

angular
  .module('ar', ['ui.router'])
  .config(['$stateProvider', function ($sp) {
    
    $sp.state({
      name: 'Calendar',
      templateUrl: 'calendar.html',
      controller: 'calendar',
      controllerAs: 'CC'
    });

  }])
  .run(['$http', '$stateRegistry', function ($http, $stateRegistry) {
    $http.get('events.txt')
      .then(res => res.data)
      .then(res => {

        let lines = res.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (!line) { continue; }

          let split = line.split('|');
          EVENTS.push({
            name: split[0].trim(),
            date: split[1].trim()
          });

          $stateRegistry.register({
            name: split[0].trim(),
            templateUrl: 'event.html',
            controller: 'event',
            controllerAs: 'EC'
          });
        }
      });
  }])
  .controller('calendar', ['$http', function($http) {
    let vm = this;

    function init() {
      vm.events = [];

      for (let evt of EVENTS) {
        vm.events.push({
          name: evt.name,
          date: moment(evt.date).format('MMM D, YYYY'),
          state: evt.name
        });
      }
    }

    init();
  }])
  .controller('event', ['$http', '$state', '$timeout', function ($http, $state, $timeout) {
    let vm = this;

    vm.tab = 'start';

    function init() {
      $http.get($state.$current.name.split(' ').join('').toLowerCase() + '.txt')
        .then(res => res.data)
        .then(res => {
          let event = parseFile(res);
          console.log(event);
          vm.event = event;

          vm.next = {
            date: event.date,
            name: event.name.toUpperCase()
          };

          vm.event.date = moment(new Date(vm.event.date)).format('MMM D, YYYY');
        });
    }

    function parseFile(data) {
      let lines = data.split('\n');

      let event = {
        name: lines[0].trim(),
        date: new Date(lines[1].trim()),
        leagues: [],
        h2h: []
      };

      lines.splice(0, 2);

      let curLeague = {};
      
      let ii;
      for (ii = 0; ii < lines.length; ii++) {
        let line = lines[ii].trim();
        if (!line) { continue; }
        if (line === '=====') {
          break;
        }

        if (line[0] === '#') {
          curLeague = {
            name: line.match(/\#\s*(.*)/)[1].trim(),
            entrants: []
          };
          event.leagues.push(curLeague);
          continue;
        }
        curLeague.entrants.push(parseUser(line));
      }

      let curh2h = {entrants: []};
      for (ii = ii+1; ii < lines.length; ii++) {
        let line = lines[ii].trim();
        if (line[0] === '#') { continue; }
        if (!line) {
          event.h2h.push(curh2h);
          curh2h = {
            entrants: []
          };
          continue;
        }

        curh2h.entrants.push(parseUser(line));
      }

      for (let league of event.leagues) {
        league.entrants = _.reverse(_.sortBy(league.entrants, 'VDOT'));
        let lane = 1;
        for (let e of league.entrants) {
          e.lane = lane++;
        }
      }
      for (let h2h of event.h2h) {
        h2h.entrants = _.reverse(_.sortBy(h2h.entrants, 'VDOT'));
        let lane = 1;
        for (let e of h2h.entrants) {
          e.lane = lane++;
        }
      }
      return event;
    }

    function parseUser(line) {
      let split = line.split('|');
      return {
        user: split[0].trim(),
        link: `https://reddit.com/u/${split[0].trim()}`,
        VDOT: split[1] ? parseFloat(split[1]) : 0,
        note: split[2] || '',
      };
    }

    vm.changeTab = function (tab) {
      vm.tab = tab;
    };

    init();

  }])
  .controller('main', ['$http', '$location', '$timeout', '$state', 
    function ($http, $location, $timeout, $state) {

      let vm = this;

      vm.next = {
        name: 'MOOSEFONTAINE CLASSIC',
        date: moment('2017-05-27'),
        displayDate: moment('2017-05-27').format('MMM D, YYYY')
      };

      function init() {
        countdown();
        $state.go('Calendar');
      }

      function countdown() {
        let now = moment();
        let evt = moment(vm.next.date);
        let days = evt.diff(now, 'days');
        vm.next.days = days;
        evt.subtract(days, 'days');
        let hours = evt.diff(now, 'hours');
        vm.next.hours = hours;
        evt.subtract(hours, 'hours');
        let minutes = evt.diff(now, 'minutes');
        vm.next.minutes = minutes;

        $timeout(countdown, 1000 * 60);
      }


      let lastState;
      let crumbs = [];
      vm.getBreadcrumbs = function() {
        if ($state.$current.name === lastState) {
          return crumbs;
        }
        lastState = $state.$current.name;
        crumbs = [];
        if (lastState !== 'Calender') {
          crumbs = [
            {name: 'Home', last: false, link: 'Calendar'},
            {name: lastState, last: true }
          ];
        } else {
          crumbs = [
            {name: 'Home', last: true}
          ];
        }
        return crumbs;
      }

      init();
    }
  ]);