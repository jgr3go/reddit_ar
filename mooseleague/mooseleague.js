var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// to prevent this loading twice in dev - hacky hacky whatever shut your face
if (!window['apploaded']) {
    window['apploaded'] = true;
    throw "Already loaded";
}
var BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';
if (window.location.href.match(/localhost/)) {
    BASE = '';
}
var GAPI = new Promise(function (resolve, reject) {
    gapi.load('client', {
        callback: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, gapi.client.init({ apiKey: 'AIzaSyCzp1XThhfQZLh6YcTKwLzg65ZjLzc5tqE' })];
                    case 1:
                        _a.sent();
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); }
    });
});
function sortTime(a, b) {
    var at = a ? toSeconds(a) : null;
    var bt = b ? toSeconds(b) : null;
    if (at < bt) {
        return -1;
    }
    if (bt < at) {
        return 1;
    }
    return 0;
}
function toSeconds(time) {
    var parts = time.split(':');
    if (parts.length === 1) {
        return parseFloat(parts[0]);
    }
    var min = parseInt(parts[0]) * 60;
    var sec = parseFloat(parts[1]);
    return min + sec;
}
function fromSeconds(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = parseFloat((seconds - (min * 60)).toFixed(1));
    return min + ":" + (sec < 10 ? '0' : '') + sec;
}
function isMobile() {
    return !!(navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i));
}
var GoogleSvc = /** @class */ (function () {
    function GoogleSvc() {
    }
    GoogleSvc.prototype.ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GAPI];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, window.gapi.client.load('sheets', 'v4')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GoogleSvc.prototype.getSheet = function (sheetId) {
        return window.gapi.client.sheets.spreadsheets.get({
            spreadsheetId: sheetId
        });
    };
    return GoogleSvc;
}());
var Events = /** @class */ (function () {
    function Events($http, $q, google) {
        this.$http = $http;
        this.$q = $q;
        this.google = google;
    }
    Events.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.events && this.events.length) {
                            return [2 /*return*/, this.events];
                        }
                        return [4 /*yield*/, this.google.getSheet('1ZC7pDg9VRiqnd4-w15LUSWcvQXti62IOSp0dcYj2JZI')];
                    case 1:
                        sheet = _a.sent();
                        console.log(sheet);
                        return [2 /*return*/, []];
                }
            });
        });
    };
    Events.prototype.latest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, isThereOneToday, date;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        events = _a.sent();
                        if (events.length == 1) {
                            return [2 /*return*/, events[0]];
                        }
                        isThereOneToday = false;
                        if (events[events.length - 2]) {
                            date = moment(events[events.length - 2].date).format('YYYY-MM-DD');
                            if (moment().format('YYYY-MM-DD') == date) {
                                return [2 /*return*/, events[events.length - 2]];
                            }
                        }
                        return [2 /*return*/, events[events.length - 1]];
                }
            });
        });
    };
    Events.$inject = ['$http', '$q', 'Google'];
    return Events;
}());
var Calendar = /** @class */ (function () {
    function Calendar($http, Events) {
        this.$http = $http;
        this.Events = Events;
        this.events = [];
        this.init();
    }
    Calendar.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var evts, _i, evts_1, evt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.events = [];
                        return [4 /*yield*/, this.Events.list()];
                    case 1:
                        evts = _a.sent();
                        for (_i = 0, evts_1 = evts; _i < evts_1.length; _i++) {
                            evt = evts_1[_i];
                            evt = _.clone(evt);
                            evt.date = moment(evt.date).format('MMM, D, YYYY');
                            this.events.push(evt);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Calendar.$inject = ['$http', 'Events'];
    return Calendar;
}());
var Leaderboard = /** @class */ (function () {
    function Leaderboard($http, Events, $q, resultsSvc) {
        this.$http = $http;
        this.Events = Events;
        this.$q = $q;
        this.resultsSvc = resultsSvc;
        this.init();
    }
    Leaderboard.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var evts, allResults, _i, evts_2, evt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Events.list()];
                    case 1:
                        evts = _a.sent();
                        allResults = [];
                        for (_i = 0, evts_2 = evts; _i < evts_2.length; _i++) {
                            evt = evts_2[_i];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Leaderboard.$inject = ['$http', 'Events', '$q', 'resultsSvc'];
    return Leaderboard;
}());
var MainController = /** @class */ (function () {
    function MainController($http, $location, $timeout, $state, Events, $sce) {
        this.$http = $http;
        this.$location = $location;
        this.$timeout = $timeout;
        this.$state = $state;
        this.Events = Events;
        this.$sce = $sce;
        this.events = [];
        this.autoplay = localStorage.getItem('autoplay2020') === null ? true : localStorage.getItem('autoplay2020') == 'true';
        this.isMobile = isMobile();
        this.autoplayKey = 'autoplay' + moment().year();
        this.init();
    }
    MainController.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, evts, evt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([this.Events.list(), this.Events.latest()])];
                    case 1:
                        _a = _b.sent(), evts = _a[0], evt = _a[1];
                        this.events = evts;
                        console.log(evt);
                        this.next = {
                            name: evt.name.toUpperCase(),
                            date: moment(evt.date),
                            state: evt.state,
                            displayDate: moment(evt.date).format('MMM D, YYYY'),
                            live: false
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    MainController.prototype.countdown = function () {
        var _this = this;
        if (this.next) {
            var now = moment();
            var evt = moment(this.next.date);
            if (now.format('YYYY-MM-DD') === evt.format('YYYY-MM-DD')) {
                this.next.live = true;
            }
            else {
                var days = evt.diff(now, 'days');
                this.next.days = days;
                evt.subtract(days, 'days');
                var hours = evt.diff(now, 'hours');
                this.next.hours = hours;
                evt.subtract(hours, 'hours');
                var minutes = evt.diff(now, 'minutes');
                this.next.minutes = minutes;
            }
            this.$timeout(function () { return _this.countdown(); }, 1000 * 60);
        }
        else {
            this.$timeout(function () { return _this.countdown(); }, 500);
        }
    };
    MainController.prototype.stopAutoplay = function () {
        localStorage.setItem(this.autoplayKey, 'false');
        this.autoplay = false;
    };
    MainController.prototype.startAutoplay = function () {
        localStorage.setItem(this.autoplayKey, 'true');
        this.autoplay = true;
    };
    MainController.prototype.shouldAutoplay = function () {
        var ap = localStorage.getItem(this.autoplayKey);
        return !(ap === 'false');
    };
    MainController.prototype.getThemeUrl = function () {
        var ap = this.shouldAutoplay();
        return this.$sce.trustAsResourceUrl("https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/460111206&amp;auto_play=" + ap + "&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true");
    };
    MainController.$inject = ['$http', '$location', '$timeout', '$state', 'Events', '$sce'];
    return MainController;
}());
angular
    .module('ar', ['ui.router'])
    .config(['$stateProvider', '$sceDelegateProvider', '$urlRouterProvider', '$locationProvider', function ($sp, $sce, $url, $loc) {
        $sce.resourceUrlWhitelist([
            'self',
            BASE + "**"
        ]);
        $url.deferIntercept();
        $sp.state({
            name: 'Calendar',
            templateUrl: BASE + "calendar.html",
            controller: 'calendar',
            url: '/calendar',
            controllerAs: 'CC'
        });
        $sp.state({
            name: 'Leaderboard',
            templateUrl: BASE + "leaderboard.html",
            controller: 'leaderboard',
            url: '/leaderboard',
            controllerAs: 'LC'
        });
        $url.otherwise('/calendar');
    }])
    .run(['$http', '$stateRegistry', '$urlRouter', 'Events', function ($http, $stateRegistry, $urlRouter, Events) {
        return Events.list()
            .then(function (evts) {
            for (var _i = 0, evts_3 = evts; _i < evts_3.length; _i++) {
                var evt = evts_3[_i];
                $stateRegistry.register({
                    name: evt.name,
                    templateUrl: BASE + "event.html",
                    controller: 'event',
                    url: evt.url + "?tab",
                    params: {
                        tab: { dynamic: true }
                    },
                    controllerAs: 'EC'
                });
            }
            // after registering states, listen on the router
            $urlRouter.sync();
            $urlRouter.listen();
        });
    }])
    .factory('Google', [function () {
        return new GoogleSvc();
    }])
    .factory('Events', Events)
    // .factory('Events', ['$http', '$q', 'Google', function ($http, $q, google: GoogleSvc) {
    //   let EVENTS = [];
    //   let svc: any = {};
    //   svc.list = async function() {
    //     let sheet = await google.getSheet('1ZC7pDg9VRiqnd4-w15LUSWcvQXti62IOSp0dcYj2JZI');
    //     console.log({sheet});
    //     if (!EVENTS.length) {
    //       return $http.get(`${BASE}events.txt`)
    //       .then(res => res.data)
    //       .then(res => {
    //         EVENTS = [];
    //         let lines = res.split('\n');
    //         for (let line of lines) {
    //           line = line.trim();
    //           if (!line) { continue; }
    //           let split = line.split('|');
    //           EVENTS.push({
    //             name: split[0].trim(),
    //             url: '/' + split[0].trim().split(' ').join('').toLowerCase(),
    //             date: split[1].trim(),
    //             state: split[0].trim(),
    //             events: split[2].trim(),
    //             link: (split[3] || '').trim()
    //           });
    //         }
    //         return EVENTS;
    //       });   
    //     } else {
    //       return $q.when(EVENTS);
    //     }
    //   };
    //   svc.latest = function() {
    //     return svc.list()
    //       .then(evts => {
    //         if (evts.length === 1) {
    //           return evts[0];
    //         }
    //         let isThereOneToday = false;
    //         if (evts[evts.length - 2]) {
    //           let date = moment(evts[evts.length - 2].date).format('YYYY-MM-DD');
    //           if (moment().format('YYYY-MM-DD') === date) {
    //             return evts[evts.length - 2];
    //           }
    //         }
    //         return evts[evts.length - 1];
    //       });
    //   };
    //   return svc;
    // }])
    .controller('calendar', Calendar)
    // .controller('calendar', ['$http', 'Events', function($http, Events: MEventSvc) {
    //   let vm = this;
    //   function init() {
    //     vm.events = [];
    //     return Events.list()
    //       .then(evts => {
    //         for (let evt of evts) {
    //           evt = _.clone(evt);
    //           evt.date = moment(evt.date).format('MMM D, YYYY');
    //           vm.events.push(evt);
    //         }
    //       });
    //   }
    //   init();
    // }])
    .controller('leaderboard', Leaderboard)
    // .controller('leaderboard', ['$http', 'Events', '$q', 'resultsService',
    //   function($http, Events: MEventSvc, $q, resultsSvc) {
    //     let vm = this;
    //     function init() {
    //       return Events.list()
    //         .then(evts => {
    //           let allResults = [];
    //           for (let evt of evts) {
    //             let filename = evt.name.split(' ').join('').toLowerCase() + '.txt';
    //             let eventPromise = $http.get(BASE + filename)
    //               .then(res => res.data)
    //               .then(res => {
    //                 let event = resultsSvc.parseFile(res);
    //                 return event;
    //               });
    //             allResults.push(eventPromise);
    //           }
    //           return $q.all(allResults);
    //         })
    //         .then(results => {
    //           let final = {};
    //           let allEvents = [];
    //           for (let res of results) {
    //             for (let e of res.events) {
    //               allEvents.push({
    //                 event: e,
    //                 place: null,
    //                 points: null,
    //                 time: ''
    //               });
    //             }
    //           }
    //           vm.events = allEvents;
    //           for (let res of results) {
    //             for (let win of res.winners) {
    //               if (!final[win.user]) {
    //                 final[win.user] = {
    //                   user: win.user,
    //                   VDOT: win.VDOT,
    //                   points: null,
    //                   place: null,
    //                   events: _.cloneDeep(allEvents),
    //                 };
    //               }
    //               let fin = final[win.user];
    //               for (let wevt of win.events) {
    //                 for (let fevt of fin.events) {
    //                   if (fevt.event === wevt.event) {
    //                     fevt.place = wevt.place;
    //                     fevt.points = wevt.points;
    //                     fevt.time = wevt.time;
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //           let finalArr = _.toArray(final);
    //           for (let f of finalArr) {
    //             f.points = f.events.reduce((sum, e) => sum + (e.points || 0), 0);
    //           }
    //           finalArr = _.orderBy(finalArr, ['points'], ['desc']);
    //           let place = 1;
    //           let prev = {};
    //           for (let f of finalArr) {
    //             if (f.points === prev.points) {
    //               f.place = prev.place;
    //             } else {
    //               f.place = place;
    //             }
    //             place += 1;
    //           }
    //           return finalArr;
    //         })
    //         .then(winners => {
    //           vm.winners = winners;
    //         });
    //     }
    //     vm.sortWinners = function(index) {
    //       function byTime(a, b, index) {
    //         return sortTime(a.events[index].time, b.events[index].time);
    //       }
    //       function byKey(a, b, key) {
    //         if (a[key] < b[key]) { return -1; }
    //         if (b[key] < a[key]) { return 1; }
    //         return 0;
    //       }
    //       vm.event.winners = vm.event.winners.sort((a, b) => {
    //         let aTime = a.events[index].time, bTime = b.events[index].time;
    //         if (aTime && bTime) {
    //           return byTime(a, b, index) || byKey(a, b, 'points') || byKey(a, b, 'user');
    //         } else if (aTime) {
    //           return -1;
    //         } else if (bTime) {
    //           return 1;
    //         } else {
    //           return byKey(a, b, 'points') || byKey(a, b, 'user');
    //         }
    //       }); 
    //     };
    //     init();
    //   }
    // ])
    .controller('main', MainController)
    // .controller('main', ['$http', '$location', '$timeout', '$state', 'Events', '$sce',
    //   function ($http, $location, $timeout, $state, Events, $sce) {
    //     let vm = this;
    //     vm.isMobile = isMobile();
    //     vm.autoplay = localStorage.getItem('autoplay2019') === null ? true : localStorage.getItem('autoplay2019');
    //     function init() {
    //       Events.list()
    //         .then(evts => {
    //           vm.events = evts;
    //         });
    //       Events.latest()
    //         .then(evt => {
    //           console.log(evt);
    //           vm.next = {
    //             name: evt.name.toUpperCase(),
    //             date: moment(evt.date),
    //             state: evt.state,
    //             displayDate: moment(evt.date).format('MMM D, YYYY'),
    //             live: false
    //           };
    //         });
    //       countdown();
    //     }
    //     function isMobile() {
    //       return (navigator.userAgent.match(/Android/i) || 
    //           navigator.userAgent.match(/webOS/i) || 
    //           navigator.userAgent.match(/iPhone/i) || 
    //           navigator.userAgent.match(/iPad/i) || 
    //           navigator.userAgent.match(/iPod/i) || 
    //           navigator.userAgent.match(/BlackBerry/i) ||
    //           navigator.userAgent.match(/Windows Phone/i));
    //     }
    //     function countdown() {
    //       if (vm.next) {
    //         let now = moment();
    //         let evt = moment(vm.next.date);
    //         if (now.format('YYYY-MM-DD') === evt.format('YYYY-MM-DD')) {
    //           vm.next.live = true;
    //         } else {
    //           let days = evt.diff(now, 'days');
    //           vm.next.days = days;
    //           evt.subtract(days, 'days');
    //           let hours = evt.diff(now, 'hours');
    //           vm.next.hours = hours;
    //           evt.subtract(hours, 'hours');
    //           let minutes = evt.diff(now, 'minutes');
    //           vm.next.minutes = minutes;
    //         }
    //         $timeout(countdown, 1000 * 60);
    //       } else {
    //         $timeout(countdown, 500);
    //       }
    //     }
    //     let lastState;
    //     let crumbs = [];
    //     vm.getBreadcrumbs = function() {
    //       if ($state.$current.name === lastState) {
    //         return crumbs;
    //       }
    //       lastState = $state.$current.name;
    //       crumbs = [];
    //       if (lastState !== 'Calender') {
    //         crumbs = [
    //           {name: 'Home', last: false, link: 'Calendar'},
    //           {name: lastState, last: true }
    //         ];
    //       } else {
    //         crumbs = [
    //           {name: 'Home', last: true}
    //         ];
    //       }
    //       return crumbs;
    //     }
    //     vm.stopAutoplay = function() {
    //       localStorage.setItem('autoplay2019', false);
    //       vm.autoplay = false;
    //     };
    //     vm.startAutoplay = function() {
    //       localStorage.setItem('autoplay2019', true);
    //       vm.autoplay = true;
    //     }
    //     vm.shouldAutoplay = function() {
    //       let ap = localStorage.getItem('autoplay2019');
    //       return !(ap === 'false' || ap === false);
    //     };
    //     vm.getThemeUrl = function() {
    //       let ap = vm.shouldAutoplay();
    //       return $sce.trustAsResourceUrl(`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/460111206&amp;auto_play=${ap}&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`);
    //     };
    //     init();
    //   }
    // ])
    .factory('resultsService', [function () {
        var svc = {};
        svc.parseFile = function (data) {
            var lines = data.split('\n');
            var event = {
                name: lines[0].trim(),
                date: moment(lines[1].trim()),
                events: lines[2].split(',').map(function (a) { return a.trim(); }),
                leagues: [],
                h2h: []
            };
            lines.splice(0, 3);
            var curLeague = {};
            var allUsers = {};
            var ii;
            // build leagues
            for (ii = 0; ii < lines.length; ii++) {
                var line = lines[ii].trim();
                if (!line) {
                    continue;
                }
                if (line === '=====') {
                    break;
                }
                if (line[0] === '#') {
                    var name_1 = line.match(/\#\s*(.*)/)[1].trim();
                    curLeague = {
                        name: name_1,
                        anchor: name_1.split(' ').join('').toLowerCase(),
                        entrants: [],
                        winners: []
                    };
                    event.leagues.push(curLeague);
                    continue;
                }
                var user = parseUser(line, event);
                assignUser(allUsers, user);
                curLeague.entrants.push(user);
            }
            var curh2h = { entrants: [] };
            for (ii = ii + 1; ii < lines.length; ii++) {
                var line = lines[ii].trim();
                if (line[0] === '#') {
                    continue;
                }
                if (!line) {
                    event.h2h.push(curh2h);
                    curh2h = {
                        entrants: []
                    };
                    continue;
                }
                var user = parseUser(line, event);
                assignUser(allUsers, user);
                curh2h.entrants.push(user);
            }
            for (var _i = 0, _a = event.leagues; _i < _a.length; _i++) {
                var league = _a[_i];
                league.entrants = sortAndLane(league.entrants, event);
            }
            for (var _b = 0, _c = event.h2h; _b < _c.length; _b++) {
                var h2h = _c[_b];
                h2h.entrants = sortAndLane(h2h.entrants, event);
            }
            event.winners = getWinners(allUsers, event);
            event.relayLeagueWinners = getRelayLeagueWinners(event);
            return event;
        };
        function assignUser(users, user) {
            if (!users[user.user.toLowerCase()]) {
                users[user.user.toLowerCase()] = user;
            }
            var u = users[user.user.toLowerCase()];
            u.VDOT = Math.max(u.VDOT, user.VDOT);
            u.note = u.note || user.note;
            u.times = u.times.length > user.times.length ? u.times.length : user.times.length;
            u.links = u.links.length > user.links.length ? u.links : user.links;
        }
        function sortAndLane(list, event) {
            list = _.orderBy(list, ['VDOT', 'user'], ['desc', 'asc']);
            var lane = 1;
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var e = list_1[_i];
                e.lane = lane++;
            }
            assignPlaceAndPoints(list, event, 'heatPoints', 'heatPlace', 8);
            list = _.orderBy(list, ["heatPlace", function (li) { return toSeconds(li.events[0].time); }, "user"], ["asc", "asc", "asc"]);
            return list;
        }
        function assignPlaceAndPoints(list, event, pointsKey, placeKey, maxPoints) {
            var _loop_1 = function (ii) {
                var points = maxPoints;
                var place = 1;
                var prev = void 0;
                var byTime = _.orderBy(list, [function (li) { return toSeconds(li.events[ii].time); }, 'user']);
                for (var _i = 0, byTime_1 = byTime; _i < byTime_1.length; _i++) {
                    var li = byTime_1[_i];
                    if (li.events[ii] && li.events[ii].time) {
                        if (prev && prev.time === li.events[ii].time) {
                            li.events[ii][pointsKey] = prev[pointsKey];
                            li.events[ii][placeKey] = prev[placeKey];
                        }
                        else {
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
                for (var _a = 0, list_2 = list; _a < list_2.length; _a++) {
                    var li = list_2[_a];
                    li[pointsKey] = li.events.reduce(function (sum, e) { return sum + e[pointsKey]; }, 0);
                }
                var byPoints = _.orderBy(list, [pointsKey, 'user'], ['desc', 'asc']);
                prev = null;
                place = 1;
                for (var _b = 0, byPoints_1 = byPoints; _b < byPoints_1.length; _b++) {
                    var li = byPoints_1[_b];
                    if (li.raced) {
                        if (prev && prev[pointsKey] === li[pointsKey]) {
                            li[placeKey] = prev[placeKey];
                        }
                        else {
                            li[placeKey] = place;
                        }
                        place += 1;
                        prev = li;
                    }
                }
            };
            for (var ii = 0; ii < event.events.length; ii++) {
                _loop_1(ii);
            }
        }
        function getRelayLeagueWinners(event) {
            var relayEvents = [];
            var isFuture = moment(event).format('YYYYMMDD') > moment().format('YYYYMMDD');
            for (var _i = 0, _a = event.events; _i < _a.length; _i++) {
                var eventName = _a[_i];
                var relayEvent = {
                    event: eventName,
                    leagues: [],
                    isRelay: eventName.indexOf('x') >= 0
                };
                for (var _b = 0, _c = event.leagues; _b < _c.length; _b++) {
                    var league = _c[_b];
                    var leagueResult = {
                        event: eventName,
                        name: league.name,
                        team: [],
                        totalTime: null,
                        totalSeconds: null,
                        place: null,
                        notes: ''
                    };
                    for (var _d = 0, _e = league.entrants; _d < _e.length; _d++) {
                        var entrant = _e[_d];
                        for (var _f = 0, _g = entrant.events; _f < _g.length; _f++) {
                            var ee = _g[_f];
                            if (ee.event === eventName && ee.heatPlace && ee.heatPlace <= 4) {
                                leagueResult.team.push({
                                    user: entrant.user,
                                    time: ee.time
                                });
                            }
                        }
                    }
                    if (!isFuture && leagueResult.team.length < 4) {
                        leagueResult.notes = "DQ - Did not field 4 runners.";
                    }
                    else {
                        leagueResult.totalSeconds = 0;
                        for (var _h = 0, _j = leagueResult.team; _h < _j.length; _h++) {
                            var e = _j[_h];
                            leagueResult.totalSeconds += toSeconds(e.time);
                        }
                        leagueResult.totalTime = fromSeconds(leagueResult.totalSeconds);
                    }
                    relayEvent.leagues.push(leagueResult);
                }
                relayEvents.push(relayEvent);
            }
            for (var _k = 0, relayEvents_1 = relayEvents; _k < relayEvents_1.length; _k++) {
                var re = relayEvents_1[_k];
                re.leagues = _.orderBy(re.leagues, 'totalSeconds', 'asc');
                var place = 1;
                for (var _l = 0, _m = re.leagues; _l < _m.length; _l++) {
                    var league = _m[_l];
                    if (league.team.length >= 4) {
                        league.place = place;
                        place += 1;
                        league.notes = league.team.map(function (u) {
                            return u.user + " (" + u.time + ")";
                        }).join('\n');
                    }
                }
            }
            return relayEvents;
        }
        function getWinners(allUsers, event) {
            allUsers = _.toArray(allUsers);
            assignPlaceAndPoints(allUsers, event, 'points', 'place', 99);
            var winners = _.orderBy(allUsers, ['place', function (au) { return au.events[0].time; }, 'user'], ['asc', 'asc', 'asc']);
            return winners;
        }
        function parseUser(line, event) {
            var split = line.split('|').map(function (t) { return t.trim(); });
            var user = {
                user: split[0],
                link: "https://reddit.com/u/" + split[0],
                VDOT: split[1] ? parseFloat(split[1]) : 0,
                note: split[2] || '',
                times: split[3] ? split[3].split(',').map(function (t) { return t.trim(); }) : event.events.map(function () { return ''; }),
                links: [],
                heatPoints: null,
                heatPlace: null,
                points: null,
                place: null,
                raced: false,
            };
            if (split[4]) {
                var links = split[4].split(',').join(' ').split(' ').map(function (l) { return l.trim(); });
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var link = links_1[_i];
                    if (!link) {
                        continue;
                    }
                    if (link.match(/strava/)) {
                        user.links.push({ type: 'strava', url: link });
                    }
                    else if (link.match(/youtu/)) {
                        user.links.push({ type: 'youtube', url: link });
                    }
                }
                user.links = user.links.sort(function (a, b) {
                    if (a.type < b.type) {
                        return -1;
                    }
                    if (b.type < a.type) {
                        return 1;
                    }
                    return 0;
                });
            }
            user.events = user.times.map(function (t, ii) {
                return {
                    event: event.events[ii],
                    time: t,
                    heatPlace: null,
                    heatPoints: null,
                    place: null,
                    points: null
                };
            });
            user.raced = user.times.reduce(function (val, t) { return !!(val || t); }, false);
            return user;
        }
        return svc;
    }])
    .controller('event', ['$http', '$state', '$timeout', '$location', '$anchorScroll', '$stateParams', 'resultsService', function ($http, $state, $timeout, $location, $anchorScroll, $params, resultsSvc) {
        var vm = this;
        vm.tab = 'start';
        vm.hasRelay = false;
        $anchorScroll.yOffset = 60;
        function init() {
            if ($params.tab) {
                vm.tab = $params.tab;
            }
            var filename = $state.$current.name.split(' ').join('').toLowerCase() + '.txt';
            $http.get(BASE + filename)
                .then(function (res) { return res.data; })
                .then(function (res) {
                var event = resultsSvc.parseFile(res);
                console.log(event);
                vm.event = event;
                vm.event.file = filename;
                vm.next = {
                    date: event.date,
                    name: event.name.toUpperCase()
                };
                vm.event.date = moment(new Date(vm.event.date)).format('MMM D, YYYY');
                for (var _i = 0, _a = event.events; _i < _a.length; _i++) {
                    var ee = _a[_i];
                    if (ee.indexOf('x') >= 0) {
                        vm.hasRelay = true;
                    }
                }
                $timeout($anchorScroll);
            });
        }
        vm.sortWinnersBy = function (type, index) {
            function byTime(a, b, index) {
                return sortTime(a.events[index].time, b.events[index].time);
            }
            function byKey(a, b, key) {
                if (a[key] < b[key]) {
                    return -1;
                }
                if (b[key] < a[key]) {
                    return 1;
                }
                return 0;
            }
            if (type === 'event') {
                vm.event.winners = vm.event.winners.sort(function (a, b) {
                    var aTime = a.events[index].time, bTime = b.events[index].time;
                    if (aTime && bTime) {
                        return byTime(a, b, index) || byKey(a, b, 'points') || byKey(a, b, 'user');
                    }
                    else if (aTime) {
                        return -1;
                    }
                    else if (bTime) {
                        return 1;
                    }
                    else {
                        return byKey(a, b, 'points') || byKey(a, b, 'user');
                    }
                });
            }
            else {
                vm.event.winners = _.orderBy(vm.event.winners, ['place', function (w) { return w.events[0].time; }, 'user']);
            }
        };
        vm.changeTab = function (tab) {
            vm.tab = tab;
            $state.go($state.$current.name, { tab: tab });
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
                var $win = angular.element($window);
                var fixed = parseInt(attrs.fixedTop) || 50;
                $win.on('scroll', function (e) {
                    var width = Math.max(window.innerWidth, document.documentElement.clientWidth);
                    if (width < 550 || $window.pageYOffset < fixed) {
                        elem.css({ position: 'relative', top: '' });
                    }
                    else {
                        elem.css({ position: 'relative', top: ($window.pageYOffset - fixed) + 'px' });
                    }
                });
            }
        };
    }]);
