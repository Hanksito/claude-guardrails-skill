'use strict';
const { buildReminder } = require('../lib/reminder');
process.stdout.write(buildReminder() + '\n');
