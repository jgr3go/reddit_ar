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

    $sp.state({
      name: 'Leaderboard',
      templateUrl: `${BASE}leaderboard.html`,
      controller: 'leaderboard',
      url: '/leaderboard',
      controllerAs: 'LC'
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
          if (evts.length === 1) {
            return evts[0];
          }
          let isThereOneToday = false;
          if (evts[evts.length - 2]) {
            let date = moment(evts[evts.length - 2].date).format('YYYY-MM-DD');
            if (moment().format('YYYY-MM-DD') === date) {
              return evts[evts.length - 2];
            }
          }
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
  .controller('leaderboard', ['$http', 'Events', '$q', 'resultsService',
    function($http, Events, $q, resultsSvc) {
      let vm = this;

      function init() {

        return Events.list()
          .then(evts => {

            let allResults = [];

            for (let evt of evts) {
              let filename = evt.name.split(' ').join('').toLowerCase() + '.txt';
              let eventPromise = $http.get(BASE + filename)
                .then(res => res.data)
                .then(res => {
                  let event = resultsSvc.parseFile(res);
                  return event;
                });
              allResults.push(eventPromise);
            }

            return $q.all(allResults);
          })
          .then(results => {
            
            let final = {};

            let allEvents = [];
            for (let res of results) {
              for (let e of res.events) {
                allEvents.push({
                  event: e,
                  place: null,
                  points: null,
                  time: ''
                });
              }
            }

            vm.events = allEvents;

            for (let res of results) {
              for (let win of res.winners) {
                if (!final[win.user]) {
                  final[win.user] = {
                    user: win.user,
                    VDOT: win.VDOT,
                    points: null,
                    place: null,
                    events: _.cloneDeep(allEvents),
                  };
                }
                let fin = final[win.user];
                for (let wevt of win.events) {
                  for (let fevt of fin.events) {
                    if (fevt.event === wevt.event) {
                      fevt.place = wevt.place;
                      fevt.points = wevt.points;
                      fevt.time = wevt.time;
                    }
                  }
                }
              }
            }

            let finalArr = _.toArray(final);

            for (let f of finalArr) {
              f.points = f.events.reduce((sum, e) => sum + (e.points || 0), 0);
            }

            finalArr = _.orderBy(finalArr, ['points'], ['desc']);
            
            let place = 1;
            let prev = {};
            for (let f of finalArr) {
              if (f.points === prev.points) {
                f.place = prev.place;
              } else {
                f.place = place;
              }
              place += 1;
            }

            return finalArr;

          })
          .then(winners => {
            vm.winners = winners;
          });
      }

      init();

    }
  ])
  .controller('main', ['$http', '$location', '$timeout', '$state', 'Events',
    function ($http, $location, $timeout, $state, Events) {

      let vm = this;

      vm.isMobile = isMobile();


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

      function isMobile() {
        return (navigator.userAgent.match(/Android/i) || 
            navigator.userAgent.match(/webOS/i) || 
            navigator.userAgent.match(/iPhone/i) || 
            navigator.userAgent.match(/iPad/i) || 
            navigator.userAgent.match(/iPod/i) || 
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
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
  .factory('resultsService', [function() {
    let svc = {};

    svc.parseFile = function(data) {
      let lines = data.split('\n');

      let event = {
        name: lines[0].trim(),
        date: moment(lines[1].trim()),
        events: lines[2].split(',').map(a => a.trim()),
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

        let user = parseUser(line, event);
        assignUser(allUsers, user);
        
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

        let user = parseUser(line, event);
        assignUser(allUsers, user);

        curh2h.entrants.push(user);
      }

      for (let league of event.leagues) {
        league.entrants = sortAndLane(league.entrants, event);
      }
      for (let h2h of event.h2h) {
        h2h.entrants = sortAndLane(h2h.entrants, event);
      }

      event.winners = getWinners(allUsers, event);

      return event;
    };


    function assignUser(users, user) {
      if (!users[user.user.toLowerCase()]) {
        users[user.user.toLowerCase()] = user;
      }
      let u = users[user.user.toLowerCase()];

      u.VDOT = Math.max(u.VDOT, user.VDOT);
      u.note = u.note || user.note;
      u.times = u.times.length > user.times.length ? u.times.length : user.times.length;
      u.links = u.links.length > user.links.length ? u.links : user.links;
    }


    function sortAndLane(list, event) {
      list = _.orderBy(list, ['VDOT', 'user'], ['desc', 'asc']);
      let lane = 1;
      for (let e of list) {
        e.lane = lane++;
      }

      assignPlaceAndPoints(list, event, 'heatPoints', 'heatPlace', 8);

      list = _.orderBy(list, [`heatPlace`, `events[0].time`, `user`], [`asc`, `asc`, `asc`]);

      return list;
    }

    function assignPlaceAndPoints(list, event, pointsKey, placeKey, maxPoints) {
      for (let ii = 0; ii < event.events.length; ii++) {
        let points = maxPoints;
        let place = 1;
        let prev;

        let byTime = _.orderBy(list, [`events[${ii}.time`, 'user']);
        for (let li of byTime) {
          if (li.events[ii] && li.events[ii].time) {
            if (prev && prev.time === li.events[ii].time) {
              li.events[ii][pointsKey] = prev[pointsKey];
              li.events[ii][placeKey] = prev[placeKey];
            } else {
              li.events[ii][pointsKey] = points;
              li.events[ii][placeKey] = place;
            }

            prev = li.events[ii];
            place += 1;
            if (points) {
              points -= 1;
            }
          }
        }

        for (let li of list) {
          li[pointsKey] = li.events.reduce((sum, e) => sum + e[pointsKey], 0);
        }

        let byPoints = _.orderBy(list, [pointsKey, 'user'], ['desc', 'asc']);

        prev = null;
        place = 1;
        for (let li of byPoints) {
          if (li.raced) {
            if (prev && prev[pointsKey] === li[pointsKey]) {
              li[placeKey] = prev[placeKey];
            } else {
              li[placeKey] = place;
            }
            place += 1;
            prev = li;
          }
        }
      }
    }

    function getWinners(allUsers, event) {
      allUsers = _.toArray(allUsers);

      assignPlaceAndPoints(allUsers, event, 'points', 'place', 99);

      let winners = _.orderBy(allUsers, ['place', `events[0].time`, 'user'], ['asc', 'asc', 'asc']);

      return winners;
    }

    function parseUser(line, event) {
      let split = line.split('|').map(t => t.trim());
      let user = {
        user: split[0],
        link: `https://reddit.com/u/${split[0]}`,
        VDOT: split[1] ? parseFloat(split[1]) : 0,
        note: split[2] || '',
        times: split[3] ? split[3].split(',').map(t => t.trim()) : event.events.map(() => ''),
        links: [],
        heatPoints: null,
        heatPlace: null,
        points: null,
        place: null,
        raced: false,
      };
      if (split[4]) {
        let links = split[4].split(',').join(' ').split(' ').map(l => l.trim());

        for (let link of links) {
          if (!link) {
            continue;
          }
          if (link.match(/strava/)) {
            user.links.push({type: 'strava', url: link});
          } else if (link.match(/youtu/) ) {
            user.links.push({type: 'youtube', url: link});
          }
        }
        user.links = user.links.sort((a, b) => {
          if (a.type < b.type) { return -1; }
          if (b.type < a.type) { return 1;}
          return 0;
        });
      }
      user.events = user.times.map((t, ii) => {
        return {
          event: event.events[ii],
          time: t,
          heatPlace: null,
          heatPoints: null,
          place: null,
          points: null
        };
      });
      user.raced = user.times.reduce((val, t) => !!(val || t), false);
      return user;
    }


    return svc;
  }])
  .controller('event', ['$http', '$state', '$timeout', '$location', '$anchorScroll', '$stateParams', 'resultsService',
    function ($http, $state, $timeout, $location, $anchorScroll, $params, resultsSvc) 
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
            let event = resultsSvc.parseFile(res);
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

      vm.sortWinnersBy = function (type, index) {
        function byTime(a, b, index) {
          if (a.events[index].time < b.events[index].time) { return -1;}
          if (b.events[index].time < a.events[index].time) { return 1;}
          return 0;
        }
        function byKey(a, b, key) {
          if (a[key] < b[key]) { return -1; }
          if (b[key] < a[key]) { return 1; }
          return 0;
        }

        if (type === 'event') {
          vm.event.winners = vm.event.winners.sort((a, b) => {
            let aTime = a.events[index].time, bTime = b.events[index].time;

            if (aTime && bTime) {
              return byTime(a, b, index) || byKey(a, b, 'points') || byKey(a, b, 'user');
            } else if (aTime) {
              return -1;
            } else if (bTime) {
              return 1;
            } else {
              return byKey(a, b, 'points') || byKey(a, b, 'user');
            }
          });
        } else {
          vm.event.winners = _.orderBy(vm.event.winners, ['place', `events[0].time`, 'user']);
        } 
      };




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