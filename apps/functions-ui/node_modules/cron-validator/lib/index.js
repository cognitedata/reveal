"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCron = void 0;
// This comes from the fact that parseInt trims characters coming
// after digits and consider it a valid int, so `1*` becomes `1`.
var safeParseInt = function (value) {
    if (/^\d+$/.test(value)) {
        return Number(value);
    }
    else {
        return NaN;
    }
};
var isWildcard = function (value) {
    return value === '*';
};
var isQuestionMark = function (value) {
    return value === '?';
};
var isInRange = function (value, start, stop) {
    return value >= start && value <= stop;
};
var isValidRange = function (value, start, stop) {
    var sides = value.split('-');
    switch (sides.length) {
        case 1:
            return isWildcard(value) || isInRange(safeParseInt(value), start, stop);
        case 2:
            var _a = sides.map(function (side) { return safeParseInt(side); }), small = _a[0], big = _a[1];
            return small <= big && isInRange(small, start, stop) && isInRange(big, start, stop);
        default:
            return false;
    }
};
var isValidStep = function (value) {
    return value === undefined || (value.search(/[^\d]/) === -1 && safeParseInt(value) > 0);
};
var validateForRange = function (value, start, stop) {
    if (value.search(/[^\d-,\/*]/) !== -1) {
        return false;
    }
    var list = value.split(',');
    return list.every(function (condition) {
        var splits = condition.split('/');
        // Prevents `*/ * * * *` from being accepted.
        if (condition.trim().endsWith('/')) {
            return false;
        }
        // Prevents `*/*/* * * * *` from being accepted
        if (splits.length > 2) {
            return false;
        }
        // If we don't have a `/`, right will be undefined which is considered a valid step if we don't a `/`.
        var left = splits[0], right = splits[1];
        return isValidRange(left, start, stop) && isValidStep(right);
    });
};
var hasValidSeconds = function (seconds) {
    return validateForRange(seconds, 0, 59);
};
var hasValidMinutes = function (minutes) {
    return validateForRange(minutes, 0, 59);
};
var hasValidHours = function (hours) {
    return validateForRange(hours, 0, 23);
};
var hasValidDays = function (days, allowBlankDay) {
    return (allowBlankDay && isQuestionMark(days)) || validateForRange(days, 1, 31);
};
var monthAlias = {
    jan: '1',
    feb: '2',
    mar: '3',
    apr: '4',
    may: '5',
    jun: '6',
    jul: '7',
    aug: '8',
    sep: '9',
    oct: '10',
    nov: '11',
    dec: '12'
};
var hasValidMonths = function (months, alias) {
    // Prevents alias to be used as steps
    if (months.search(/\/[a-zA-Z]/) !== -1) {
        return false;
    }
    if (alias) {
        var remappedMonths = months.toLowerCase().replace(/[a-z]{3}/g, function (match) {
            return monthAlias[match] === undefined ? match : monthAlias[match];
        });
        // If any invalid alias was used, it won't pass the other checks as there will be non-numeric values in the months
        return validateForRange(remappedMonths, 1, 12);
    }
    return validateForRange(months, 1, 12);
};
var weekdaysAlias = {
    sun: '0',
    mon: '1',
    tue: '2',
    wed: '3',
    thu: '4',
    fri: '5',
    sat: '6'
};
var hasValidWeekdays = function (weekdays, alias, allowBlankDay, allowSevenAsSunday) {
    // If there is a question mark, checks if the allowBlankDay flag is set
    if (allowBlankDay && isQuestionMark(weekdays)) {
        return true;
    }
    else if (!allowBlankDay && isQuestionMark(weekdays)) {
        return false;
    }
    // Prevents alias to be used as steps
    if (weekdays.search(/\/[a-zA-Z]/) !== -1) {
        return false;
    }
    if (alias) {
        var remappedWeekdays = weekdays.toLowerCase().replace(/[a-z]{3}/g, function (match) {
            return weekdaysAlias[match] === undefined ? match : weekdaysAlias[match];
        });
        // If any invalid alias was used, it won't pass the other checks as there will be non-numeric values in the weekdays
        return validateForRange(remappedWeekdays, 0, allowSevenAsSunday ? 7 : 6);
    }
    return validateForRange(weekdays, 0, allowSevenAsSunday ? 7 : 6);
};
var hasCompatibleDayFormat = function (days, weekdays, allowBlankDay) {
    return !(allowBlankDay && isQuestionMark(days) && isQuestionMark(weekdays));
};
var split = function (cron) {
    return cron.trim().split(/\s+/);
};
var defaultOptions = {
    alias: false,
    seconds: false,
    allowBlankDay: false,
    allowSevenAsSunday: false
};
exports.isValidCron = function (cron, options) {
    options = __assign(__assign({}, defaultOptions), options);
    var splits = split(cron);
    if (splits.length > (options.seconds ? 6 : 5) || splits.length < 5) {
        return false;
    }
    var checks = [];
    if (splits.length === 6) {
        var seconds = splits.shift();
        if (seconds) {
            checks.push(hasValidSeconds(seconds));
        }
    }
    // We could only check the steps gradually and return false on the first invalid block,
    // However, this won't have any performance impact so why bother for now.
    var minutes = splits[0], hours = splits[1], days = splits[2], months = splits[3], weekdays = splits[4];
    checks.push(hasValidMinutes(minutes));
    checks.push(hasValidHours(hours));
    checks.push(hasValidDays(days, options.allowBlankDay));
    checks.push(hasValidMonths(months, options.alias));
    checks.push(hasValidWeekdays(weekdays, options.alias, options.allowBlankDay, options.allowSevenAsSunday));
    checks.push(hasCompatibleDayFormat(days, weekdays, options.allowBlankDay));
    return checks.every(Boolean);
};
//# sourceMappingURL=index.js.map