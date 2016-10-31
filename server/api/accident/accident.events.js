/**
 * Accident model events
 */

'use strict';

import {EventEmitter} from 'events';
import Accident from './accident.model';
var AccidentEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AccidentEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Accident.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    AccidentEvents.emit(event + ':' + doc._id, doc);
    AccidentEvents.emit(event, doc);
  };
}

export default AccidentEvents;
