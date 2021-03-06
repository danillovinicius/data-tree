/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},t=f.lib={},g=function(){},j=t.Base={extend:function(a){g.prototype=this;var c=new g;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=t.WordArray=j.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||u).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new q.init(c,a)}}),v=f.enc={},u=v.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new q.init(d,c/2)}},k=v.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new q.init(d,c)}},l=v.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
x=t.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var m=0;m<a;m+=e)this._doProcessBlock(d,m);m=d.splice(0,a);c.sigBytes-=b}return new q.init(m,b)},clone:function(){var a=j.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});t.Hasher=x.extend({cfg:j.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new w.HMAC.init(a,
d)).finalize(c)}}});var w=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,t=f.WordArray,g=f.Hasher,f=s.algo,j=[],q=[],v=function(a){return 4294967296*(a-(a|0))|0},u=2,k=0;64>k;){var l;a:{l=u;for(var x=h.sqrt(l),w=2;w<=x;w++)if(!(l%w)){l=!1;break a}l=!0}l&&(8>k&&(j[k]=v(h.pow(u,0.5))),q[k]=v(h.pow(u,1/3)),k++);u++}var a=[],f=f.SHA256=g.extend({_doReset:function(){this._hash=new t.init(j.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],m=b[2],h=b[3],p=b[4],j=b[5],k=b[6],l=b[7],n=0;64>n;n++){if(16>n)a[n]=
c[d+n]|0;else{var r=a[n-15],g=a[n-2];a[n]=((r<<25|r>>>7)^(r<<14|r>>>18)^r>>>3)+a[n-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+a[n-16]}r=l+((p<<26|p>>>6)^(p<<21|p>>>11)^(p<<7|p>>>25))+(p&j^~p&k)+q[n]+a[n];g=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&m^f&m);l=k;k=j;j=p;p=h+r|0;h=m;m=f;f=e;e=r+g|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+m|0;b[3]=b[3]+h|0;b[4]=b[4]+p|0;b[5]=b[5]+j|0;b[6]=b[6]+k|0;b[7]=b[7]+l|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=g.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=g._createHelper(f);s.HmacSHA256=g._createHmacHelper(f)})(Math);

function ucFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function resolve(names) {
    return {
        load: ['$q', '$rootScope', function ($q, $rootScope) {
            var defer = $q.defer();
            require(names, function () {
                defer.resolve();
                $rootScope.$apply();
            });
            return defer.promise;
        }]
    }
};

function retira_acentos(palavra) { 
    com_acento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ"; 
    sem_acento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC"; 
    nova=""; 
    for(i=0;i<palavra.length;i++) { 
        if (com_acento.search(palavra.substr(i,1))>=0) { 
            nova += sem_acento.substr(com_acento.search(palavra.substr(i,1)),1); 
        } 
        else { 
            nova+=palavra.substr(i,1); 
        } 
    } 
    return nova; 
}


function setaCookieContraste(b){var a=new Date,c=a.getTime()+6048E5;a.setTime(c);document.cookie="ativo"==b?"Contraste=Sim; expires="+a.toGMTString():"Contraste=Nao; expires="+a.toGMTString()}function atribuirContraste(){!0==$("body").hasClass("acessibilidade")?($("body").removeClass("acessibilidade"),setaCookieContraste("inativo")):($("body").addClass("acessibilidade"),setaCookieContraste("ativo"))}var results=document.cookie.match("(^|;) ?Contraste=([^;]*)(;|$)");
$(this).load(function(){null!=results&&"Sim"==results[2]&&atribuirContraste("ativo")});
/*
 *  Project: RV Font Size jQuery Plugin
 *  Description: An easy and flexible jquery plugin to give font size accessibility control.
 *  URL: https://github.com/ramonvictor/rv-jquery-fontsize/
 *  Author: Ramon Victor (https://github.com/ramonvictor/)
 *  License: Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *  Any and all use of this script must be accompanied by this copyright/license notice in its present form.
 */
(function(e,d,a,g){var b="rvFontsize",f={targetSection:"body",store:false,storeIsDefined:!(typeof store==="undefined"),variations:7,controllers:{append:true,appendTo:"body",showResetButton:false,template:""}};function c(j,i){var h=this;h.element=j;h.options=e.extend({},f,i);h._defaults=f;h._name=b;h.init()}c.prototype={init:function(){var h=this,i=function(){h.defineElements();h.getDefaultFontSize()};i();if(h.options.store===true&&!(h.options.storeIsDefined)){h.dependencyWarning()}},dependencyWarning:function(){console.warn('When you difine "store: true", store script is required (https://github.com/ramonvictor/rv-jquery-fontsize/blob/master/js/store.min.js)')},bindControlerHandlers:function(){var h=this;h.$decreaseButton=e(".rvfs-decrease");if(h.$decreaseButton.length>0){h.$decreaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k>1){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k-1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$increaseButton=e(".rvfs-increase");if(h.$increaseButton.length>0){h.$increaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k<h.options.variations){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k+1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$resetButton=e(".rvfs-reset");if(h.$resetButton.length>0){h.$resetButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",h.defaultFontsize);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}})}},defineElements:function(){var h=this;h.$target=e(h.options.targetSection);if(h.options.controllers.append!==false){var i=h.options.controllers.showResetButton?'<a href="#" class="rvfs-reset btn" title="Default font size">A</a>':"";var k=h.options.controllers.template,j="";h.$appendTo=e(h.options.controllers.appendTo);if(e.trim(k).length>0){j=k}else{j='<div class="btn-group"><a href="#" class="rvfs-decrease btn" title="Decrease font size">A<sup>-</sup></a></li>'+i+'<a href="#" class="rvfs-increase btn" title="Increase font size">A<sup>+</sup></a></li></div>'}h.$appendTo.html(j);h.bindControlerHandlers()}},getDefaultFontSize:function(){var h=this,i=h.options.variations;h.defaultFontsize=0;if(i%2===0){h.defaultFontsize=(i/2)+1}else{h.defaultFontsize=parseInt((i/2)+1,10)}h.setDefaultFontSize()},setDefaultFontSize:function(){var h=this;if(h.options.store===true&&h.options.storeIsDefined){var i=store.get("rvfs")||h.defaultFontsize;h.$target.attr("data-rvfs",i)}else{h.$target.attr("data-rvfs",h.defaultFontsize)}h.fontsizeChanged()},storeCurrentSize:function(){var h=this;if(h.options.storeIsDefined){store.set("rvfs",h.$target.attr("data-rvfs"))}else{h.dependencyWarning()}},getCurrentVariation:function(){return parseInt(this.$target.attr("data-rvfs"),10)},fontsizeChanged:function(){var h=this,i=h.getCurrentVariation();h.$target.addClass("rvfs-"+i);if(i===h.defaultFontsize){h.$resetButton.addClass("disabled")}else{h.$resetButton.removeClass("disabled")}if(i===h.options.variations){h.$increaseButton.addClass("disabled")}else{h.$increaseButton.removeClass("disabled")}if(i===1){h.$decreaseButton.addClass("disabled")}else{h.$decreaseButton.removeClass("disabled")}}};e.fn[b]=function(i){var h=this;return h.each(function(){if(!e.data(h,"plugin_"+b)){e.data(h,"plugin_"+b,new c(h,i))}})};e[b]=function(){var h=e(d);return h.rvFontsize.apply(h,Array.prototype.slice.call(arguments,0))}})(jQuery,window,document);