

// to prevent this loading twice in dev - hacky hacky whatever shut your face
// if (!window['apploaded']) {
//   window['apploaded'] = true;
//   throw "Already loaded";
// }


interface MEvent {
  name: string;
  url: string;
  date: string|Date|moment.Moment;
  state: string;
  events: string;
  link: string;
  editLink: string;

  displayDate: string;
  live?: boolean;
  days?: number;
  hours?: number;
  minutes?: number;

  results: MEventRaceResults[];
}
interface MEventRaceResults {
  race: string;
  divisions: MDivisionRaceResult[];
  times: MUserRaceResult[];
}
interface MUser {
  user: string;
  link: string;
  age: number;
  sex: Sex;
  division: string;
  results: MUserEventResult[];
}
interface MUserEventResult {
  event: string;
  times: MUserRaceResult[];
}
interface MUserRaceResult {
  username: string;
  race: string;
  time: string;
  time_number: number;
  graded: string;
  graded_number: number;
  note: string;
  links: MLink[];
  place: number;
  points: number;
  division: string;
}
interface MDivision {
  name: string;
  users: Array<MUser>;
}
interface MDivisionRaceResult {
  name: string;
  race: string;
  points: number;
  athletes: number;
  note: string;
  place: number;
}
interface MLink {
  type: string;
  url: string;
}




let BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';

if (window.location.href.match(/localhost/)) {
  BASE = '';
}

let GAPI = new Promise((resolve, reject) => {
  gapi.load('client', {
    callback: async () => {
      await gapi.client.init({apiKey: 'AIzaSyCzp1XThhfQZLh6YcTKwLzg65ZjLzc5tqE'});
      resolve();
    }
  });
});


function sortTime(a, b) {
  let at = a ? toSeconds(a) : null;
  let bt = b ? toSeconds(b) : null;
  if (at < bt) { return -1; }
  if (bt < at) { return 1; }
  return 0;
}
function toSeconds(time) {
  let parts = time.split(':');
  if (parts.length === 1) {
    return parseFloat(parts[0]);
  }
  let min = parseInt(parts[0]) * 60;
  let sec = parseFloat(parts[1]);
  return min + sec;
}
function fromSeconds(seconds: number) {
  let min = Math.floor(seconds / 60);
  let sec = parseFloat((seconds - (min * 60)).toFixed(1));
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
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



class GoogleSvc {
  private spreadsheet: gapi.client.sheets.Spreadsheet;
  private Events: Array<MEvent> = [];
  private Users: Array<MUser> = [];
  private Divisions: Array<MDivision> = [];
  private built: boolean = false;

  public USER_COLUMNS = {
    USERNAME: 0,
    DIVISION: 1,
    AGE: 2, 
    SEX: 3, 
    RESULT: 4,
    NOTES: 5,
    LINKS: 6
  };

  private async ready() {
    await GAPI;
    return await gapi.client.load('sheets', 'v4');
  }

  async load() {
    await this.getSpreadsheet();
  }
  private async getSpreadsheet(): Promise<gapi.client.sheets.Spreadsheet> {
    if (this.spreadsheet) { return this.spreadsheet; }
    await this.ready();
    let sheet = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: '1ZC7pDg9VRiqnd4-w15LUSWcvQXti62IOSp0dcYj2JZI',
      includeGridData: true
    });
    console.log(sheet.result);
    this.spreadsheet = sheet.result;
    return this.spreadsheet;
  }

  private async build() {
    if (this.built) { return; }
    await this.getSpreadsheet();
    this.buildEvents();
    this.buildUsers();
    this.buildDivisions();
    this.mergeEventsUsers();
    this.built = true;
  }

  private buildEvents() {
    let events: MEvent[] = [];
    for (let sheet of this.spreadsheet.sheets) {
      let evt: MEvent = <MEvent>{};
      evt.name = sheet.properties.title;
      let data = sheet.data[0];
      if (!data || !data.rowData) { continue; }
      for (let row of data.rowData) {
        if (!row.values || !row.values.length) { continue; }

        switch (row.values[0]?.formattedValue) {
          case 'Event':
            evt.events = row.values[1]?.formattedValue;
          case 'Date':
            evt.date = moment(row.values[1]?.formattedValue).year(moment().year());
            evt.displayDate = moment(evt.date).format('MMM D, YYYY');
          case 'Results':
            evt.link = row.values[1]?.formattedValue;
          default:
            break;
        }
        evt.state = evt.name;
        evt.url = `/${ evt.name.split(' ').join('').toLowerCase()}`;
        evt.editLink = `${this.spreadsheet.spreadsheetUrl}#gid=${sheet.properties.sheetId}`;
        evt.results = evt.events.split(',').map(e => {
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
  }

  private buildUsers() {
    let users: MUser[] = [];
    let COL = this.USER_COLUMNS;
    for (let sheet of this.spreadsheet.sheets) {
      let eventName = sheet.properties.title;
      let raceName: string;
      let data = sheet.data[0];
      if (!data || !data.rowData) { continue; }
      let startUserRows = false;
      for (let row of data.rowData) {
        if (!row.values || !row.values.length) { continue; }
        if (!startUserRows) {
          if (row.values[0]?.formattedValue == 'Event') {
            raceName = row.values[1]?.formattedValue;
          }
          if (row.values[0]?.formattedValue == 'Username') {
            startUserRows = true;
          }
        } else {
          let username = row.values[COL.USERNAME]?.formattedValue || "";
          if (!username) { break; }

          // first time finding user, add to master list
          if (!users.find(u => u.user.toLowerCase() == username.toLowerCase())) {
            let user: MUser = <MUser>{
              user: username,
              division: row.values[COL.DIVISION]?.formattedValue || "",
              age: parseInt(row.values[COL.AGE]?.formattedValue) || null,
              sex: row.values[COL.SEX]?.formattedValue?.substr(0).toUpperCase(),
              results: []
            };
            user.link = `https://reddit.com/u/${user.user}`;
            users.push(user);
          }
          let user = users.find(u => u.user.toLowerCase() == username.toLowerCase());
          user.results.push({
            event: eventName,
            times: raceName.split(',').map(r => {
              return <MUserRaceResult>{
                race: r,
                username: user.user,
                division: user.division,
                time: row.values[COL.RESULT]?.formattedValue,
                note: row.values[COL.NOTES]?.formattedValue,
                links: row.values[COL.LINKS]?.formattedValue?.split(',').map(link => {
                  return <MLink>{
                    type: link.match(/strava/) ? 'strava' : (link.match(/youtu/) ? 'youtube' : ''),
                    url: link
                  }
                })
              };
            })
          });
        }
      }
    }
    this.Users = users;
  }

  private buildDivisions() {
    let divisions: MDivision[] = [];
    for (let user of this.Users) {
      if (!divisions.find(d => d.name.toLowerCase() == user.division.toLowerCase())) {
        divisions.push({
          name: user.division,
          users: []
        });
      }
      let division = divisions.find(d => d.name.toLowerCase() == user.division.toLowerCase());
      division.users.push(user);
    }
  }

  private mergeEventsUsers() {
    // first merge any events into the users
    for (let evt of this.Events) {
      for (let user of this.Users) {
        // add DNS events to every user for events they didn't do
        if (!user.results.find(r => r.event.toLowerCase() == evt.name.toLowerCase())) {
          user.results.push({
            event: evt.name,
            times: evt.events.split(',').map(race => (<MUserRaceResult>{
              race: race,
              username: user.user,
              division: user.division,
              note: 'DNS'
            }))
          })
        }
      }
    }
    // then merge user results into the events
    for (let user of this.Users) {
      for (let result of user.results) {
        let evt = this.Events.find(e => e.name.toLowerCase() == result.event.toLowerCase());
        if (evt) {
          for (let time of result.times) {
            let evtResult = evt.results.find(r => r.race.toLowerCase() == time.race.toLowerCase());
            evtResult.times.push(time);
            if (!evtResult.divisions.find(d => d.race.toLowerCase() == time.race.toLowerCase()
                                            && d.name.toLowerCase() == time.division.toLowerCase())) 
            {
              evtResult.divisions.push({
                name: time.division,
                race: time.race,
                points: null,
                athletes: 0,
                note: null,
                place: null
              });
            }
          }
        }
      }
    }
  }

  async listEvents(): Promise<MEvent[]> {
    await this.build();
    return this.Events;
  }

  async listUsers(): Promise<MUser[]> {
    await this.build();
    return this.Users;
  }

  async listDivisions(): Promise<MDivision[]> {
    await this.build();
    return this.Divisions;
  }
}


class Events {
  static $inject = ['$http', '$q', 'Google'];
  private events: Array<MEvent> = [];

  constructor(public $http: angular.IHttpService, 
              public $q: angular.IQService, 
              public google: GoogleSvc) { }

  async list(): Promise<Array<MEvent>> {
    if (this.events && this.events.length) { return this.events; }
    this.events = await this.google.listEvents();
    this.events = _.orderBy(this.events, e => e.date);
    return this.events;
  }

  async get(eventName: string): Promise<MEvent> {
    let events = await this.list();
    return events.find(x => x.name.replace(/\s+/g, '').toLowerCase() == eventName.replace(/\s+/g, '').toLowerCase());
  }

  async latest() {
    let events = await this.list();
    if (events.length == 1) {
      return events[0];
    }
    if (events[events.length- 2]) {
      let date = moment(events[events.length - 2].date).format('YYYY-MM-DD');
      if (moment().format('YYYY-MM-DD') == date) {
        return events[events.length - 2];
      }
    }
    return events[events.length - 1];
  }

  async next() {
    let events = await this.list();
    if (events.length == 1) {
      return events[0];
    }
    let next = events[events.length - 1];
    for (let ii = events.length - 1; ii >= 0; ii--) {
      if (moment(events[ii].date) >= moment().startOf('day')) {
        next = events[ii];
      }
    }
    return next;
  }
}

class Users {
  users: MUser[] = [];

  static $inject = ['Google', 'TimeService', 'AgeService'];
  constructor(public google: GoogleSvc, public timeSvc: TimeService, public ageSvc: AgeService) {}

  async list() {
    if (this.users.length) { return this.users; }
    this.users = await this.google.listUsers();
    for (let user of this.users) {
      for (let result of user.results) {
        for (let time of result.times) {
          time.time_number = this.timeSvc.toNumber(time.time);
          time.graded_number = this.ageSvc.calculate(time.race, user.age, user.sex, time.time_number, user.user);
          time.graded = this.timeSvc.toString(time.graded_number);
        }
      }
    }
    return this.users;
  }
}

class Divisions {
  divisions: MDivision[] = [];

  static $inject = ['Google'];
  constructor(private google: GoogleSvc) {}

  async list() {
    if (this.divisions.length) { return this.divisions; }
    this.divisions = await this.google.listDivisions();
    return this.divisions;
  }
}

class Results {
  results: MEvent[];

  static $inject = ['Events', 'Users', 'Divisions'];
  constructor(private Events: Events,
              private Users: Users,
              private Divisions: Divisions) {}

  async calculate() {
    if (this.results) { return this.results; }

    let events = await this.Events.list();
    let users = await this.Users.list();
    let divisions = await this.Divisions.list();

    this.score(events);
    console.log({events})
    this.results = events;
    return this.results;
  }

  score(events: MEvent[]) {
    for (let event of events) {
      for (let race of event.results) {
        let divs = _.keyBy(race.divisions, d => d.name.toLowerCase());

        race.times = _.orderBy(race.times, t => t.graded_number);
        
        let place = 1;
        for (let time of race.times) {
          if (time.time) {
            time.place = place++;
            time.points = time.place;
            let divname = time.division.toLowerCase();
            divs[divname].athletes += 1;
            if (divs[divname].athletes <= 5) {
              divs[divname].points += time.place;
            }
          }
          else {
            time.points = null;
          }
        }

        race.divisions = _.orderBy(race.divisions, [d => d.athletes >= 5 ? -1 : 1, d => d.points]);
        place = 1;
        for (let div of race.divisions) {  
          if (div.athletes >= 5) {
            div.place = place++;
          } else {
            div.note = "DQ (Not enough finishers)";
          }
        }
      }
    }
  }

  async getEventResults(name: string) {
    await this.calculate();
    return this.results.find(x => x.name.replace(/\s+/g, '').toLowerCase() == name.replace(/\s+/g, '').toLowerCase());
  }
}

class Calendar {
  static $inject = ['$http', 'Events'];
  events: Array<MEvent> = [];
  constructor (public $http: angular.IHttpService, public Events: Events) {
    this.init();
  }

  async init() {
    this.events = [];

    let evts = await this.Events.list();
    for (let evt of evts) {
      evt = _.clone(evt);
      evt.date = moment(evt.date).format('MMM D, YYYY');
      this.events.push(evt);
    }
  }
}


class Leaderboard {
  static $inject = ['$http', 'Events', '$q', 'resultsSvc'];
  constructor(public $http: angular.IHttpService, public Events: Events, public $q: angular.IQService, public resultsSvc) {
    this.init();
  }

  async init() {
    let evts = await this.Events.list();
    let allResults = [];
    for (let evt of evts) {
      
    }
  }
}

interface BreadCrumb {
  name: string;
  last: boolean;
  link?: string;
}

class MainController {
  public isMobile: boolean;
  public autoplay: boolean;
  public events: Array<MEvent> = [];
  public next: MEvent;
  public autoplayKey: string;
  public lastState: string;
  public crumbs: BreadCrumb[] = [];

  static $inject = ['$http', '$location', '$timeout', '$state', 'Events', '$sce'];
  constructor(public $http: angular.IHttpService, 
              public $location: angular.ILocationService, 
              public $timeout: angular.ITimeoutService, 
              public $state: ng.ui.IStateService, 
              public Events: Events, 
              public $sce: angular.ISCEService) 
  {
    this.autoplay = localStorage.getItem('autoplay2020') === null ? true : localStorage.getItem('autoplay2020') == 'true';
    this.isMobile = isMobile();
    this.autoplayKey = 'autoplay' + moment().year();
    this.init();
  }

  async init() {
    let [evts, evt] = await Promise.all([this.Events.list(), this.Events.next()]);
    this.events = evts;
    this.next = <MEvent>{
      name: evt.name.toUpperCase(),   
      date: moment(evt.date),
      state: evt.state,
      displayDate: moment(evt.date).format('MMM D, YYYY'),
      live: false
    };
    this.countdown();
  }

  countdown() {
    if (this.next) {
      let now = moment();
      let evt = moment(this.next.date);

      if (now.format('YYYY-MM-DD') === evt.format('YYYY-MM-DD')) {
        this.next.live = true;
      } else {
        let days = evt.diff(now, 'days');
        this.next.days = days;
        evt.subtract(days, 'days');
        let hours = evt.diff(now, 'hours');
        this.next.hours = hours;
        evt.subtract(hours, 'hours');
        let minutes = evt.diff(now, 'minutes');
        this.next.minutes = minutes;
      }
      this.$timeout(() => this.countdown(), 1000 * 60);
    } else {
      this.$timeout(() => this.countdown(), 500);
    }
  }

  getBreadcrumbs() {
    if (this.$state.current.name === this.lastState) {
      return this.crumbs;
    }
    
    this.lastState = this.$state.current.name;
    this.crumbs = [];
    if (this.lastState !== 'Calendar') {
      this.crumbs = [
        {name: 'Home', last: false, link: 'Calendar'},
        {name: this.lastState, last: true}
      ];
    } else {
      this.crumbs = [
        {name: 'Home', last: true}
      ];
    }
    return this.crumbs;
  }

  stopAutoplay() {
    localStorage.setItem(this.autoplayKey, 'false');
    this.autoplay = false;
  }
  startAutoplay() {
    localStorage.setItem(this.autoplayKey, 'true');
    this.autoplay = true;
  }
  shouldAutoplay() {
    let ap = localStorage.getItem(this.autoplayKey);
    return !(ap === 'false');
  }
  getThemeUrl() {
    let ap = this.shouldAutoplay();
    return this.$sce.trustAsResourceUrl(`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/460111206&amp;auto_play=${ap}&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`);
  }
}


class EventController {
  tab: string = 'results';
  hasRelay: boolean = false;
  event: MEvent;

  static $inject = ['$http', '$state', '$timeout', '$location', '$anchorScroll', 
                    '$stateParams', 'Events', 'Results'];
  constructor(private $http: angular.IHttpService,
              private $state: ng.ui.IStateService,
              private $timeout: angular.ITimeoutService,
              private $location: angular.ILocationService,
              private $anchorScroll: angular.IAnchorScrollService,
              private $params: ng.ui.IStateParamsService,
              private Events: Events,
              private Results: Results)
  {
    this.$anchorScroll.yOffset = 60;
    this.init();
  }

  async init() {
    if (this.$params.tab) {
      this.tab = this.$params.tab;
    }
    let eventName = this.$state.current.name;
    this.event = await this.Results.getEventResults(eventName);
    console.log({event: this.event});

    this.$timeout(this.$anchorScroll);
  }

  changeTab(tab: string) {
    this.tab = tab;
    this.$state.go(this.$state.current.name, {tab});
  }
}

interface Grade {
  id: string;
  event: string;
  isRoad: boolean; 
  mf: Sex;
  age: number;
  factor: number;
}
type Sex = 'F'|'M';
class AgeService {
  static GRADES: {[mfEventId: string]: {[age: number]: Grade}} = {};

  static parse(file: string) {
    let lines = file.split('\n');
    for (let line of lines) {
      if (!line.trim()) { continue; }
      let parts = line.split('\t');
      if (parts[0] == 'Event') { continue; }
      let grade: Partial<Grade> = {
        event: parts[1],
        isRoad: parts[2] == '1',
        mf: <Sex>parts[0].substr(0)
      };
      let START = 4;
      for (let ii = START; ii < parts.length - START - 1; ii++) {
        let age = ii + 1;
        let factor = parseFloat(parts[ii]);
        let id = parts[0];
        if (!AgeService.GRADES[id]) { AgeService.GRADES[id] = {}; }
        AgeService.GRADES[id][age] = <Grade>Object.assign({age, factor, id}, grade);
      }
    }
    console.log(AgeService.GRADES)
  }

  calculate(event: string, age: number, sex: Sex, seconds: number, username?: string) {
    if (!seconds) { return seconds; }
    if (!sex) { sex = 'M'; }
    let mfEventId = `${sex}${event}`;
    let gradedTime = seconds;
    let factor = 1;
    if (AgeService.GRADES[mfEventId]) {
      let mfEvent = AgeService.GRADES[mfEventId];
      if (mfEvent[age]) {
        factor = mfEvent[age].factor;
        gradedTime = seconds * factor;
      }
    }
    console.log(`${username} ${mfEventId} age:${age} time:${seconds} factor:${factor} graded:${gradedTime}`)
    return gradedTime;
  }
}

class TimeService {
  toString(time: number): string {
    if (!time) { return null; }
    let hours = Math.floor(time / (60 * 60));
    time = time - (hours * 60 * 60);
    let minutes = Math.floor(time / 60);
    time = time - (minutes * 60);
    let seconds = time.toFixed(1);
    let secondsNum = time;
    if (hours) {
      return `${hours}:${_.padStart(minutes+'',2,'0')}:${(secondsNum < 10 ? '0' : '') + seconds}`;
    } else {
      return `${minutes}:${(secondsNum < 10 ? '0' : '') + seconds}`;
    }
  }

  toNumber(time: string): number {
    if (!time) { return null; }
    let parts = time.split(':').map(t => parseFloat(t));
    if (parts.length == 3) {
      return parts[0]*60*60 + parts[1]*60 + parseFloat(''+parts[2]);
    } else {
      return parts[0]*60 + parseFloat(''+parts[1]);
    }
  }
}


function promiseFix($rootScope) {
  // await fix -- runs a digest manually on await because it doesn't naturally
  Promise = ((Promise) => {
    const NewPromise = function (fn) {
      const promise = new Promise(fn);

      promise.then((value) => {
        $rootScope.$applyAsync();
        return value;
      }, (err) => {
        $rootScope.$applyAsync();
        throw err;
      });

      return promise;
    };

    // Clone the prototype
    NewPromise.prototype = Promise.prototype;

    // Clone all writable instance properties
    for (const propertyName of Object.getOwnPropertyNames(Promise)) {
      const propertyDescription = Object.getOwnPropertyDescriptor(Promise, propertyName);

      if (propertyDescription.writable) {
        NewPromise[propertyName] = Promise[propertyName];
      }
    }
    return NewPromise;
  })(Promise) as any;
}

function preload($http, $stateRegistry, $urlRouter, Events: Events, ageSvc: AgeService, google: GoogleSvc) {
  return google.load().then(() => {
    return Promise.all([
      Events.list()
        .then(evts => {
          for (let evt of evts) {
            let state = {
              name: evt.state,
              templateUrl: `${BASE}event.html`,
              controller: 'event',
              url: evt.url + "?tab",
              params: {
                tab: {dynamic: true}
              },
              controllerAs: 'EC'
            };
            $stateRegistry.register(state);
          }
          // after registering states, listen on the router
          $urlRouter.sync();
          $urlRouter.listen();

        }),
      $http.get(`${BASE}age-grade.txt`)
        .then(x => x.data)
        .then(data => {
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
  .factory('resultsService', [function() {
    let svc: any = {};

    svc.parseFile = function(data) {
      let lines = data.split('\n');

      let event: any = {
        name: lines[0].trim(),
        date: moment(lines[1].trim()),
        events: lines[2].split(',').map(a => a.trim()),
        leagues: [],
        h2h: []
      };

      lines.splice(0, 3);

      let curLeague: any = {};
      let allUsers = {};

      let ii;
      // build leagues
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
      event.relayLeagueWinners = getRelayLeagueWinners(event);

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

      list = _.orderBy(list, [`heatPlace`, li => toSeconds(li.events[0].time), `user`], [`asc`, `asc`, `asc`]);

      return list;
    }

    function assignPlaceAndPoints(list, event, pointsKey, placeKey, maxPoints) {
      for (let ii = 0; ii < event.events.length; ii++) {
        let points = maxPoints;
        let place = 1;
        let prev;

        let byTime = _.orderBy(list, [li => toSeconds(li.events[ii].time), 'user']);
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

    function getRelayLeagueWinners(event) {
      let relayEvents = [];

      let isFuture = moment(event).format('YYYYMMDD') > moment().format('YYYYMMDD');
      for (let eventName of event.events) {
        
        let relayEvent = {
          event: eventName,
          leagues: [],
          isRelay: eventName.indexOf('x') >= 0
        };
        for (let league of event.leagues) {
          let leagueResult = {
            event: eventName,
            name: league.name,
            team: [],
            totalTime: null,
            totalSeconds: null,
            place: null,
            notes: ''
          };
          for (let entrant of league.entrants) {
            for (let ee of entrant.events) {
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
          } else {
            leagueResult.totalSeconds = 0;
            for (let e of leagueResult.team) {
              leagueResult.totalSeconds += toSeconds(e.time);
            }
            leagueResult.totalTime = fromSeconds(leagueResult.totalSeconds);
          }
          relayEvent.leagues.push(leagueResult);
        }
        relayEvents.push(relayEvent);
      }

      for (let re of relayEvents) {
        re.leagues = _.orderBy(re.leagues, 'totalSeconds', 'asc');
        let place = 1;
        for (let league of re.leagues) {
          if (league.team.length >= 4) {
            league.place = place;
            place += 1;
            league.notes = league.team.map(u => {
              return `${u.user} (${u.time})`;
            }).join('\n');
          }
        }
      }
      
      return relayEvents;
    }

    function getWinners(allUsers, event) {
      allUsers = _.toArray(allUsers);

      assignPlaceAndPoints(allUsers, event, 'points', 'place', 99);

      let winners = _.orderBy(allUsers, ['place', au => au.events[0].time, 'user'], ['asc', 'asc', 'asc']);

      return winners;
    }

    function parseUser(line, event) {
      let split = line.split('|').map(t => t.trim());
      let user: any = {
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



