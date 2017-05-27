// to prevent this loading twice in dev - hacky hacky whatever shut your face

if (!window.apploaded) {

window.apploaded = true;

let BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';

if (window.location.href.match(/localhost/)) {
  BASE = '';
}


angular
  .module('ar', ['ui.router'])
  .config(['$stateProvider', '$sceDelegateProvider', '$urlRouterProvider', '$locationProvider', function ($sp, $sce, $url, $loc) {
    $sce.resourceUrlWhitelist([
      'self',
      `${BASE}**`
    ]);

    $url.deferIntercept();

    $sp.state({
      name: 'Calendar',
      templateUrl: `${BASE}calendar.html`,
      controller: 'calendar',
      url: '/calendar',
      controllerAs: 'CC'
    });

    $url.otherwise('/calendar');

  }])
  .run(['$http', '$stateRegistry', '$urlRouter', 'Events', function ($http, $stateRegistry, $urlRouter, Events) {
      
    return Events.list()
      .then(evts => {
        for (let evt of evts) {
          $stateRegistry.register({
            name: evt.name,
            templateUrl: `${BASE}event.html`,
            controller: 'event',
            url: evt.url + "?tab",
            params: {
              tab: {dynamic: true}
            },
            controllerAs: 'EC'
          });
        }

        // after registering states, listen on the router
        $urlRouter.sync();
        $urlRouter.listen();

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
              url: '/' + split[0].trim().split(' ').join('').toLowerCase(),
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
              state: evt.state,
              displayDate: moment(evt.date).format('MMM D, YYYY'),
              live: false
            };
          });


        countdown();
      }

      function countdown() {
        if (vm.next) {
          let now = moment();
          let evt = moment(vm.next.date);

          if (now.format('YYYY-MM-DD') === evt.format('YYYY-MM-DD')) {
            vm.next.live = true;
          } else {
            let days = evt.diff(now, 'days');
            vm.next.days = days;
            evt.subtract(days, 'days');
            let hours = evt.diff(now, 'hours');
            vm.next.hours = hours;
            evt.subtract(hours, 'hours');
            let minutes = evt.diff(now, 'minutes');
            vm.next.minutes = minutes;
          }
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
  .controller('event', ['$http', '$state', '$timeout', '$location', '$anchorScroll', '$stateParams',
    function ($http, $state, $timeout, $location, $anchorScroll, $params) 
    {
    
      let vm = this;

      vm.tab = 'start';

      $anchorScroll.yOffset = 60;

      function init() {
        if ($params.tab) {
          vm.tab = $params.tab;
        }

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

            $timeout($anchorScroll);
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

        let points = 8;
        let place = 1;
        let prev;
        _.orderBy(list, ['time', 'user']).map(li => {
          if (li.time && points) {
            // there's a tie
            if (prev && prev.time === li.time) {
              li.heatPlace = prev.heatPlace;
              li.heatPoints = prev.heatPoints;
            } else {
              li.heatPlace = place;
              li.heatPoints = points;
            }
            prev = li;
            place += 1;
            if (points) {
              points -= 1;
            }
          } 
        })

        return list;
      }

      function getWinners(allUsers) {
        allUsers = _.toArray(allUsers);

        let winners = _.orderBy(allUsers, ['time', 'user']);

        let points = 99;
        let place = 1;
        let prev;
        for (let winner of winners) {
          if (winner.time && points) {
            if (prev && prev.time === winner.time) {
              winner.points = prev.points;
              winner.place = prev.place;
            } else {
              winner.points = points;
              winner.place = place;
            }
            prev = winner;
            place += 1;
            if (points) {
              points -= 1;
            }
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
          time: split[3] ? split[3].trim() : null,
          strava: split[4] ? split[4].trim() : null,
        };
      }

      vm.changeTab = function (tab) {
        vm.tab = tab;
        $state.go($state.$current.name, {tab});
      };

      vm.scrollTo = function (league) {
        $location.hash(league.anchor);
        $anchorScroll();
      };

      init();
    }
  ])
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