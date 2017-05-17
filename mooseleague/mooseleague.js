// to prevent this loading twice in dev - hacky hacky whatever shut your face

if (!window.apploaded) {

window.apploaded = true;

let BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';

if (window.location.href.match(/localhost/)) {
  BASE = '';
}


angular
  .module('ar', ['ui.router'])
  .config(['$stateProvider', '$sceDelegateProvider', function ($sp, $sce) {
    $sce.resourceUrlWhitelist([
      'self',
      `${BASE}**`
    ]);


    $sp.state({
      name: 'Calendar',
      templateUrl: `${BASE}calendar.html`,
      controller: 'calendar',
      controllerAs: 'CC'
    });

  }])
  .factory('Events', ['$http', '$q', function ($http, $q) {
    let EVENTS = [];
    let svc = {};
    svc.list = function() {
      if (!EVENTS.length) {
        return $http.get(`${BASE}events.txt`)
        .then(res => res.data)
        .then(res => {
          EVENTS = [];

          let lines = res.split('\n');
          for (let line of lines) {
            line = line.trim();
            if (!line) { continue; }

            let split = line.split('|');
            EVENTS.push({
              name: split[0].trim(),
              date: split[1].trim(),
              state: split[0].trim(),
              events: split[2].trim(),
              link: split[3].trim()
            });
          }

          return EVENTS;
        });   
      } else {
        return $q.when(EVENTS);
      }
    };

    svc.latest = function() {
      return svc.list()
        .then(evts => {
          return evts[evts.length - 1];
        });
    };

    return svc;
  }])
  .run(['$http', '$stateRegistry', 'Events', function ($http, $stateRegistry, Events) {
      
    return Events.list()
      .then(evts => {
        for (let evt of evts) {
          $stateRegistry.register({
            name: evt.name,
            templateUrl: `${BASE}event.html`,
            controller: 'event',
            controllerAs: 'EC'
          });
        }
      });
  }])
  .controller('calendar', ['$http', 'Events', function($http, Events) {
    let vm = this;

    function init() {
      vm.events = [];

      return Events.list()
        .then(evts => {
          for (let evt of evts) {
            evt = _.clone(evt);
            evt.date = moment(evt.date).format('MMM D, YYYY');
            vm.events.push(evt);
          }
        });
    }

    init();
  }])
  .controller('main', ['$http', '$location', '$timeout', '$state', 'Events',
    function ($http, $location, $timeout, $state, Events) {

      let vm = this;

      function init() {
        Events.list()
          .then(evts => {
            vm.events = evts;
          });

        Events.latest()
          .then(evt => {
            console.log(evt);
            vm.next = {
              name: evt.name.toUpperCase(),
              date: moment(evt.date),
              displayDate: moment(evt.date).format('MMM D, YYYY')
            };
          });


        countdown();
        $state.go('Calendar');
      }

      function countdown() {
        if (vm.next) {
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
        } else {
          $timeout(countdown, 500);
        }
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
  ])
  .controller('event', ['$http', '$state', '$timeout', function ($http, $state, $timeout) {
    let vm = this;

    vm.tab = 'start';

    function init() {
      let filename = $state.$current.name.split(' ').join('').toLowerCase() + '.txt';
      $http.get(BASE + filename)
        .then(res => res.data)
        .then(res => {
          let event = parseFile(res);
          console.log(event);
          vm.event = event;
          vm.event.file = filename;

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
        date: moment(lines[1].trim()),
        events: lines[2].trim(),
        leagues: [],
        h2h: []
      };

      lines.splice(0, 3);

      let curLeague = {};
      let allUsers = {};

      let ii;
      for (ii = 0; ii < lines.length; ii++) {
        let line = lines[ii].trim();
        if (!line) { continue; }
        if (line === '=====') {
          break;
        }

        if (line[0] === '#') {
          let name = line.match(/\#\s*(.*)/)[1].trim(); 
          curLeague = {
            name: name,
            anchor: name.split(' ').join('').toLowerCase(),
            entrants: [],
            winners: []
          };
          event.leagues.push(curLeague);
          continue;
        }

        let user = parseUser(line);
        if (!allUsers[user.user.toLowerCase()]) {
          allUsers[user.user.toLowerCase()] = user;
        }
        curLeague.entrants.push(user);
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

        let user = parseUser(line);
        if (!allUsers[user.user.toLowerCase()]) {
          allUsers[user.user.toLowerCase()] = user;
        }
        curh2h.entrants.push(user);
      }

      for (let league of event.leagues) {
        league.entrants = sortAndLane(league.entrants);
      }
      for (let h2h of event.h2h) {
        h2h.entrants = sortAndLane(h2h.entrants);
      }

      event.winners = getWinners(allUsers);

      return event;
    }

    function sortAndLane(list) {
      list = _.orderBy(list, ['VDOT', 'user'], ['desc', 'asc']);
      let lane = 1;
      for (let e of list) {
        e.lane = lane++;
      }
      return list;
    }

    function getWinners(allUsers) {
      allUsers = _.toArray(allUsers);

      let winners = _.orderBy(allUsers, ['time', 'user']);

      let points = 8;
      for (let winner of winners) {
        if (winner.time) {
          winner.points = points;

          if (points !== 0) { points--; }
        }
      }

      return winners;
    }

    function parseUser(line) {
      let split = line.split('|');
      return {
        user: split[0].trim(),
        link: `https://reddit.com/u/${split[0].trim()}`,
        VDOT: split[1] ? parseFloat(split[1]) : 0,
        note: split[2] || '',
        time: split[3] ? split[3].trim() : null
      };
    }

    vm.changeTab = function (tab) {
      vm.tab = tab;
    };

    init();

  }])
  .directive('fixedTop', ['$window', function ($window) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs, ctrl) {

        let $win = angular.element($window);
        let fixed = parseInt(attrs.fixedTop) || 50;

        $win.on('scroll', e => {
          let width = Math.max(window.innerWidth, document.documentElement.clientWidth);
          if (width < 550 || $window.pageYOffset < fixed) {
            elem.css({position: 'relative', top: '' });
          } else {
            elem.css({position: 'relative', top: ($window.pageYOffset - fixed) + 'px' });
          }
        });
      }
    };
  }]);



}