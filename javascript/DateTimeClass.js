/**
 * Created by AstafyevaLA on 11.09.2014.
 */


/*Class to keep time*/
/* object Date src - the initial time */
function MyTime(src) {
    var parent = this;
    var staticDate = "7/Nov/2012 "; // the static date of every time we keep
    var tmp = src == null ? new Date() : src ;
    parent.date = new Date(staticDate + tmp.toTimeString().substr(0, 5)); // current time if src is undefined,
    // time from scr if src is defined

    // returns time as a string we can put in html input time value
    parent.toInputValue = function() {
        return parent.date.toTimeString().substr(0, 5);
    }

    // sets current time from html input time value
    // returns nothing
    parent.setFromInputValue = function(inputValue) {
        try {
            parent.date = new Date(staticDate + inputValue);
        }
        catch (e) {
           // console.log(e.message);
        }
    }

    // adds some time to the current time
    // int hours - hours to add,
    // int minutes - minutes to add,
    // int seconds - seconds to add
    parent.addTime = function(hours, minutes, seconds) {
        hours = hours || 0;
        minutes = minutes || 0;
        seconds = seconds || 0;
        parent.date.setHours(parent.date.getHours() + hours);
        parent.date.setMinutes(parent.date.getMinutes() + minutes);
        parent.date.setSeconds(parent.date.getSeconds() + seconds);
    }

    // returns (int) the difference in minutes between current time and html input time value
    // string inputValue - the input value to sub from current time
    parent.subTime = function(inputValue) {
        var date2 = new Date(staticDate + inputValue);
        return (parent.date.getHours() - date2.getHours())*60 + (parent.date.getMinutes() - date2.getMinutes());
    }

    // returns the time part of DateToJSON including T example: T09:00:00Z
    parent.toJSON = function() {
        var s = parent.date.toJSON().replace('.000', '');
        return s.substr(s.indexOf('T'));
    }

    // returns the time part including 'T' with timeZone example T09:00:00+04
    parent.toTimeWithTimeZone = function() {
        return 'T' + FormatTime(parent.date) + GetTimeZoneOffsetStr();
    }

    /*Sets time to the begining of the next hour*/
    /*returns nothing*/
    parent.setStartNextHour = function() {
        var tmp = parent.date;
        tmp.setMinutes(0);
        tmp.setSeconds(0);
        tmp.setHours(tmp.getHours() + 1);
        parent.date = new Date(staticDate + tmp.toTimeString().substr(0, 5));
    }

    /*returns time zone offset as a string*/
    var GetTimeZoneOffsetStr = function() {
        var d = new Date();
        var offset = d.getTimezoneOffset();
        var durationInMinutes = ('0' + Math.abs(offset/60)).slice(-2) + ":" + ('0' + Math.abs(offset%60)).slice(-2);
        var sign = offset > 0?"-":"+";
        return sign + durationInMinutes;
    }

    /*formating time to string example '01:00:02'*/
    /* object Date time - the time to format*/
    var FormatTime = function(time) {
        return ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2) + ":" + ('0' + time.getSeconds()).slice(-2);
    }

    return parent;
}

/*Class to keep date*/
/* object Date src - the initial date */
function MyDate(src) {
    var parent = this;
    var staticTime = " 00:00"; // the static time of every date we keep
    var tmp = src == null ? new Date() : src;
    parent.date = new Date(tmp.toDateString() + staticTime);  // current date if src is undefined,
    // date from scr if src is defined

    // returns date as a string we can put in html input date value
    parent.toInputValue = function() {
        var s = FormatDate(parent.date);

        return s;
    }

    // sets current date from html input date value
    // returns nothing
    parent.setFromInputValue = function(inputValue) {
        parent.date = new Date(inputValue + staticTime);
    }

    // returns current dte in JSON format 2014-07-12T00:00:00Z
    parent.toJSON = function() {
        return FormatDate(parent.date) + "T00:00:00Z";
    }

    // returns the difference in days between currentDate and a html date input value
    // string inputValue - the input value to sub from current date
    parent.subDate = function(inputValue) {
        var tmp = new Date(inputValue + staticTime);
        return (parent.date - tmp)/(1000*60*60*24);
    }

    // adds some date to the current date
    // int years - years to add
    // int months - months to add
    // int days - days to add
    parent.addDate = function(years, months, days) {
        years = years || 0;
        months = months || 0;
        days = days || 0;
        parent.date.setFullYear(parent.date.getFullYear() + years);
        parent.date.setMonth(parent.date.getMonth() + months);
        parent.date.setDate(parent.date.getDate() + days);
    }

    // sets the date to date that will be an hour later
    // current Date will be today or tomorrow
    // returns nothing
    parent.setStartNextHour = function() {
        var tmp = new Date();
        tmp.setMinutes(0);
        tmp.setSeconds(0);
        tmp.setHours(tmp.getHours() + 1);
        parent.date = new Date(tmp.toDateString() + staticTime);
    }

    /*formating date to string example '2014-07-20'*/
    /* object Date date - the date to format*/
    var FormatDate = function(date) {
        return ('000' + date.getFullYear()).slice(-4) + "-" + ('0' + (1+date.getMonth())).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
    }

    return parent;
}
