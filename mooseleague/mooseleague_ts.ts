

// to prevent this loading twice in dev - hacky hacky whatever shut your face
// if (!window['apploaded']) {
//   window['apploaded'] = true;
//   throw "Already loaded";
// }


declare var byx;
declare var lmw;

interface MEvent {
  name: string;
  url: string;
  date: string|Date|moment.Moment;
  state: string;
  events: string;
  link: string;
  submit: string;
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
  age_graded_time: string;
  age_graded_time_number: number;
  percent_world_record: number;
  note: string;
  sex: Sex;
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
interface BreadCrumb {
  name: string;
  last: boolean;
  link?: string;
}




let BASE = 'https://jgr3go.github.io/reddit_ar/mooseleague/';

if (window.location.href.match(/localhost/)) {
  BASE = '';
}

let GAPI = new Promise((resolve, reject) => {
  gapi.load('client', {
    callback: async () => {
      // this isn't great, but the apikey should be limited to very specific things
      await gapi.client.init({apiKey: `${byx}1XThhfQZLh6YcTKwLz${lmw}`});
      resolve();
    }
  });
});


function isMobile() {
  return !!(navigator.userAgent.match(/Android/i) || 
      navigator.userAgent.match(/webOS/i) || 
      navigator.userAgent.match(/iPhone/i) || 
      navigator.userAgent.match(/iPad/i) || 
      navigator.userAgent.match(/iPod/i) || 
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i));
}


/**
 * Loads google sheet and does most of the processing into raw data objects
 */
class GoogleSvc {
  private spreadsheet: gapi.client.sheets.Spreadsheet;
  private Events: Array<MEvent> = [];
  private Users: Array<MUser> = [];
  private Divisions: Array<MDivision> = [];
  private built: boolean = false;

  public USER_COLUMNS = {
    TIMESTAMP: 0,
    USERNAME: 1,
    DIVISION: 2,
    AGE: 3, 
    SEX: 4, 
    RESULT: 5,
    NOTES: 6,
    LINKS: 7
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
        if (!row.values[1]?.formattedValue) { continue; }

        switch (row.values[0]?.formattedValue) {
          case 'Event':
            evt.events = row.values[1]?.formattedValue;
            break;
          case 'Date':
            evt.date = moment(row.values[1]?.formattedValue).year(moment().year());
            evt.displayDate = moment(evt.date).format('MMM D, YYYY');
            break;
          case 'Results':
            evt.link = row.values[1]?.formattedValue;
            break;
          case 'Form':
            evt.submit = row.values[1]?.formattedValue;
            break;
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
          if (row.values[COL.USERNAME]?.formattedValue == 'Username') {
            startUserRows = true;
          }
        } else {
          let username = row.values[COL.USERNAME]?.formattedValue || "";
          if (!username) { break; }

          // first time finding user, add to master list
          if (!users.find(u => u.user.toLowerCase() == username.toLowerCase())) {
            let user: Partial<MUser> = {
              user: username,
              division: row.values[COL.DIVISION]?.formattedValue || "",
              age: parseInt(row.values[COL.AGE]?.formattedValue) || null,
              sex: <Sex>row.values[COL.SEX]?.formattedValue?.substr(0,1).toUpperCase(),
              results: []
            };
            user.link = `https://reddit.com/u/${user.user}`;
            users.push(<MUser>user);
          }
          let user = users.find(u => u.user.toLowerCase() == username.toLowerCase());
          user.results.push({
            event: eventName,
            times: raceName.split(',').map(r => {
              return <MUserRaceResult>{
                race: r,
                username: user.user,
                division: user.division,
                sex: user.sex,
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

/**
 * Container for the events, logic for what's next etc
 */
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

/**
 * Container for users, logic for age grading etc
 */
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
          time.age_graded_time_number = this.ageSvc.ageGrade(time.race, user.age, user.sex, time.time_number, user.user);
          time.age_graded_time = this.timeSvc.toString(time.age_graded_time_number);
          time.percent_world_record = this.ageSvc.percentGrade(time.race, user.sex, time.age_graded_time_number, user.user);
        }
      }
    }
    return this.users;
  }
}

/**
 * Container for divisions
 */
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

/**
 * Does the bulk of the calculations for results, division grouping and scoring
 */
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

        race.times = _.orderBy(race.times, t => t.percent_world_record, 'desc');
        
        let place = 1;
        for (let time of race.times) {
          if (time.time) {
            time.place = place++;
            let divname = time.division.toLowerCase();
            divs[divname].athletes += 1;
            if (divs[divname].athletes <= 5) {
              time.points = time.place;
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

/**
 * Default page calendar view
 */
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




/**
 * Main controller loaded at start
 */
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

/**
 * Individual event controller for event results pages
 */
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


/**
 * AgeService
 * Manages age grading calculations. Defaults to no grade.
 */
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

  static COLS = {
    MFEVENTID : 0,
    EVENTID: 1,
    ISROAD: 2,
    DISTANCE_KM: 3,
    WORLD_RECORD_SEC: 4,

    AGE_START: 5
  };
  static WORLD_RECORD = 'World Record';

  static parse(file: string) {
    let COL = AgeService.COLS;

    let lines = file.split('\n');
    for (let line of lines) {
      if (!line.trim()) { continue; }
      let parts = line.split('\t');
      if (parts[0] == 'Event') { continue; }
      // set up base object
      let grade: Partial<Grade> = {
        event: parts[COL.EVENTID],
        isRoad: parts[COL.ISROAD] == '1',
        mf: <Sex>parts[COL.MFEVENTID].substr(0)
      };

      let id = parts[COL.MFEVENTID];
      if (!AgeService.GRADES[id]) { AgeService.GRADES[id] = {}; }

      // assign world record
      AgeService.GRADES[id][AgeService.WORLD_RECORD] = <Grade>Object.assign({record: parseFloat(parts[COL.WORLD_RECORD_SEC])});

      // assign age groups
      let START = COL.AGE_START;
      for (let ii = START; ii < parts.length - 1; ii++) {
        let age = ii + 1;
        let factor = parseFloat(parts[ii]);
        AgeService.GRADES[id][age] = <Grade>Object.assign({age, factor, id}, grade);
      }
    }
    console.log(AgeService.GRADES)
  }

  ageGrade(event: string, age: number, sex: Sex, seconds: number, username?: string): number {
    if (!seconds) { return seconds; }
    if (!sex) { sex = 'M'; }
    event = event.replace(/\s/g, '');
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

  percentGrade(event: string, sex: Sex, seconds: number, username?: string): number {
    if (!seconds) { return 0; }
    if (!sex) { sex = 'M'; }
    let percent = 0;
    let wr;
    let mfEventId = `${sex}${event}`;
    if (AgeService.GRADES[mfEventId]) {
      let mfEvent = AgeService.GRADES[mfEventId];
      wr = mfEvent[AgeService.WORLD_RECORD];
      percent = wr.record / seconds;
    }
    console.log(`${username} ${mfEventId} time:${seconds} WR:${wr.record} percent:${percent}`);
    return percent;
  }

}

/**
 * TimeService
 * Time calculations -> string to number / number to string
 */
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
  .run(['$http', '$stateRegistry', '$urlRouter', 'Events', 'AgeService', 'Google', preload])
  .service('Google', GoogleSvc)
  .service('Events', Events)
  .service('Users', Users)
  .service('Divisions', Divisions)
  .service('AgeService', AgeService)
  .service('TimeService', TimeService)
  .service('Results', Results)
  .controller('calendar', Calendar)
  .controller('main', MainController)
  .controller('event', EventController)
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
  }])
  .filter('percent', ['$filter', function($filter) {
    return function(input, decimals = 1) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }]);



