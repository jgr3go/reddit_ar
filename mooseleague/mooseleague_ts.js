// to prevent this loading twice in dev - hacky hacky whatever shut your face
// if (!window['apploaded']) {
//   window['apploaded'] = true;
//   throw "Already loaded";
// }
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
        this.Events = [];
        this.Users = [];
        this.Divisions = [];
        this.built = false;
        this.USER_COLUMNS = {
            USERNAME: 0,
            DIVISION: 1,
            AGE: 2,
            SEX: 3,
            RESULT: 4,
            NOTES: 5,
            LINKS: 6
        };
    }
    GoogleSvc.prototype.ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GAPI];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gapi.client.load('sheets', 'v4')];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GoogleSvc.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSpreadsheet()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GoogleSvc.prototype.getSpreadsheet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.spreadsheet) {
                            return [2 /*return*/, this.spreadsheet];
                        }
                        return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gapi.client.sheets.spreadsheets.get({
                                spreadsheetId: '1ZC7pDg9VRiqnd4-w15LUSWcvQXti62IOSp0dcYj2JZI',
                                includeGridData: true
                            })];
                    case 2:
                        sheet = _a.sent();
                        console.log(sheet.result);
                        this.spreadsheet = sheet.result;
                        return [2 /*return*/, this.spreadsheet];
                }
            });
        });
    };
    GoogleSvc.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.built) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getSpreadsheet()];
                    case 1:
                        _a.sent();
                        this.buildEvents();
                        this.buildUsers();
                        this.buildDivisions();
                        this.mergeEventsUsers();
                        this.built = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    GoogleSvc.prototype.buildEvents = function () {
        var _a, _b, _c, _d;
        var events = [];
        for (var _i = 0, _e = this.spreadsheet.sheets; _i < _e.length; _i++) {
            var sheet = _e[_i];
            var evt = {};
            evt.name = sheet.properties.title;
            var data = sheet.data[0];
            if (!data || !data.rowData) {
                continue;
            }
            for (var _f = 0, _g = data.rowData; _f < _g.length; _f++) {
                var row = _g[_f];
                if (!row.values || !row.values.length) {
                    continue;
                }
                switch ((_a = row.values[0]) === null || _a === void 0 ? void 0 : _a.formattedValue) {
                    case 'Event':
                        evt.events = (_b = row.values[1]) === null || _b === void 0 ? void 0 : _b.formattedValue;
                    case 'Date':
                        evt.date = moment((_c = row.values[1]) === null || _c === void 0 ? void 0 : _c.formattedValue).year(moment().year());
                        evt.displayDate = moment(evt.date).format('MMM D, YYYY');
                    case 'Results':
                        evt.link = (_d = row.values[1]) === null || _d === void 0 ? void 0 : _d.formattedValue;
                    default:
                        break;
                }
                evt.state = evt.name;
                evt.url = "/" + evt.name.split(' ').join('').toLowerCase();
                evt.editLink = this.spreadsheet.spreadsheetUrl + "#gid=" + sheet.properties.sheetId;
                evt.results = evt.events.split(',').map(function (e) {
                    return {
                        race: e,
                        divisions: [],
                        times: []
                    };
                });
            }
            events.push(evt);
        }
        this.Events = events;
    };
    GoogleSvc.prototype.buildUsers = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var users = [];
        var COL = this.USER_COLUMNS;
        for (var _i = 0, _j = this.spreadsheet.sheets; _i < _j.length; _i++) {
            var sheet = _j[_i];
            var eventName = sheet.properties.title;
            var raceName = void 0;
            var data = sheet.data[0];
            if (!data || !data.rowData) {
                continue;
            }
            var startUserRows = false;
            var _loop_1 = function (row) {
                if (!row.values || !row.values.length) {
                    return "continue";
                }
                if (!startUserRows) {
                    if (((_a = row.values[0]) === null || _a === void 0 ? void 0 : _a.formattedValue) == 'Event') {
                        raceName = (_b = row.values[1]) === null || _b === void 0 ? void 0 : _b.formattedValue;
                    }
                    if (((_c = row.values[0]) === null || _c === void 0 ? void 0 : _c.formattedValue) == 'Username') {
                        startUserRows = true;
                    }
                }
                else {
                    var username_1 = ((_d = row.values[COL.USERNAME]) === null || _d === void 0 ? void 0 : _d.formattedValue) || "";
                    if (!username_1) {
                        return "break";
                    }
                    // first time finding user, add to master list
                    if (!users.find(function (u) { return u.user.toLowerCase() == username_1.toLowerCase(); })) {
                        var user_1 = {
                            user: username_1,
                            division: ((_e = row.values[COL.DIVISION]) === null || _e === void 0 ? void 0 : _e.formattedValue) || "",
                            age: parseInt((_f = row.values[COL.AGE]) === null || _f === void 0 ? void 0 : _f.formattedValue) || null,
                            sex: (_h = (_g = row.values[COL.SEX]) === null || _g === void 0 ? void 0 : _g.formattedValue) === null || _h === void 0 ? void 0 : _h.substr(0).toUpperCase(),
                            results: []
                        };
                        user_1.link = "https://reddit.com/u/" + user_1.user;
                        users.push(user_1);
                    }
                    var user_2 = users.find(function (u) { return u.user.toLowerCase() == username_1.toLowerCase(); });
                    user_2.results.push({
                        event: eventName,
                        times: raceName.split(',').map(function (r) {
                            var _a, _b, _c, _d;
                            return {
                                race: r,
                                username: user_2.user,
                                division: user_2.division,
                                time: (_a = row.values[COL.RESULT]) === null || _a === void 0 ? void 0 : _a.formattedValue,
                                note: (_b = row.values[COL.NOTES]) === null || _b === void 0 ? void 0 : _b.formattedValue,
                                links: (_d = (_c = row.values[COL.LINKS]) === null || _c === void 0 ? void 0 : _c.formattedValue) === null || _d === void 0 ? void 0 : _d.split(',').map(function (link) {
                                    return {
                                        type: link.match(/strava/) ? 'strava' : (link.match(/youtu/) ? 'youtube' : ''),
                                        url: link
                                    };
                                })
                            };
                        })
                    });
                }
            };
            for (var _k = 0, _l = data.rowData; _k < _l.length; _k++) {
                var row = _l[_k];
                var state_1 = _loop_1(row);
                if (state_1 === "break")
                    break;
            }
        }
        this.Users = users;
    };
    GoogleSvc.prototype.buildDivisions = function () {
        var divisions = [];
        var _loop_2 = function (user) {
            if (!divisions.find(function (d) { return d.name.toLowerCase() == user.division.toLowerCase(); })) {
                divisions.push({
                    name: user.division,
                    users: []
                });
            }
            var division = divisions.find(function (d) { return d.name.toLowerCase() == user.division.toLowerCase(); });
            division.users.push(user);
        };
        for (var _i = 0, _a = this.Users; _i < _a.length; _i++) {
            var user = _a[_i];
            _loop_2(user);
        }
    };
    GoogleSvc.prototype.mergeEventsUsers = function () {
        var _loop_3 = function (evt) {
            var _loop_5 = function (user) {
                // add DNS events to every user for events they didn't do
                if (!user.results.find(function (r) { return r.event.toLowerCase() == evt.name.toLowerCase(); })) {
                    user.results.push({
                        event: evt.name,
                        times: evt.events.split(',').map(function (race) { return ({
                            race: race,
                            username: user.user,
                            division: user.division,
                            note: 'DNS'
                        }); })
                    });
                }
            };
            for (var _i = 0, _a = this_1.Users; _i < _a.length; _i++) {
                var user = _a[_i];
                _loop_5(user);
            }
        };
        var this_1 = this;
        // first merge any events into the users
        for (var _i = 0, _a = this.Events; _i < _a.length; _i++) {
            var evt = _a[_i];
            _loop_3(evt);
        }
        // then merge user results into the events
        for (var _b = 0, _c = this.Users; _b < _c.length; _b++) {
            var user = _c[_b];
            var _loop_4 = function (result) {
                var evt = this_2.Events.find(function (e) { return e.name.toLowerCase() == result.event.toLowerCase(); });
                if (evt) {
                    var _loop_6 = function (time) {
                        var evtResult = evt.results.find(function (r) { return r.race.toLowerCase() == time.race.toLowerCase(); });
                        evtResult.times.push(time);
                        if (!evtResult.divisions.find(function (d) { return d.race.toLowerCase() == time.race.toLowerCase()
                            && d.name.toLowerCase() == time.division.toLowerCase(); })) {
                            evtResult.divisions.push({
                                name: time.division,
                                race: time.race,
                                points: null,
                                athletes: 0,
                                note: null,
                                place: null
                            });
                        }
                    };
                    for (var _i = 0, _a = result.times; _i < _a.length; _i++) {
                        var time = _a[_i];
                        _loop_6(time);
                    }
                }
            };
            var this_2 = this;
            for (var _d = 0, _e = user.results; _d < _e.length; _d++) {
                var result = _e[_d];
                _loop_4(result);
            }
        }
    };
    GoogleSvc.prototype.listEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.build()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.Events];
                }
            });
        });
    };
    GoogleSvc.prototype.listUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.build()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.Users];
                }
            });
        });
    };
    GoogleSvc.prototype.listDivisions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.build()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.Divisions];
                }
            });
        });
    };
    return GoogleSvc;
}());
var Events = /** @class */ (function () {
    function Events($http, $q, google) {
        this.$http = $http;
        this.$q = $q;
        this.google = google;
        this.events = [];
    }
    Events.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.events && this.events.length) {
                            return [2 /*return*/, this.events];
                        }
                        _a = this;
                        return [4 /*yield*/, this.google.listEvents()];
                    case 1:
                        _a.events = _b.sent();
                        this.events = _.orderBy(this.events, function (e) { return e.date; });
                        return [2 /*return*/, this.events];
                }
            });
        });
    };
    Events.prototype.get = function (eventName) {
        return __awaiter(this, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        events = _a.sent();
                        return [2 /*return*/, events.find(function (x) { return x.name.replace(/\s+/g, '').toLowerCase() == eventName.replace(/\s+/g, '').toLowerCase(); })];
                }
            });
        });
    };
    Events.prototype.latest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, date;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        events = _a.sent();
                        if (events.length == 1) {
                            return [2 /*return*/, events[0]];
                        }
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
    Events.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, next, ii;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        events = _a.sent();
                        if (events.length == 1) {
                            return [2 /*return*/, events[0]];
                        }
                        next = events[events.length - 1];
                        for (ii = events.length - 1; ii >= 0; ii--) {
                            if (moment(events[ii].date) >= moment().startOf('day')) {
                                next = events[ii];
                            }
                        }
                        return [2 /*return*/, next];
                }
            });
        });
    };
    Events.$inject = ['$http', '$q', 'Google'];
    return Events;
}());
var Users = /** @class */ (function () {
    function Users(google, timeSvc, ageSvc) {
        this.google = google;
        this.timeSvc = timeSvc;
        this.ageSvc = ageSvc;
        this.users = [];
    }
    Users.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _i, _b, user, _c, _d, result, _e, _f, time;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (this.users.length) {
                            return [2 /*return*/, this.users];
                        }
                        _a = this;
                        return [4 /*yield*/, this.google.listUsers()];
                    case 1:
                        _a.users = _g.sent();
                        for (_i = 0, _b = this.users; _i < _b.length; _i++) {
                            user = _b[_i];
                            for (_c = 0, _d = user.results; _c < _d.length; _c++) {
                                result = _d[_c];
                                for (_e = 0, _f = result.times; _e < _f.length; _e++) {
                                    time = _f[_e];
                                    time.time_number = this.timeSvc.toNumber(time.time);
                                    time.graded_number = this.ageSvc.calculate(time.race, user.age, user.sex, time.time_number, user.user);
                                    time.graded = this.timeSvc.toString(time.graded_number);
                                }
                            }
                        }
                        return [2 /*return*/, this.users];
                }
            });
        });
    };
    Users.$inject = ['Google', 'TimeService', 'AgeService'];
    return Users;
}());
var Divisions = /** @class */ (function () {
    function Divisions(google) {
        this.google = google;
        this.divisions = [];
    }
    Divisions.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.divisions.length) {
                            return [2 /*return*/, this.divisions];
                        }
                        _a = this;
                        return [4 /*yield*/, this.google.listDivisions()];
                    case 1:
                        _a.divisions = _b.sent();
                        return [2 /*return*/, this.divisions];
                }
            });
        });
    };
    Divisions.$inject = ['Google'];
    return Divisions;
}());
var Results = /** @class */ (function () {
    function Results(Events, Users, Divisions) {
        this.Events = Events;
        this.Users = Users;
        this.Divisions = Divisions;
    }
    Results.prototype.calculate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, users, divisions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.results) {
                            return [2 /*return*/, this.results];
                        }
                        return [4 /*yield*/, this.Events.list()];
                    case 1:
                        events = _a.sent();
                        return [4 /*yield*/, this.Users.list()];
                    case 2:
                        users = _a.sent();
                        return [4 /*yield*/, this.Divisions.list()];
                    case 3:
                        divisions = _a.sent();
                        this.score(events);
                        console.log({ events: events });
                        this.results = events;
                        return [2 /*return*/, this.results];
                }
            });
        });
    };
    Results.prototype.score = function (events) {
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            for (var _a = 0, _b = event_1.results; _a < _b.length; _a++) {
                var race = _b[_a];
                var divs = _.keyBy(race.divisions, function (d) { return d.name.toLowerCase(); });
                race.times = _.orderBy(race.times, function (t) { return t.graded_number; });
                var place = 1;
                for (var _c = 0, _d = race.times; _c < _d.length; _c++) {
                    var time = _d[_c];
                    if (time.time) {
                        time.place = place++;
                        time.points = time.place;
                        var divname = time.division.toLowerCase();
                        divs[divname].athletes += 1;
                        if (divs[divname].athletes <= 5) {
                            divs[divname].points += time.place;
                        }
                    }
                    else {
                        time.points = null;
                    }
                }
                race.divisions = _.orderBy(race.divisions, [function (d) { return d.athletes >= 5 ? -1 : 1; }, function (d) { return d.points; }]);
                place = 1;
                for (var _e = 0, _f = race.divisions; _e < _f.length; _e++) {
                    var div = _f[_e];
                    if (div.athletes >= 5) {
                        div.place = place++;
                    }
                    else {
                        div.note = "DQ (Not enough finishers)";
                    }
                }
            }
        }
    };
    Results.prototype.getEventResults = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.calculate()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.results.find(function (x) { return x.name.replace(/\s+/g, '').toLowerCase() == name.replace(/\s+/g, '').toLowerCase(); })];
                }
            });
        });
    };
    Results.$inject = ['Events', 'Users', 'Divisions'];
    return Results;
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
                            evt.date = moment(evt.date).format('MMM D, YYYY');
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
        this.crumbs = [];
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
                    case 0: return [4 /*yield*/, Promise.all([this.Events.list(), this.Events.next()])];
                    case 1:
                        _a = _b.sent(), evts = _a[0], evt = _a[1];
                        this.events = evts;
                        this.next = {
                            name: evt.name.toUpperCase(),
                            date: moment(evt.date),
                            state: evt.state,
                            displayDate: moment(evt.date).format('MMM D, YYYY'),
                            live: false
                        };
                        this.countdown();
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
    MainController.prototype.getBreadcrumbs = function () {
        if (this.$state.current.name === this.lastState) {
            return this.crumbs;
        }
        this.lastState = this.$state.current.name;
        this.crumbs = [];
        if (this.lastState !== 'Calendar') {
            this.crumbs = [
                { name: 'Home', last: false, link: 'Calendar' },
                { name: this.lastState, last: true }
            ];
        }
        else {
            this.crumbs = [
                { name: 'Home', last: true }
            ];
        }
        return this.crumbs;
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
var EventController = /** @class */ (function () {
    function EventController($http, $state, $timeout, $location, $anchorScroll, $params, Events, Results) {
        this.$http = $http;
        this.$state = $state;
        this.$timeout = $timeout;
        this.$location = $location;
        this.$anchorScroll = $anchorScroll;
        this.$params = $params;
        this.Events = Events;
        this.Results = Results;
        this.tab = 'results';
        this.hasRelay = false;
        this.$anchorScroll.yOffset = 60;
        this.init();
    }
    EventController.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eventName, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.$params.tab) {
                            this.tab = this.$params.tab;
                        }
                        eventName = this.$state.current.name;
                        _a = this;
                        return [4 /*yield*/, this.Results.getEventResults(eventName)];
                    case 1:
                        _a.event = _b.sent();
                        console.log({ event: this.event });
                        this.$timeout(this.$anchorScroll);
                        return [2 /*return*/];
                }
            });
        });
    };
    EventController.prototype.changeTab = function (tab) {
        this.tab = tab;
        this.$state.go(this.$state.current.name, { tab: tab });
    };
    EventController.$inject = ['$http', '$state', '$timeout', '$location', '$anchorScroll',
        '$stateParams', 'Events', 'Results'];
    return EventController;
}());
var AgeService = /** @class */ (function () {
    function AgeService() {
    }
    AgeService.parse = function (file) {
        var lines = file.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (!line.trim()) {
                continue;
            }
            var parts = line.split('\t');
            if (parts[0] == 'Event') {
                continue;
            }
            var grade = {
                event: parts[1],
                isRoad: parts[2] == '1',
                mf: parts[0].substr(0)
            };
            var START = 4;
            for (var ii = START; ii < parts.length - START - 1; ii++) {
                var age = ii + 1;
                var factor = parseFloat(parts[ii]);
                var id = parts[0];
                if (!AgeService.GRADES[id]) {
                    AgeService.GRADES[id] = {};
                }
                AgeService.GRADES[id][age] = Object.assign({ age: age, factor: factor, id: id }, grade);
            }
        }
        console.log(AgeService.GRADES);
    };
    AgeService.prototype.calculate = function (event, age, sex, seconds, username) {
        if (!seconds) {
            return seconds;
        }
        if (!sex) {
            sex = 'M';
        }
        var mfEventId = "" + sex + event;
        var gradedTime = seconds;
        var factor = 1;
        if (AgeService.GRADES[mfEventId]) {
            var mfEvent = AgeService.GRADES[mfEventId];
            if (mfEvent[age]) {
                factor = mfEvent[age].factor;
                gradedTime = seconds * factor;
            }
        }
        console.log(username + " " + mfEventId + " age:" + age + " time:" + seconds + " factor:" + factor + " graded:" + gradedTime);
        return gradedTime;
    };
    AgeService.GRADES = {};
    return AgeService;
}());
var TimeService = /** @class */ (function () {
    function TimeService() {
    }
    TimeService.prototype.toString = function (time) {
        if (!time) {
            return null;
        }
        var hours = Math.floor(time / (60 * 60));
        time = time - (hours * 60 * 60);
        var minutes = Math.floor(time / 60);
        time = time - (minutes * 60);
        var seconds = time.toFixed(1);
        var secondsNum = time;
        if (hours) {
            return hours + ":" + _.padStart(minutes + '', 2, '0') + ":" + ((secondsNum < 10 ? '0' : '') + seconds);
        }
        else {
            return minutes + ":" + ((secondsNum < 10 ? '0' : '') + seconds);
        }
    };
    TimeService.prototype.toNumber = function (time) {
        if (!time) {
            return null;
        }
        var parts = time.split(':').map(function (t) { return parseFloat(t); });
        if (parts.length == 3) {
            return parts[0] * 60 * 60 + parts[1] * 60 + parseFloat('' + parts[2]);
        }
        else {
            return parts[0] * 60 + parseFloat('' + parts[1]);
        }
    };
    return TimeService;
}());
function promiseFix($rootScope) {
    // await fix -- runs a digest manually on await because it doesn't naturally
    Promise = (function (Promise) {
        var NewPromise = function (fn) {
            var promise = new Promise(fn);
            promise.then(function (value) {
                $rootScope.$applyAsync();
                return value;
            }, function (err) {
                $rootScope.$applyAsync();
                throw err;
            });
            return promise;
        };
        // Clone the prototype
        NewPromise.prototype = Promise.prototype;
        // Clone all writable instance properties
        for (var _i = 0, _a = Object.getOwnPropertyNames(Promise); _i < _a.length; _i++) {
            var propertyName = _a[_i];
            var propertyDescription = Object.getOwnPropertyDescriptor(Promise, propertyName);
            if (propertyDescription.writable) {
                NewPromise[propertyName] = Promise[propertyName];
            }
        }
        return NewPromise;
    })(Promise);
}
function preload($http, $stateRegistry, $urlRouter, Events, ageSvc, google) {
    return google.load().then(function () {
        return Promise.all([
            Events.list()
                .then(function (evts) {
                for (var _i = 0, evts_3 = evts; _i < evts_3.length; _i++) {
                    var evt = evts_3[_i];
                    var state = {
                        name: evt.state,
                        templateUrl: BASE + "event.html",
                        controller: 'event',
                        url: evt.url + "?tab",
                        params: {
                            tab: { dynamic: true }
                        },
                        controllerAs: 'EC'
                    };
                    $stateRegistry.register(state);
                }
                // after registering states, listen on the router
                $urlRouter.sync();
                $urlRouter.listen();
            }),
            $http.get(BASE + "age-grade.txt")
                .then(function (x) { return x.data; })
                .then(function (data) {
                AgeService.parse(data);
            })
        ]);
    });
}
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
    .run(['$rootScope', promiseFix])
    .service('Google', GoogleSvc)
    .service('Events', Events)
    .service('Users', Users)
    .service('Divisions', Divisions)
    .service('AgeService', AgeService)
    .service('TimeService', TimeService)
    .service('Results', Results)
    .run(['$http', '$stateRegistry', '$urlRouter', 'Events', 'AgeService', 'Google', preload])
    .controller('calendar', Calendar)
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
            var _loop_7 = function (ii) {
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
                _loop_7(ii);
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
    .controller('event', EventController)
    // .controller('event', ['$http', '$state', '$timeout', '$location', '$anchorScroll', '$stateParams', 'resultsService',
    //   function ($http, $state, $timeout, $location, $anchorScroll, $params, resultsSvc) 
    //   {
    //     let vm = this;
    //     vm.tab = 'start';
    //     vm.hasRelay = false;
    //     $anchorScroll.yOffset = 60;
    //     function init() {
    //       if ($params.tab) {
    //         vm.tab = $params.tab;
    //       }
    //       let filename = $state.$current.name.split(' ').join('').toLowerCase() + '.txt';
    //       $http.get(BASE + filename)
    //         .then(res => res.data)
    //         .then(res => {
    //           let event = resultsSvc.parseFile(res);
    //           console.log(event);
    //           vm.event = event;
    //           vm.event.file = filename;
    //           vm.next = {
    //             date: event.date,
    //             name: event.name.toUpperCase()
    //           };
    //           vm.event.date = moment(new Date(vm.event.date)).format('MMM D, YYYY');
    //           for (let ee of event.events) {
    //             if (ee.indexOf('x') >= 0) {
    //               vm.hasRelay = true;
    //             }
    //           }
    //           $timeout($anchorScroll);
    //         });
    //     }
    //     vm.sortWinnersBy = function (type, index) {
    //       function byTime(a, b, index) {
    //         return sortTime(a.events[index].time, b.events[index].time);
    //       }
    //       function byKey(a, b, key) {
    //         if (a[key] < b[key]) { return -1; }
    //         if (b[key] < a[key]) { return 1; }
    //         return 0;
    //       }
    //       if (type === 'event') {
    //         vm.event.winners = vm.event.winners.sort((a, b) => {
    //           let aTime = a.events[index].time, bTime = b.events[index].time;
    //           if (aTime && bTime) {
    //             return byTime(a, b, index) || byKey(a, b, 'points') || byKey(a, b, 'user');
    //           } else if (aTime) {
    //             return -1;
    //           } else if (bTime) {
    //             return 1;
    //           } else {
    //             return byKey(a, b, 'points') || byKey(a, b, 'user');
    //           }
    //         });
    //       } else {
    //         vm.event.winners = _.orderBy(vm.event.winners, ['place', w => w.events[0].time, 'user']);
    //       } 
    //     };
    //     vm.changeTab = function (tab) {
    //       vm.tab = tab;
    //       $state.go($state.$current.name, {tab});
    //     };
    //     vm.scrollTo = function (league) {
    //       $location.hash(league.anchor);
    //       $anchorScroll();
    //     };
    //     init();
    //   }
    // ])
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
//# sourceMappingURL=mooseleague_ts.js.map