'use strict';

// to prevent this loading twice in dev - hacky hacky whatever shut your face

if (!window.apploaded) {
  (function () {

    window.apploaded = true;

    var BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';

    if (window.location.href.match(/localhost/)) {
      BASE = '';
    }

    angular.module('ar', ['ui.router']).config(['$stateProvider', '$sceDelegateProvider', function ($sp, $sce) {
      $sce.resourceUrlWhitelist(['self', BASE + '**']);

      $sp.state({
        name: 'Calendar',
        templateUrl: BASE + 'calendar.html',
        controller: 'calendar',
        controllerAs: 'CC'
      });
    }]).factory('Events', ['$http', '$q', function ($http, $q) {
      var EVENTS = [];
      var svc = {};
      svc.list = function () {
        if (!EVENTS.length) {
          return $http.get(BASE + 'events.txt').then(function (res) {
            return res.data;
          }).then(function (res) {
            EVENTS = [];

            var lines = res.split('\n');
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var line = _step.value;

                line = line.trim();
                if (!line) {
                  continue;
                }

                var split = line.split('|');
                EVENTS.push({
                  name: split[0].trim(),
                  date: split[1].trim(),
                  state: split[0].trim(),
                  events: split[2].trim(),
                  link: split[3].trim()
                });
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            return EVENTS;
          });
        } else {
          return $q.when(EVENTS);
        }
      };

      svc.latest = function () {
        return svc.list().then(function (evts) {
          return evts[evts.length - 1];
        });
      };

      return svc;
    }]).run(['$http', '$stateRegistry', 'Events', function ($http, $stateRegistry, Events) {

      return Events.list().then(function (evts) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = evts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var evt = _step2.value;

            $stateRegistry.register({
              name: evt.name,
              templateUrl: BASE + 'event.html',
              controller: 'event',
              controllerAs: 'EC'
            });
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      });
    }]).controller('calendar', ['$http', 'Events', function ($http, Events) {
      var vm = this;

      function init() {
        vm.events = [];

        return Events.list().then(function (evts) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = evts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var evt = _step3.value;

              evt = _.clone(evt);
              evt.date = moment(evt.date).format('MMM D, YYYY');
              vm.events.push(evt);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        });
      }

      init();
    }]).controller('main', ['$http', '$location', '$timeout', '$state', 'Events', function ($http, $location, $timeout, $state, Events) {

      var vm = this;

      function init() {
        Events.list().then(function (evts) {
          vm.events = evts;
        });

        Events.latest().then(function (evt) {
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
          var now = moment();
          var evt = moment(vm.next.date);
          var days = evt.diff(now, 'days');
          vm.next.days = days;
          evt.subtract(days, 'days');
          var hours = evt.diff(now, 'hours');
          vm.next.hours = hours;
          evt.subtract(hours, 'hours');
          var minutes = evt.diff(now, 'minutes');
          vm.next.minutes = minutes;
          $timeout(countdown, 1000 * 60);
        } else {
          $timeout(countdown, 500);
        }
      }

      var lastState = void 0;
      var crumbs = [];
      vm.getBreadcrumbs = function () {
        if ($state.$current.name === lastState) {
          return crumbs;
        }
        lastState = $state.$current.name;
        crumbs = [];
        if (lastState !== 'Calender') {
          crumbs = [{ name: 'Home', last: false, link: 'Calendar' }, { name: lastState, last: true }];
        } else {
          crumbs = [{ name: 'Home', last: true }];
        }
        return crumbs;
      };

      init();
    }]).controller('event', ['$http', '$state', '$timeout', function ($http, $state, $timeout) {
      var vm = this;

      vm.tab = 'start';

      function init() {
        var filename = $state.$current.name.split(' ').join('').toLowerCase() + '.txt';
        $http.get(BASE + filename).then(function (res) {
          return res.data;
        }).then(function (res) {
          var event = parseFile(res);
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
        var lines = data.split('\n');

        var event = {
          name: lines[0].trim(),
          date: moment(lines[1].trim()),
          events: lines[2].trim(),
          leagues: [],
          h2h: []
        };

        lines.splice(0, 3);

        var curLeague = {};
        var allUsers = {};

        var ii = void 0;
        for (ii = 0; ii < lines.length; ii++) {
          var line = lines[ii].trim();
          if (!line) {
            continue;
          }
          if (line === '=====') {
            break;
          }

          if (line[0] === '#') {
            curLeague = {
              name: line.match(/\#\s*(.*)/)[1].trim(),
              entrants: [],
              winners: []
            };
            event.leagues.push(curLeague);
            continue;
          }

          var user = parseUser(line);
          if (!allUsers[user.user.toLowerCase()]) {
            allUsers[user.user.toLowerCase()] = user;
          }
          curLeague.entrants.push(user);
        }

        var curh2h = { entrants: [] };
        for (ii = ii + 1; ii < lines.length; ii++) {
          var _line = lines[ii].trim();
          if (_line[0] === '#') {
            continue;
          }
          if (!_line) {
            event.h2h.push(curh2h);
            curh2h = {
              entrants: []
            };
            continue;
          }

          var _user = parseUser(_line);
          if (!allUsers[_user.user.toLowerCase()]) {
            allUsers[_user.user.toLowerCase()] = _user;
          }
          curh2h.entrants.push(_user);
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = event.leagues[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var league = _step4.value;

            league.entrants = sortAndLane(league.entrants);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = event.h2h[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var h2h = _step5.value;

            h2h.entrants = sortAndLane(h2h.entrants);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        event.winners = getWinners(allUsers);

        return event;
      }

      function sortAndLane(list) {
        list = _.orderBy(list, ['VDOT', 'user'], ['desc', 'asc']);
        var lane = 1;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var e = _step6.value;

            e.lane = lane++;
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        return list;
      }

      function getWinners(allUsers) {
        allUsers = _.toArray(allUsers);

        var winners = _.orderBy(allUsers, ['time', 'user']);

        var points = 8;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = winners[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var winner = _step7.value;

            if (winner.time) {
              winner.points = points;

              if (points !== 0) {
                points--;
              }
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        return winners;
      }

      function parseUser(line) {
        var split = line.split('|');
        return {
          user: split[0].trim(),
          link: 'https://reddit.com/u/' + split[0].trim(),
          VDOT: split[1] ? parseFloat(split[1]) : 0,
          note: split[2] || '',
          time: split[3] ? split[3].trim() : null
        };
      }

      vm.changeTab = function (tab) {
        vm.tab = tab;
      };

      init();
    }]).directive('fixedTop', ['$window', function ($window) {
      return {
        restrict: 'A',
        link: function link(scope, elem, attrs, ctrl) {

          var $win = angular.element($window);
          var fixed = parseInt(attrs.fixedTop) || 50;

          $win.on('scroll', function (e) {
            var width = Math.max(window.innerWidth, document.documentElement.clientWidth);
            if (width < 550 || $window.pageYOffset < fixed) {
              elem.css({ position: 'relative', top: '' });
            } else {
              elem.css({ position: 'relative', top: $window.pageYOffset - fixed + 'px' });
            }
          });
        }
      };
    }]);
  })();
}
