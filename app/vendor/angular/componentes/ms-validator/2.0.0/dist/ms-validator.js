//! moment.js
//! version : 2.8.2
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(a,b,c){switch(arguments.length){case 2:return null!=a?a:b;case 3:return null!=a?a:null!=b?b:c;default:throw new Error("Implement me")}}function c(a,b){return yb.call(a,b)}function d(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function e(a){sb.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}function f(a,b){var c=!0;return m(function(){return c&&(e(a),c=!1),b.apply(this,arguments)},b)}function g(a,b){pc[a]||(e(b),pc[a]=!0)}function h(a,b){return function(c){return p(a.call(this,c),b)}}function i(a,b){return function(c){return this.localeData().ordinal(a.call(this,c),b)}}function j(){}function k(a,b){b!==!1&&F(a),n(this,a),this._d=new Date(+a._d)}function l(a){var b=y(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=sb.localeData(),this._bubble()}function m(a,b){for(var d in b)c(b,d)&&(a[d]=b[d]);return c(b,"toString")&&(a.toString=b.toString),c(b,"valueOf")&&(a.valueOf=b.valueOf),a}function n(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=b._pf),"undefined"!=typeof b._locale&&(a._locale=b._locale),Hb.length>0)for(c in Hb)d=Hb[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function o(a){return 0>a?Math.ceil(a):Math.floor(a)}function p(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function q(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function r(a,b){var c;return b=K(b,a),a.isBefore(b)?c=q(a,b):(c=q(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function s(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(g(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=sb.duration(c,d),t(this,e,a),this}}function t(a,b,c,d){var e=b._milliseconds,f=b._days,g=b._months;d=null==d?!0:d,e&&a._d.setTime(+a._d+e*c),f&&mb(a,"Date",lb(a,"Date")+f*c),g&&kb(a,lb(a,"Month")+g*c),d&&sb.updateOffset(a,f||g)}function u(a){return"[object Array]"===Object.prototype.toString.call(a)}function v(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function w(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&A(a[d])!==A(b[d]))&&g++;return g+f}function x(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=ic[a]||jc[b]||b}return a}function y(a){var b,d,e={};for(d in a)c(a,d)&&(b=x(d),b&&(e[b]=a[d]));return e}function z(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}sb[b]=function(e,f){var g,h,i=sb._locale[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=sb().utc().set(d,a);return i.call(sb._locale,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function A(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function B(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function C(a,b,c){return gb(sb([a,11,31+b-c]),b,c).week}function D(a){return E(a)?366:365}function E(a){return a%4===0&&a%100!==0||a%400===0}function F(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[Ab]<0||a._a[Ab]>11?Ab:a._a[Bb]<1||a._a[Bb]>B(a._a[zb],a._a[Ab])?Bb:a._a[Cb]<0||a._a[Cb]>23?Cb:a._a[Db]<0||a._a[Db]>59?Db:a._a[Eb]<0||a._a[Eb]>59?Eb:a._a[Fb]<0||a._a[Fb]>999?Fb:-1,a._pf._overflowDayOfYear&&(zb>b||b>Bb)&&(b=Bb),a._pf.overflow=b)}function G(a){return null==a._isValid&&(a._isValid=!isNaN(a._d.getTime())&&a._pf.overflow<0&&!a._pf.empty&&!a._pf.invalidMonth&&!a._pf.nullInput&&!a._pf.invalidFormat&&!a._pf.userInvalidated,a._strict&&(a._isValid=a._isValid&&0===a._pf.charsLeftOver&&0===a._pf.unusedTokens.length)),a._isValid}function H(a){return a?a.toLowerCase().replace("_","-"):a}function I(a){for(var b,c,d,e,f=0;f<a.length;){for(e=H(a[f]).split("-"),b=e.length,c=H(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=J(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&w(e,c,!0)>=b-1)break;b--}f++}return null}function J(a){var b=null;if(!Gb[a]&&Ib)try{b=sb.locale(),require("./locale/"+a),sb.locale(b)}catch(c){}return Gb[a]}function K(a,b){return b._isUTC?sb(a).zone(b._offset||0):sb(a).local()}function L(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function M(a){var b,c,d=a.match(Mb);for(b=0,c=d.length;c>b;b++)d[b]=oc[d[b]]?oc[d[b]]:L(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function N(a,b){return a.isValid()?(b=O(b,a.localeData()),kc[b]||(kc[b]=M(b)),kc[b](a)):a.localeData().invalidDate()}function O(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Nb.lastIndex=0;d>=0&&Nb.test(a);)a=a.replace(Nb,c),Nb.lastIndex=0,d-=1;return a}function P(a,b){var c,d=b._strict;switch(a){case"Q":return Yb;case"DDDD":return $b;case"YYYY":case"GGGG":case"gggg":return d?_b:Qb;case"Y":case"G":case"g":return bc;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?ac:Rb;case"S":if(d)return Yb;case"SS":if(d)return Zb;case"SSS":if(d)return $b;case"DDD":return Pb;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Tb;case"a":case"A":return b._locale._meridiemParse;case"X":return Wb;case"Z":case"ZZ":return Ub;case"T":return Vb;case"SSSS":return Sb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?Zb:Ob;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return Ob;case"Do":return Xb;default:return c=new RegExp(Y(X(a.replace("\\","")),"i"))}}function Q(a){a=a||"";var b=a.match(Ub)||[],c=b[b.length-1]||[],d=(c+"").match(gc)||["-",0,0],e=+(60*d[1])+A(d[2]);return"+"===d[0]?-e:e}function R(a,b,c){var d,e=c._a;switch(a){case"Q":null!=b&&(e[Ab]=3*(A(b)-1));break;case"M":case"MM":null!=b&&(e[Ab]=A(b)-1);break;case"MMM":case"MMMM":d=c._locale.monthsParse(b),null!=d?e[Ab]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[Bb]=A(b));break;case"Do":null!=b&&(e[Bb]=A(parseInt(b,10)));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=A(b));break;case"YY":e[zb]=sb.parseTwoDigitYear(b);break;case"YYYY":case"YYYYY":case"YYYYYY":e[zb]=A(b);break;case"a":case"A":c._isPm=c._locale.isPM(b);break;case"H":case"HH":case"h":case"hh":e[Cb]=A(b);break;case"m":case"mm":e[Db]=A(b);break;case"s":case"ss":e[Eb]=A(b);break;case"S":case"SS":case"SSS":case"SSSS":e[Fb]=A(1e3*("0."+b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=Q(b);break;case"dd":case"ddd":case"dddd":d=c._locale.weekdaysParse(b),null!=d?(c._w=c._w||{},c._w.d=d):c._pf.invalidWeekday=b;break;case"w":case"ww":case"W":case"WW":case"d":case"e":case"E":a=a.substr(0,1);case"gggg":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=A(b));break;case"gg":case"GG":c._w=c._w||{},c._w[a]=sb.parseTwoDigitYear(b)}}function S(a){var c,d,e,f,g,h,i;c=a._w,null!=c.GG||null!=c.W||null!=c.E?(g=1,h=4,d=b(c.GG,a._a[zb],gb(sb(),1,4).year),e=b(c.W,1),f=b(c.E,1)):(g=a._locale._week.dow,h=a._locale._week.doy,d=b(c.gg,a._a[zb],gb(sb(),g,h).year),e=b(c.w,1),null!=c.d?(f=c.d,g>f&&++e):f=null!=c.e?c.e+g:g),i=hb(d,e,f,h,g),a._a[zb]=i.year,a._dayOfYear=i.dayOfYear}function T(a){var c,d,e,f,g=[];if(!a._d){for(e=V(a),a._w&&null==a._a[Bb]&&null==a._a[Ab]&&S(a),a._dayOfYear&&(f=b(a._a[zb],e[zb]),a._dayOfYear>D(f)&&(a._pf._overflowDayOfYear=!0),d=cb(f,0,a._dayOfYear),a._a[Ab]=d.getUTCMonth(),a._a[Bb]=d.getUTCDate()),c=0;3>c&&null==a._a[c];++c)a._a[c]=g[c]=e[c];for(;7>c;c++)a._a[c]=g[c]=null==a._a[c]?2===c?1:0:a._a[c];a._d=(a._useUTC?cb:bb).apply(null,g),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()+a._tzm)}}function U(a){var b;a._d||(b=y(a._i),a._a=[b.year,b.month,b.day,b.hour,b.minute,b.second,b.millisecond],T(a))}function V(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function W(a){if(a._f===sb.ISO_8601)return void $(a);a._a=[],a._pf.empty=!0;var b,c,d,e,f,g=""+a._i,h=g.length,i=0;for(d=O(a._f,a._locale).match(Mb)||[],b=0;b<d.length;b++)e=d[b],c=(g.match(P(e,a))||[])[0],c&&(f=g.substr(0,g.indexOf(c)),f.length>0&&a._pf.unusedInput.push(f),g=g.slice(g.indexOf(c)+c.length),i+=c.length),oc[e]?(c?a._pf.empty=!1:a._pf.unusedTokens.push(e),R(e,c,a)):a._strict&&!c&&a._pf.unusedTokens.push(e);a._pf.charsLeftOver=h-i,g.length>0&&a._pf.unusedInput.push(g),a._isPm&&a._a[Cb]<12&&(a._a[Cb]+=12),a._isPm===!1&&12===a._a[Cb]&&(a._a[Cb]=0),T(a),F(a)}function X(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function Y(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Z(a){var b,c,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,void(a._d=new Date(0/0));for(f=0;f<a._f.length;f++)g=0,b=n({},a),b._pf=d(),b._f=a._f[f],W(b),G(b)&&(g+=b._pf.charsLeftOver,g+=10*b._pf.unusedTokens.length,b._pf.score=g,(null==e||e>g)&&(e=g,c=b));m(a,c||b)}function $(a){var b,c,d=a._i,e=cc.exec(d);if(e){for(a._pf.iso=!0,b=0,c=ec.length;c>b;b++)if(ec[b][1].exec(d)){a._f=ec[b][0]+(e[6]||" ");break}for(b=0,c=fc.length;c>b;b++)if(fc[b][1].exec(d)){a._f+=fc[b][0];break}d.match(Ub)&&(a._f+="Z"),W(a)}else a._isValid=!1}function _(a){$(a),a._isValid===!1&&(delete a._isValid,sb.createFromInputFallback(a))}function ab(b){var c,d=b._i;d===a?b._d=new Date:v(d)?b._d=new Date(+d):null!==(c=Jb.exec(d))?b._d=new Date(+c[1]):"string"==typeof d?_(b):u(d)?(b._a=d.slice(0),T(b)):"object"==typeof d?U(b):"number"==typeof d?b._d=new Date(d):sb.createFromInputFallback(b)}function bb(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function cb(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function db(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function eb(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function fb(a,b,c){var d=sb.duration(a).abs(),e=xb(d.as("s")),f=xb(d.as("m")),g=xb(d.as("h")),h=xb(d.as("d")),i=xb(d.as("M")),j=xb(d.as("y")),k=e<lc.s&&["s",e]||1===f&&["m"]||f<lc.m&&["mm",f]||1===g&&["h"]||g<lc.h&&["hh",g]||1===h&&["d"]||h<lc.d&&["dd",h]||1===i&&["M"]||i<lc.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,eb.apply({},k)}function gb(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=sb(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function hb(a,b,c,d,e){var f,g,h=cb(a,0,1).getUTCDay();return h=0===h?7:h,c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:D(a-1)+g}}function ib(b){var c=b._i,d=b._f;return b._locale=b._locale||sb.localeData(b._l),null===c||d===a&&""===c?sb.invalid({nullInput:!0}):("string"==typeof c&&(b._i=c=b._locale.preparse(c)),sb.isMoment(c)?new k(c,!0):(d?u(d)?Z(b):W(b):ab(b),new k(b)))}function jb(a,b){var c,d;if(1===b.length&&u(b[0])&&(b=b[0]),!b.length)return sb();for(c=b[0],d=1;d<b.length;++d)b[d][a](c)&&(c=b[d]);return c}function kb(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),B(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function lb(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function mb(a,b,c){return"Month"===b?kb(a,c):a._d["set"+(a._isUTC?"UTC":"")+b](c)}function nb(a,b){return function(c){return null!=c?(mb(this,a,c),sb.updateOffset(this,b),this):lb(this,a)}}function ob(a){return 400*a/146097}function pb(a){return 146097*a/400}function qb(a){sb.duration.fn[a]=function(){return this._data[a]}}function rb(a){"undefined"==typeof ender&&(tb=wb.moment,wb.moment=a?f("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.",sb):sb)}for(var sb,tb,ub,vb="2.8.2",wb="undefined"!=typeof global?global:this,xb=Math.round,yb=Object.prototype.hasOwnProperty,zb=0,Ab=1,Bb=2,Cb=3,Db=4,Eb=5,Fb=6,Gb={},Hb=[],Ib="undefined"!=typeof module&&module.exports,Jb=/^\/?Date\((\-?\d+)/i,Kb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Lb=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,Mb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,Nb=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,Ob=/\d\d?/,Pb=/\d{1,3}/,Qb=/\d{1,4}/,Rb=/[+\-]?\d{1,6}/,Sb=/\d+/,Tb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Ub=/Z|[\+\-]\d\d:?\d\d/gi,Vb=/T/i,Wb=/[\+\-]?\d+(\.\d{1,3})?/,Xb=/\d{1,2}/,Yb=/\d/,Zb=/\d\d/,$b=/\d{3}/,_b=/\d{4}/,ac=/[+-]?\d{6}/,bc=/[+-]?\d+/,cc=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,dc="YYYY-MM-DDTHH:mm:ssZ",ec=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],fc=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],gc=/([\+\-]|\d\d)/gi,hc=("Date|Hours|Minutes|Seconds|Milliseconds".split("|"),{Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6}),ic={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",Q:"quarter",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},jc={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},kc={},lc={s:45,m:45,h:22,d:26,M:11},mc="DDD w W M D d".split(" "),nc="M D H h m s w W".split(" "),oc={M:function(){return this.month()+1},MMM:function(a){return this.localeData().monthsShort(this,a)},MMMM:function(a){return this.localeData().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.localeData().weekdaysMin(this,a)},ddd:function(a){return this.localeData().weekdaysShort(this,a)},dddd:function(a){return this.localeData().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return p(this.year()%100,2)},YYYY:function(){return p(this.year(),4)},YYYYY:function(){return p(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+p(Math.abs(a),6)},gg:function(){return p(this.weekYear()%100,2)},gggg:function(){return p(this.weekYear(),4)},ggggg:function(){return p(this.weekYear(),5)},GG:function(){return p(this.isoWeekYear()%100,2)},GGGG:function(){return p(this.isoWeekYear(),4)},GGGGG:function(){return p(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return A(this.milliseconds()/100)},SS:function(){return p(A(this.milliseconds()/10),2)},SSS:function(){return p(this.milliseconds(),3)},SSSS:function(){return p(this.milliseconds(),3)},Z:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+p(A(a/60),2)+":"+p(A(a)%60,2)},ZZ:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+p(A(a/60),2)+p(A(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()},Q:function(){return this.quarter()}},pc={},qc=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"];mc.length;)ub=mc.pop(),oc[ub+"o"]=i(oc[ub],ub);for(;nc.length;)ub=nc.pop(),oc[ub+ub]=h(oc[ub],2);oc.DDDD=h(oc.DDD,3),m(j.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a){var b,c,d;for(this._monthsParse||(this._monthsParse=[]),b=0;12>b;b++)if(this._monthsParse[b]||(c=sb.utc([2e3,b]),d="^"+this.months(c,"")+"|^"+this.monthsShort(c,""),this._monthsParse[b]=new RegExp(d.replace(".",""),"i")),this._monthsParse[b].test(a))return b},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=sb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY LT",LLLL:"dddd, MMMM D, YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b){var c=this._calendar[a];return"function"==typeof c?c.apply(b):c},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",preparse:function(a){return a},postformat:function(a){return a},week:function(a){return gb(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),sb=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=b,g._f=c,g._l=e,g._strict=f,g._isUTC=!1,g._pf=d(),ib(g)},sb.suppressDeprecationWarnings=!1,sb.createFromInputFallback=f("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i)}),sb.min=function(){var a=[].slice.call(arguments,0);return jb("isBefore",a)},sb.max=function(){var a=[].slice.call(arguments,0);return jb("isAfter",a)},sb.utc=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=b,g._f=c,g._strict=f,g._pf=d(),ib(g).utc()},sb.unix=function(a){return sb(1e3*a)},sb.duration=function(a,b){var d,e,f,g,h=a,i=null;return sb.isDuration(a)?h={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(h={},b?h[b]=a:h.milliseconds=a):(i=Kb.exec(a))?(d="-"===i[1]?-1:1,h={y:0,d:A(i[Bb])*d,h:A(i[Cb])*d,m:A(i[Db])*d,s:A(i[Eb])*d,ms:A(i[Fb])*d}):(i=Lb.exec(a))?(d="-"===i[1]?-1:1,f=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*d},h={y:f(i[2]),M:f(i[3]),d:f(i[4]),h:f(i[5]),m:f(i[6]),s:f(i[7]),w:f(i[8])}):"object"==typeof h&&("from"in h||"to"in h)&&(g=r(sb(h.from),sb(h.to)),h={},h.ms=g.milliseconds,h.M=g.months),e=new l(h),sb.isDuration(a)&&c(a,"_locale")&&(e._locale=a._locale),e},sb.version=vb,sb.defaultFormat=dc,sb.ISO_8601=function(){},sb.momentProperties=Hb,sb.updateOffset=function(){},sb.relativeTimeThreshold=function(b,c){return lc[b]===a?!1:c===a?lc[b]:(lc[b]=c,!0)},sb.lang=f("moment.lang is deprecated. Use moment.locale instead.",function(a,b){return sb.locale(a,b)}),sb.locale=function(a,b){var c;return a&&(c="undefined"!=typeof b?sb.defineLocale(a,b):sb.localeData(a),c&&(sb.duration._locale=sb._locale=c)),sb._locale._abbr},sb.defineLocale=function(a,b){return null!==b?(b.abbr=a,Gb[a]||(Gb[a]=new j),Gb[a].set(b),sb.locale(a),Gb[a]):(delete Gb[a],null)},sb.langData=f("moment.langData is deprecated. Use moment.localeData instead.",function(a){return sb.localeData(a)}),sb.localeData=function(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return sb._locale;if(!u(a)){if(b=J(a))return b;a=[a]}return I(a)},sb.isMoment=function(a){return a instanceof k||null!=a&&c(a,"_isAMomentObject")},sb.isDuration=function(a){return a instanceof l};for(ub=qc.length-1;ub>=0;--ub)z(qc[ub]);sb.normalizeUnits=function(a){return x(a)},sb.invalid=function(a){var b=sb.utc(0/0);return null!=a?m(b._pf,a):b._pf.userInvalidated=!0,b},sb.parseZone=function(){return sb.apply(null,arguments).parseZone()},sb.parseTwoDigitYear=function(a){return A(a)+(A(a)>68?1900:2e3)},m(sb.fn=k.prototype,{clone:function(){return sb(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=sb(this).utc();return 0<a.year()&&a.year()<=9999?N(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):N(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return G(this)},isDSTShifted:function(){return this._a?this.isValid()&&w(this._a,(this._isUTC?sb.utc(this._a):sb(this._a)).toArray())>0:!1},parsingFlags:function(){return m({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(a){return this.zone(0,a)},local:function(a){return this._isUTC&&(this.zone(0,a),this._isUTC=!1,a&&this.add(this._d.getTimezoneOffset(),"m")),this},format:function(a){var b=N(this,a||sb.defaultFormat);return this.localeData().postformat(b)},add:s(1,"add"),subtract:s(-1,"subtract"),diff:function(a,b,c){var d,e,f=K(a,this),g=6e4*(this.zone()-f.zone());return b=x(b),"year"===b||"month"===b?(d=432e5*(this.daysInMonth()+f.daysInMonth()),e=12*(this.year()-f.year())+(this.month()-f.month()),e+=(this-sb(this).startOf("month")-(f-sb(f).startOf("month")))/d,e-=6e4*(this.zone()-sb(this).startOf("month").zone()-(f.zone()-sb(f).startOf("month").zone()))/d,"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:o(e)},from:function(a,b){return sb.duration({to:this,from:a}).locale(this.locale()).humanize(!b)},fromNow:function(a){return this.from(sb(),a)},calendar:function(a){var b=a||sb(),c=K(b,this).startOf("day"),d=this.diff(c,"days",!0),e=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(this.localeData().calendar(e,this))},isLeapYear:function(){return E(this.year())},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=db(a,this.localeData()),this.add(a-b,"d")):b},month:nb("Month",!0),startOf:function(a){switch(a=x(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this},endOf:function(a){return a=x(a),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")},isAfter:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)>+sb(a).startOf(b)},isBefore:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)<+sb(a).startOf(b)},isSame:function(a,b){return b=b||"ms",+this.clone().startOf(b)===+K(a,this).startOf(b)},min:f("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(a){return a=sb.apply(null,arguments),this>a?this:a}),max:f("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(a){return a=sb.apply(null,arguments),a>this?this:a}),zone:function(a,b){var c,d=this._offset||0;return null==a?this._isUTC?d:this._d.getTimezoneOffset():("string"==typeof a&&(a=Q(a)),Math.abs(a)<16&&(a=60*a),!this._isUTC&&b&&(c=this._d.getTimezoneOffset()),this._offset=a,this._isUTC=!0,null!=c&&this.subtract(c,"m"),d!==a&&(!b||this._changeInProgress?t(this,sb.duration(d-a,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,sb.updateOffset(this,!0),this._changeInProgress=null)),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.zone(this._tzm):"string"==typeof this._i&&this.zone(this._i),this},hasAlignedHourOffset:function(a){return a=a?sb(a).zone():0,(this.zone()-a)%60===0},daysInMonth:function(){return B(this.year(),this.month())},dayOfYear:function(a){var b=xb((sb(this).startOf("day")-sb(this).startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")},quarter:function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)},weekYear:function(a){var b=gb(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")},isoWeekYear:function(a){var b=gb(this,1,4).year;return null==a?b:this.add(a-b,"y")},week:function(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")},isoWeek:function(a){var b=gb(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")},weekday:function(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},isoWeeksInYear:function(){return C(this.year(),1,4)},weeksInYear:function(){var a=this.localeData()._week;return C(this.year(),a.dow,a.doy)},get:function(a){return a=x(a),this[a]()},set:function(a,b){return a=x(a),"function"==typeof this[a]&&this[a](b),this},locale:function(b){return b===a?this._locale._abbr:(this._locale=sb.localeData(b),this)},lang:f("moment().lang() is deprecated. Use moment().localeData() instead.",function(b){return b===a?this.localeData():(this._locale=sb.localeData(b),this)}),localeData:function(){return this._locale}}),sb.fn.millisecond=sb.fn.milliseconds=nb("Milliseconds",!1),sb.fn.second=sb.fn.seconds=nb("Seconds",!1),sb.fn.minute=sb.fn.minutes=nb("Minutes",!1),sb.fn.hour=sb.fn.hours=nb("Hours",!0),sb.fn.date=nb("Date",!0),sb.fn.dates=f("dates accessor is deprecated. Use date instead.",nb("Date",!0)),sb.fn.year=nb("FullYear",!0),sb.fn.years=f("years accessor is deprecated. Use year instead.",nb("FullYear",!0)),sb.fn.days=sb.fn.day,sb.fn.months=sb.fn.month,sb.fn.weeks=sb.fn.week,sb.fn.isoWeeks=sb.fn.isoWeek,sb.fn.quarters=sb.fn.quarter,sb.fn.toJSON=sb.fn.toISOString,m(sb.duration.fn=l.prototype,{_bubble:function(){var a,b,c,d=this._milliseconds,e=this._days,f=this._months,g=this._data,h=0;g.milliseconds=d%1e3,a=o(d/1e3),g.seconds=a%60,b=o(a/60),g.minutes=b%60,c=o(b/60),g.hours=c%24,e+=o(c/24),h=o(ob(e)),e-=o(pb(h)),f+=o(e/30),e%=30,h+=o(f/12),f%=12,g.days=e,g.months=f,g.years=h},abs:function(){return this._milliseconds=Math.abs(this._milliseconds),this._days=Math.abs(this._days),this._months=Math.abs(this._months),this._data.milliseconds=Math.abs(this._data.milliseconds),this._data.seconds=Math.abs(this._data.seconds),this._data.minutes=Math.abs(this._data.minutes),this._data.hours=Math.abs(this._data.hours),this._data.months=Math.abs(this._data.months),this._data.years=Math.abs(this._data.years),this},weeks:function(){return o(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*A(this._months/12)},humanize:function(a){var b=fb(this,!a,this.localeData());return a&&(b=this.localeData().pastFuture(+this,b)),this.localeData().postformat(b)},add:function(a,b){var c=sb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=sb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=x(a),this[a.toLowerCase()+"s"]()},as:function(a){var b,c;if(a=x(a),b=this._days+this._milliseconds/864e5,"month"===a||"year"===a)return c=this._months+12*ob(b),"month"===a?c:c/12;switch(b+=pb(this._months/12),a){case"week":return b/7;case"day":return b;case"hour":return 24*b;case"minute":return 24*b*60;case"second":return 24*b*60*60;case"millisecond":return 24*b*60*60*1e3;default:throw new Error("Unknown unit "+a)}},lang:sb.fn.lang,locale:sb.fn.locale,toIsoString:f("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",function(){return this.toISOString()}),toISOString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"},localeData:function(){return this._locale}}),sb.duration.fn.toString=sb.duration.fn.toISOString;for(ub in hc)c(hc,ub)&&qb(ub.toLowerCase());sb.duration.fn.asMilliseconds=function(){return this.as("ms")},sb.duration.fn.asSeconds=function(){return this.as("s")},sb.duration.fn.asMinutes=function(){return this.as("m")},sb.duration.fn.asHours=function(){return this.as("h")},sb.duration.fn.asDays=function(){return this.as("d")},sb.duration.fn.asWeeks=function(){return this.as("weeks")},sb.duration.fn.asMonths=function(){return this.as("M")},sb.duration.fn.asYears=function(){return this.as("y")},sb.locale("en",{ordinal:function(a){var b=a%10,c=1===A(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),Ib?module.exports=sb:"function"==typeof define&&define.amd?(define("moment",function(a,b,c){return c.config&&c.config()&&c.config().noGlobal===!0&&(wb.moment=tb),sb}),rb(!0)):rb()}).call(this);
(function(){var a;a=angular.element,angular.module("validator.directive",["validator.provider"]).directive("validator",["$injector",function(b){return{restrict:"A",require:"ngModel",link:function(c,d,e,f){var g,h,i,j,k,l,m,n,o;return h=b.get("$validator"),g=b.get("$parse"),j=g(e.ngModel),n=[],o=function(a,g){var h,i,k,l,m,o,p;if(null==g&&(g={}),l=0,h=0,i=function(){var a,h,i;if(++l>=n.length){for(f.$setValidity(e.ngModel,!0),h=0,i=n.length;i>h;h++)a=n[h],a.success(j(c),c,d,e,b);"function"==typeof g.success&&g.success()}},0===n.length)return i();for(m=function(a){return a.validator(j(c),c,d,e,{success:function(){return i()},error:function(){if(a.enableError&&1===++h&&(f.$setValidity(e.ngModel,!1),a.error(j(c),c,d,e,b)),1===("function"==typeof g.error?g.error():void 0)){try{d[0].scrollIntoViewIfNeeded()}catch(i){}return d[0].select()}}})},o=0,p=n.length;p>o;o++){switch(k=n[o],a){case"blur":if("blur"!==k.invoke)continue;k.enableError=!0;break;case"watch":if("watch"!==k.invoke&&!k.enableError){i();continue}break;case"broadcast":k.enableError=!0}m(k)}},l=function(){var a;return a=h.getRule("required"),null==a&&(a=h.convertRule("required",{validator:/^.+$/,invoke:"watch"})),n.push(a)},m=function(a){var f,g,h,i,k;for(k=[],f=g=0,h=n.length;h>g;f=g+=1)(null!=(i=n[f])?i.name:void 0)===a&&(n[f].success(j(c),c,d,e,b),n.splice(f,1),k.push(f--));return k},e.$observe("validator",function(a){var f,g,i,j,m,o,p;if(n.length=0,(k.validatorRequired||k.required)&&l(),f=a.match(/^\/(.*)\/$/))return i=h.convertRule("dynamic",{validator:RegExp(f[1]),invoke:e.validatorInvoke,error:e.validatorError}),void n.push(i);if(f=a.match(/^\[(.+)\]$/)){for(j=f[1].split(","),p=[],m=0,o=j.length;o>m;m++)g=j[m],i=h.getRule(g.replace(/^\s+|\s+$/g,"")),"function"==typeof i.init&&i.init(c,d,e,b),p.push(i?n.push(i):void 0);return p}}),e.$observe("validatorError",function(a){var b,c;return b=e.validator.match(/^\/(.*)\/$/),b?(m("dynamic"),c=h.convertRule("dynamic",{validator:RegExp(b[1]),invoke:e.validatorInvoke,error:a}),n.push(c)):void 0}),k={validatorRequired:!1,required:!1},e.$observe("validatorRequired",function(a){return a&&"false"!==a?(l(),k.validatorRequired=!0):k.validatorRequired?(m("required"),k.validatorRequired=!1):void 0}),e.$observe("required",function(a){return a&&"false"!==a?(l(),k.required=!0):k.required?(m("required"),k.required=!1):void 0}),i=function(a,b){var d,f,h,i;return b?e.validatorGroup===b?!0:a.targetScope===c?0===e.ngModel.indexOf(b):(d=function(a,b){var c,e;for(c in a)switch(e=a[c],typeof e){case"string":if("$$hashKey"===c&&e===b)return!0;break;case"object":if(d(e,b))return!0}return!1},f=e.ngModel.indexOf("."),h=f>=0?e.ngModel.substr(0,f):e.ngModel,i=g(h)(c),d(g(b)(a.targetScope),i.$$hashKey)):!0},c.$on(h.broadcastChannel.prepare,function(a,b){return i(a,b.model)?b.accept():void 0}),c.$on(h.broadcastChannel.start,function(a,b){return i(a,b.model)?o("broadcast",{success:b.success,error:b.error}):void 0}),c.$on(h.broadcastChannel.reset,function(a,g){var h,k,l;if(i(a,g.model)){for(k=0,l=n.length;l>k;k++)h=n[k],h.success(j(c),c,d,e,b),"watch"!==h.invoke&&(h.enableError=!1);return f.$setValidity(e.ngModel,!0)}}),c.$watch(e.ngModel,function(a,b){return a!==b?o("watch",{oldValue:b}):void 0}),a(d).bind("blur",function(){return c.$root.$$phase?o("blur"):c.$apply(function(){return o("blur")})})}}}])}).call(this),function(){angular.module("validator",["validator.directive"])}.call(this),function(){var a;a=angular.element,angular.module("validator.provider",[]).provider("$validator",function(){var b,c,d;b=null,c=null,d=null,this.rules={},this.broadcastChannel={prepare:"$validatePrepare",start:"$validateStart",reset:"$validateReset"},this.setupProviders=function(a){return b=a,c=b.get("$q"),d=b.get("$timeout")},this.convertError=function(b){var c;return"function"==typeof b?b:(c=b.constructor===String?b:"",function(b,d,e,f){var g,h,i,j,k,l,m;for(i=a(e).parent(),m=[];0!==i.length;){if(i.hasClass("form-group")){for(i.addClass("has-error"),l=i.find("label"),j=0,k=l.length;k>j;j++)h=l[j],a(h).hasClass("error")&&a(h).remove();g=a("<label class='control-label error'>"+c+"</label>"),f.id&&g.attr("for",f.id),a(e).parent().hasClass("input-group")?a(e).parent().parent().append(g):a(e).parent().append(g);break}m.push(i=i.parent())}return m})},this.convertSuccess=function(b){return"function"==typeof b?b:function(b,c,d){var e,f,g,h,i,j;for(f=a(d).parent(),j=[];0!==f.length;){if(f.hasClass("has-error")){for(f.removeClass("has-error"),i=f.find("label"),g=0,h=i.length;h>g;g++)e=i[g],a(e).hasClass("error")&&a(e).remove();break}j.push(f=f.parent())}return j}},this.convertValidator=function(a){var d,e,f;return f=function(){},a.constructor===RegExp?(e=a,f=function(a,b,c,d,f){return null==a&&(a=""),e.test(a)?"function"==typeof f.success?f.success():void 0:"function"==typeof f.error?f.error():void 0}):"function"==typeof a&&(d=a,f=function(a,e,f,g,h){return c.all([d(a,e,f,g,b)]).then(function(a){return a&&a.length>0&&a[0]?"function"==typeof h.success?h.success():void 0:"function"==typeof h.error?h.error():void 0},function(){return"function"==typeof h.error?h.error():void 0})}),f},this.convertRule=function(a){return function(b,c){var d,e,f;return null==c&&(c={}),d={name:b,enableError:"watch"===c.invoke,invoke:c.invoke,init:c.init,validator:null!=(e=c.validator)?e:function(){return!0},error:null!=(f=c.error)?f:"",success:c.success},d.error=a.convertError(d.error),d.success=a.convertSuccess(d.success),d.validator=a.convertValidator(d.validator),d}}(this),this.register=function(a,b){return null==b&&(b={}),this.rules[a]=this.convertRule(a,b)},this.getRule=function(a){return this.rules[a]?angular.copy(this.rules[a]):null},this.validate=function(a){return function(e,f){var g,h,i,j,k;return i=c.defer(),k=i.promise,h={total:0,success:0,error:0},j={promises:{success:[],error:[],then:[]},accept:function(){return h.total++},validatedSuccess:function(){var a,b,c,d,e,f,g;if(++h.success===h.total){for(f=j.promises.success,b=0,d=f.length;d>b;b++)(a=f[b])();for(g=j.promises.then,c=0,e=g.length;e>c;c++)(a=g[c])()}return h.success},validatedError:function(){var a,b,c,d,e,f,g;if(0===h.error++){for(f=j.promises.error,b=0,d=f.length;d>b;b++)(a=f[b])();for(g=j.promises.then,c=0,e=g.length;e>c;c++)(a=g[c])()}return h.error}},k.success=function(a){return j.promises.success.push(a),k},k.error=function(a){return j.promises.error.push(a),k},k.then=function(a){return j.promises.then.push(a),k},g={model:f,accept:j.accept,success:j.validatedSuccess,error:j.validatedError},e.$broadcast(a.broadcastChannel.prepare,g),d(function(){var a,c,d,f,i;{if(0!==h.total)return a=b.get("$validator"),e.$broadcast(a.broadcastChannel.start,g);for(i=j.promises.success,d=0,f=i.length;f>d;d++)(c=i[d])()}}),k}}(this),this.reset=function(a){return function(b,c){return b.$broadcast(a.broadcastChannel.reset,{model:c})}}(this),this.get=function(a){return this.setupProviders(a),{rules:this.rules,broadcastChannel:this.broadcastChannel,register:this.register,convertRule:this.convertRule,getRule:this.getRule,validate:this.validate,reset:this.reset}},this.get.$inject=["$injector"],this.$get=this.get})}.call(this);
!function(a){var b=["00000000000","11111111111","22222222222","33333333333","44444444444","55555555555","66666666666","77777777777","88888888888","99999999999","12345678909"],c=function(a){a=a.split("").map(function(a){return parseInt(a,10)});var b=a.length+1,c=a.map(function(a,c){return a*(b-c)}),d=c.reduce(function(a,b){return a+b})%11;return 2>d?0:11-d},d={};d.format=function(a){return this.strip(a).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/,"$1.$2.$3-$4")},d.strip=function(a){return(a||"").toString().replace(/[^\d]/g,"")},d.isValid=function(a){var d=this.strip(a);if(!d)return!1;if(11!==d.length)return!1;if(b.indexOf(d)>=0)return!1;var e=d.substr(0,9);return e+=c(e),e+=c(e),e.substr(-2)===d.substr(-2)},d.generate=function(a){for(var b="",d=0;9>d;d++)b+=Math.floor(9*Math.random());return b+=c(b),b+=c(b),a?this.format(b):b},d.build=function(a){return new d(a)},a?module.exports=d:window.CPF=d}("undefined"!=typeof exports),function(a){var b=["11111111111111","22222222222222","33333333333333","44444444444444","55555555555555","66666666666666","77777777777777","88888888888888","99999999999999"],c=function(a){var b=2,c=a.split("").reduce(function(a,b){return[parseInt(b,10)].concat(a)},[]),d=c.reduce(function(a,c){return a+=c*b,b=9===b?2:b+1,a},0),e=d%11;return 2>e?0:11-e},d={};d.format=function(a){return this.strip(a).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5")},d.strip=function(a){return(a||"").toString().replace(/[^\d]/g,"")},d.isValid=function(a){var d=this.strip(a);if(!d)return!1;if(14!==d.length)return!1;if(b.indexOf(d)>=0)return!1;var e=d.substr(0,12);return e+=c(e),e+=c(e),e.substr(-2)===d.substr(-2)},d.generate=function(a){for(var b="",d=0;12>d;d++)b+=Math.floor(9*Math.random());return b+=c(b),b+=c(b),a?this.format(b):b},d.build=function(a){return new d(a)},a?module.exports=d:window.CNPJ=d}("undefined"!=typeof exports);
!function() {
    'use strict';
    var msValidator =  angular.module('msValidator', ['validator']);

    msValidator.config(['$provide', '$compileProvider', '$validatorProvider', 
                        function( $provide, $compileProvider, $validatorProvider){


            msValidator._directive = msValidator.directive;
            msValidator.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };  

            msValidator._factory = msValidator.factory;
            msValidator.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };

            msValidator.$validatorProvider = $validatorProvider;


            msValidator.showError = function (element, attrs, message) {

                if(attrs.type == 'radio' || attrs.type == 'checkbox') {
                    element = angular.element(element[0].parentElement);
                }

                if(attrs.validatorParent) {
                   element = angular.element('#' + attrs.validatorParent); 
                }

                var id = element[0].id;
                var newElement = angular.element('<div id="' + id + '-error-message" class="alert alert-danger">' + message + '</div>');

                if(element.hasClass('has-error')) {
                    angular.element('#' + id + '-error-message').remove();
                }
                else {
                    element.addClass('has-error');
                }

                element.after(newElement);
            }

            msValidator.removeError = function (element, attrs) {
                if(attrs.type == 'radio' || attrs.type == 'checkbox') {
                    element = angular.element(element[0].parentElement);
                }

                if(attrs.validatorParent) {
                   element = angular.element('#' + attrs.validatorParent); 
                }

                var id = element[0].id;
                angular.element('#' + id + '-error-message').remove();
            }

            /*
             * Regras de validação padrões
             */
            msValidator._validators = {
                cpf: function(value, scope, element, attrs, $injector) {
                    return (!value) ? true : window.CPF.isValid(value);
                },
                required: /.+/,
                email: function(value) {
                    if (!value || value.trim() == '') {
                        return true;
                    }
                    return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
                }, 
                number: /^[-+]?[0-9]*[\.]?[0-9]*$/,
                url: /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_\#]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)*$/,
                cnpj: function(value, scope, element, attrs, $injector) {
                    return (!value) ? true : window.CNPJ.isValid(value);
                },
                date: function(value, scope, element, attrs, $injector) {
                    
                    return (!value) ? true : angular.isDate(value);
                },
                dateGte: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    } 
                    if(attrs.min) {
                        if(typeof value != 'undefined') {
                            var date = moment(value);
                            scope.dateGte = parseDate(scope, attrs.min, $injector);

                            if(angular.isDate(scope.dateGte)) {
                                scope.dateGte.setHours(0,0,0,0);
                                var limit = moment(scope.dateGte);
                                return  (date.diff(limit, 'days', true) >= 0);
                            }
                            else
                                return true;
                        }
                        else
                            return true;
                    }
                    else
                    {
                        throw 'Não foi informada uma data de início para validação "maior ou igual a - (dateGte)".';
                    }
                },
                dateLte: function(value, scope, element, attrs, $injector) {
                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    }
                    if(attrs.max) {
                        if(typeof value != 'undefined') {
                            value.setHours(0,0,0,0);
                            var date = moment(value);
                            scope.dateLte = parseDate(scope, attrs.max, $injector);

                            if(angular.isDate(scope.dateLte)) {
                                scope.dateLte.setHours(0,0,0,0);
                                var limit = moment(scope.dateLte);
                                return  (date.diff(limit, 'days', true) <= 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data fim para validação "menor ou igual a - (dateLte)".';
                    }
                },
                dateGt: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    }
                    if(attrs.min) {
                        if(typeof value != 'undefined') {
                            var date = moment(value);
                            scope.dateGt = parseDate(scope, attrs.min, $injector);

                            if(angular.isDate(scope.dateGt)) {
                                scope.dateGt.setHours(0,0,0,0);

                                var limit = moment(scope.dateGt);
                                return  (date.diff(limit, 'days', true) > 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data de início para validação "maior que - (dateGte)".';
                    }
                },
                dateLt: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    } 
                    if(attrs.max) {
                        if(typeof value != 'undefined') {
                            value.setHours(0,0,0,0);
                            var date = moment(value);
                            scope.dateLt = parseDate(scope, attrs.max, $injector);

                            if(angular.isDate(scope.dateLt)) {
                                scope.dateLt.setHours(0,0,0,0);

                                var limit = moment(scope.dateLt);
                                return  (date.diff(limit, 'days', true) < 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data inicial para validação "menor que - (dateLt)".';
                    }
                },
                dateBtw: function(value, scope, element, attrs, $injector) {

                    if(typeof value != 'undefined') {
                        var date = moment(value);
                    }
                    else {
                        return true;
                    }

                    if(attrs.min) {
                        scope.dateBtwGte = parseDate(scope, attrs.min, $injector);

                        if(angular.isDate(scope.dateBtwGte)) 
                            scope.dateBtwGte.setHours(0,0,0,0);

                        var gte = moment(scope.dateBtwGte);
                    }
                    else
                    {
                        throw 'Não foi informada uma data inicial para validação "entre X e Y - (dateBtw)".';
                    }

                    if(attrs.max) {
                        scope.dateBtwLte = parseDate(scope, attrs.max, $injector);

                        if(angular.isDate(scope.dateBtwLte))
                            scope.dateBtwLte.setHours(0,0,0,0);

                        var lte = moment(scope.dateBtwLte);
                    }
                    else
                    {
                        throw 'Não foi informada uma data fim para validação "entre X e Y - (dateBtw)".';
                    }
                    if(angular.isDate(scope.dateBtwLte) && angular.isDate(scope.dateBtwGte)) 
                        return  ((date.valueOf() <= lte.valueOf()) && (date.valueOf() >= gte.valueOf()));
                    else
                        return true;
                }
            }

            /**
             * REQUIRED
             */

            $validatorProvider.register('required', {
                invoke: 'blur',
                validator: msValidator._validators.required,
                error: function(value, scope, element, attrs, $injector){
                    msValidator.showError(element, attrs,'Este campo é obrigatório');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });


            /**
             * NUMBER
             */
            $validatorProvider.register('number', {
                invoke: 'watch',
                validator: msValidator._validators.number,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs,'Este campo só aceita números');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /**
             * EMAIL
             */
            $validatorProvider.register('email', {
                invoke: 'blur',
                validator: msValidator._validators.email,
                error: function(x, scope, element, attrs){
                    msValidator.showError(element, attrs,'Informe um email correto');
                },
                success: function(x, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * URL
             */
            $validatorProvider.register('url', {
                invoke: 'watch',
                validator: msValidator._validators.url,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs,'Informe uma URL válida');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * CPF
             */
            $validatorProvider.register('cpf', {
                invoke: 'blur',
                validator: msValidator._validators.cpf,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs, 'Informe um CPF válido');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * CNPJ
             */
            $validatorProvider.register('cnpj', {
                invoke: 'blur',
                validator: msValidator._validators.cnpj,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs, 'Informe um CNPJ válido.');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * Função de parser de data
             */

            function parseDate(scope, toParse, $injector) {
                var $parse = $injector.get('$parse');
                var parseGetter = $parse(toParse);
                return parseGetter(scope);
            }




            /**
             * Date
             */

            $validatorProvider.register('date', {
                invoke: 'watch',
                validator: msValidator._validators.date,
                error: function(value, scope, element, attrs, $injector){
                    msValidator.showError(element, attrs,'A data informada nao é válida.');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });


            /*
             * DateLte
             * Deve-se informar o valor limite com o atributo end-date
             */
            $validatorProvider.register('dateLte', {
                invoke: 'blur',
                validator: msValidator._validators.dateLte,
                error: function(value, scope, element, attrs, $injector){
                    var dateLte = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data menor ou igual a ' + moment(dateLte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * Dategte
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateGte', {
                invoke: 'blur',
                validator: msValidator._validators.dateGte,
                error: function(value, scope, element, attrs, $injector){
                    var dateGte = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior ou igual a ' + moment(dateGte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });



            /*
             * DateGt
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateGt', {
                invoke: 'blur',
                validator: msValidator._validators.dateGt,
                error: function(value, scope, element, attrs, $injector){
                    var dateGt = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior que ' + moment(dateGt).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });



            /*
             * DateLt
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateLt', {
                invoke: 'blur',
                validator: msValidator._validators.dateLt,
                error: function(value, scope, element, attrs, $injector){
                    var dateLt = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data menor que ' + moment(dateLt).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * DateBtw (Between)
             * Deve-se informar o valor inicial com o atributo min(padrão do datepicker) e o final com o atributo max(padrão datepicker)
             */
            $validatorProvider.register('dateBtw', {
                invoke: 'watch',
                validator: msValidator._validators.dateBtw,
                error: function(value, scope, element, attrs, $injector){
                    var dateBtwGte = parseDate(scope, attrs.min, $injector);
                    var dateBtwLte = parseDate(scope, attrs.max, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior ou igual a ' + moment(dateBtwGte).format('DD/MM/YYYY') + ' e menor ou igual que ' + moment(dateBtwLte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

    }]);

    return msValidator;		
}();
   
!function() {
    'use strict';

    var msValidator = angular.module('msValidator');
    
    msValidator.factory('msValidatorService', ['$log', '$validator',  
        function($log, $validator){

           'use strict';

           var setErrorMessage = function setErrorMessage(rules) {
               try{
                   if(typeof rules == 'string') {
                       throw 'As mensagens de validação devem ser informadas em um objeto no formato {regra: mensagem}';
                   }

                   angular.forEach(rules, function(message, rule) {

                       var validatorRule = $validator.getRule(rule);

                       msValidator.$validatorProvider.register(rule, {
                           invoke: validatorRule.invoke,
                           validator: msValidator._validators[rule],
                           error: function(value, scope, element, attrs){
                               msValidator.showError(element, attrs, message);
                           },
                           success: validatorRule.success
                       });

                   });

               }
               catch(e) {
                   $log.error(e);
               }
           }

           var register = function(obj) {
               msValidator.$validatorProvider.register(obj.rule, {
                   invoke: obj.invoke,
                   validator: obj.validator,
                   error: function(value, scope, element, attrs){
                       msValidator.showError(element, attrs, obj.message);
                   },
                   success: function(value, scope, element, attrs){
                       msValidator.removeError(element, attrs);
                   }
               });
           }

           return {
               setErrorMessage: setErrorMessage,
               register: register,
               validate: $validator.validate,
               reset: $validator.reset,
               getRule: $validator.getRule,
               showError: msValidator.showError,
               removeError: msValidator.removeError
           };
   }]);

    return msValidator;
		
}();