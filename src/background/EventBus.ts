import EventEmitter from 'events'

export default class EventBus {
  ee: EventEmitter;
  bb: BroadcastChannel;

  constructor() {
    this.ee = new EventEmitter();
    this.bb = new BroadcastChannel('auth')

    // setInterval(() => {
    //   console.log("send!");
    // }, 1000 * 5);
  }

  bus(): EventEmitter {
    return this.ee;
  }

};
