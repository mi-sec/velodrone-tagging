import Vue from 'vue';

import { EventEmitter } from 'events';

Vue.prototype.$eventBus = new EventEmitter();
