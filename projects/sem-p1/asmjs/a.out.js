var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=(function(status,toThrow){throw toThrow});Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));process["on"]("unhandledRejection",(function(reason,p){process["exit"](1)}));Module["quit"]=(function(status){process["exit"](status)});Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){return read(f)}}Module["readBinary"]=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WEB){if(document.currentScript){scriptDirectory=document.currentScript.src}}else{scriptDirectory=self.location.href}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}Module["read"]=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=(function(title){document.title=title})}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var jsCallStartIndex=1;var functionPointers=new Array(0);var funcWrappers={};function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var GLOBAL_BASE=8;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={"stackSave":(function(){stackSave()}),"stackRestore":(function(){stackRestore()}),"arrayToC":(function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var ALLOC_STATIC=2;var ALLOC_NONE=4;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}var Math_abs=Math.abs;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+512;__ATINIT__.push();var tempDoublePtr=STATICTOP;STATICTOP+=16;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"enlargeMemory":enlargeMemory,"getTotalMemory":getTotalMemory,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"___setErrNo":___setErrNo,"_emscripten_memcpy_big":_emscripten_memcpy_big,"DYNAMICTOP_PTR":DYNAMICTOP_PTR,"tempDoublePtr":tempDoublePtr,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.DYNAMICTOP_PTR|0;var j=env.tempDoublePtr|0;var k=env.STACKTOP|0;var l=env.STACK_MAX|0;var m=0;var n=0;var o=0;var p=0;var q=global.NaN,r=global.Infinity;var s=0,t=0,u=0,v=0,w=0.0;var x=0;var y=global.Math.floor;var z=global.Math.abs;var A=global.Math.sqrt;var B=global.Math.pow;var C=global.Math.cos;var D=global.Math.sin;var E=global.Math.tan;var F=global.Math.acos;var G=global.Math.asin;var H=global.Math.atan;var I=global.Math.atan2;var J=global.Math.exp;var K=global.Math.log;var L=global.Math.ceil;var M=global.Math.imul;var N=global.Math.min;var O=global.Math.max;var P=global.Math.clz32;var Q=env.abort;var R=env.assert;var S=env.enlargeMemory;var T=env.getTotalMemory;var U=env.abortOnCannotGrowMemory;var V=env.___setErrNo;var W=env._emscripten_memcpy_big;var X=0.0;
// EMSCRIPTEN_START_FUNCS
function Y(a){a=a|0;var b=0;b=k;k=k+a|0;k=k+15&-16;return b|0}function Z(){return k|0}function _(a){a=a|0;k=a}function $(a,b){a=a|0;b=b|0;k=a;l=b}function aa(a,b){a=a|0;b=b|0;if(!m){m=a;n=b}}function ba(a){a=a|0;x=a}function ca(){return x|0}function da(a){a=a|0;var b=0,c=0,d=0,e=0;if((a|0)<2){e=0;return e|0}d=2;b=0;while(1){a:do if(d>>>0>2){c=2;while(1){if(!((d>>>0)%(c>>>0)|0))break a;c=c+1|0;if(c>>>0>=d>>>0){e=8;break}}}else e=8;while(0);if((e|0)==8){e=0;b=b+1|0}if((d|0)==(a|0))break;else d=d+1|0}return b|0}function ea(a){a=a|0;var b=0,c=0;if((a|0)<1){a=1;return a|0}c=1;b=1;while(1){b=M(c,b)|0;if((c|0)==(a|0))break;else c=c+1|0}return b|0}function fa(a,b){a=a|0;b=b|0;return M(b,a)|0}function ga(a,b){a=a|0;b=b|0;return b+a|0}function ha(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;x=k;k=k+16|0;o=x;do if(a>>>0<245){l=a>>>0<11?16:a+11&-8;a=l>>>3;n=c[2]|0;d=n>>>a;if(d&3|0){b=(d&1^1)+a|0;a=48+(b<<1<<2)|0;d=a+8|0;e=c[d>>2]|0;f=e+8|0;g=c[f>>2]|0;if((g|0)==(a|0))c[2]=n&~(1<<b);else{c[g+12>>2]=a;c[d>>2]=g}w=b<<3;c[e+4>>2]=w|3;w=e+w+4|0;c[w>>2]=c[w>>2]|1;w=f;k=x;return w|0}m=c[4]|0;if(l>>>0>m>>>0){if(d|0){b=2<<a;b=d<<a&(b|0-b);b=(b&0-b)+-1|0;i=b>>>12&16;b=b>>>i;d=b>>>5&8;b=b>>>d;g=b>>>2&4;b=b>>>g;a=b>>>1&2;b=b>>>a;e=b>>>1&1;e=(d|i|g|a|e)+(b>>>e)|0;b=48+(e<<1<<2)|0;a=b+8|0;g=c[a>>2]|0;i=g+8|0;d=c[i>>2]|0;if((d|0)==(b|0)){a=n&~(1<<e);c[2]=a}else{c[d+12>>2]=b;c[a>>2]=d;a=n}w=e<<3;h=w-l|0;c[g+4>>2]=l|3;f=g+l|0;c[f+4>>2]=h|1;c[g+w>>2]=h;if(m|0){e=c[7]|0;b=m>>>3;d=48+(b<<1<<2)|0;b=1<<b;if(!(a&b)){c[2]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=e;c[b+12>>2]=e;c[e+8>>2]=b;c[e+12>>2]=d}c[4]=h;c[7]=f;w=i;k=x;return w|0}g=c[3]|0;if(g){d=(g&0-g)+-1|0;f=d>>>12&16;d=d>>>f;e=d>>>5&8;d=d>>>e;h=d>>>2&4;d=d>>>h;i=d>>>1&2;d=d>>>i;j=d>>>1&1;j=c[312+((e|f|h|i|j)+(d>>>j)<<2)>>2]|0;d=j;i=j;j=(c[j+4>>2]&-8)-l|0;while(1){a=c[d+16>>2]|0;if(!a){a=c[d+20>>2]|0;if(!a)break}h=(c[a+4>>2]&-8)-l|0;f=h>>>0<j>>>0;d=a;i=f?a:i;j=f?h:j}h=i+l|0;if(h>>>0>i>>>0){f=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=c[a>>2]|0;if(!b){a=i+16|0;b=c[a>>2]|0;if(!b){d=0;break}}while(1){e=b+20|0;d=c[e>>2]|0;if(!d){e=b+16|0;d=c[e>>2]|0;if(!d)break;else{b=d;a=e}}else{b=d;a=e}}c[a>>2]=0;d=b}else{d=c[i+8>>2]|0;c[d+12>>2]=b;c[b+8>>2]=d;d=b}while(0);do if(f|0){b=c[i+28>>2]|0;a=312+(b<<2)|0;if((i|0)==(c[a>>2]|0)){c[a>>2]=d;if(!d){c[3]=g&~(1<<b);break}}else{w=f+16|0;c[((c[w>>2]|0)==(i|0)?w:f+20|0)>>2]=d;if(!d)break}c[d+24>>2]=f;b=c[i+16>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}b=c[i+20>>2]|0;if(b|0){c[d+20>>2]=b;c[b+24>>2]=d}}while(0);if(j>>>0<16){w=j+l|0;c[i+4>>2]=w|3;w=i+w+4|0;c[w>>2]=c[w>>2]|1}else{c[i+4>>2]=l|3;c[h+4>>2]=j|1;c[h+j>>2]=j;if(m|0){e=c[7]|0;b=m>>>3;d=48+(b<<1<<2)|0;b=1<<b;if(!(b&n)){c[2]=b|n;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=e;c[b+12>>2]=e;c[e+8>>2]=b;c[e+12>>2]=d}c[4]=j;c[7]=h}w=i+8|0;k=x;return w|0}else n=l}else n=l}else n=l}else if(a>>>0<=4294967231){a=a+11|0;l=a&-8;e=c[3]|0;if(e){f=0-l|0;a=a>>>8;if(a)if(l>>>0>16777215)j=31;else{n=(a+1048320|0)>>>16&8;r=a<<n;i=(r+520192|0)>>>16&4;r=r<<i;j=(r+245760|0)>>>16&2;j=14-(i|n|j)+(r<<j>>>15)|0;j=l>>>(j+7|0)&1|j<<1}else j=0;d=c[312+(j<<2)>>2]|0;a:do if(!d){d=0;a=0;r=61}else{a=0;i=l<<((j|0)==31?0:25-(j>>>1)|0);g=0;while(1){h=(c[d+4>>2]&-8)-l|0;if(h>>>0<f>>>0)if(!h){a=d;f=0;r=65;break a}else{a=d;f=h}r=c[d+20>>2]|0;d=c[d+16+(i>>>31<<2)>>2]|0;g=(r|0)==0|(r|0)==(d|0)?g:r;if(!d){d=g;r=61;break}else i=i<<1}}while(0);if((r|0)==61){if((d|0)==0&(a|0)==0){a=2<<j;a=(a|0-a)&e;if(!a){n=l;break}n=(a&0-a)+-1|0;h=n>>>12&16;n=n>>>h;g=n>>>5&8;n=n>>>g;i=n>>>2&4;n=n>>>i;j=n>>>1&2;n=n>>>j;d=n>>>1&1;a=0;d=c[312+((g|h|i|j|d)+(n>>>d)<<2)>>2]|0}if(!d){i=a;h=f}else r=65}if((r|0)==65){g=d;while(1){n=(c[g+4>>2]&-8)-l|0;d=n>>>0<f>>>0;f=d?n:f;a=d?g:a;d=c[g+16>>2]|0;if(!d)d=c[g+20>>2]|0;if(!d){i=a;h=f;break}else g=d}}if(((i|0)!=0?h>>>0<((c[4]|0)-l|0)>>>0:0)?(m=i+l|0,m>>>0>i>>>0):0){g=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=c[a>>2]|0;if(!b){a=i+16|0;b=c[a>>2]|0;if(!b){b=0;break}}while(1){f=b+20|0;d=c[f>>2]|0;if(!d){f=b+16|0;d=c[f>>2]|0;if(!d)break;else{b=d;a=f}}else{b=d;a=f}}c[a>>2]=0}else{w=c[i+8>>2]|0;c[w+12>>2]=b;c[b+8>>2]=w}while(0);do if(g){a=c[i+28>>2]|0;d=312+(a<<2)|0;if((i|0)==(c[d>>2]|0)){c[d>>2]=b;if(!b){e=e&~(1<<a);c[3]=e;break}}else{w=g+16|0;c[((c[w>>2]|0)==(i|0)?w:g+20|0)>>2]=b;if(!b)break}c[b+24>>2]=g;a=c[i+16>>2]|0;if(a|0){c[b+16>>2]=a;c[a+24>>2]=b}a=c[i+20>>2]|0;if(a){c[b+20>>2]=a;c[a+24>>2]=b}}while(0);b:do if(h>>>0<16){w=h+l|0;c[i+4>>2]=w|3;w=i+w+4|0;c[w>>2]=c[w>>2]|1}else{c[i+4>>2]=l|3;c[m+4>>2]=h|1;c[m+h>>2]=h;b=h>>>3;if(h>>>0<256){d=48+(b<<1<<2)|0;a=c[2]|0;b=1<<b;if(!(a&b)){c[2]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=m;c[b+12>>2]=m;c[m+8>>2]=b;c[m+12>>2]=d;break}b=h>>>8;if(b)if(h>>>0>16777215)d=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;d=(w+245760|0)>>>16&2;d=14-(u|v|d)+(w<<d>>>15)|0;d=h>>>(d+7|0)&1|d<<1}else d=0;b=312+(d<<2)|0;c[m+28>>2]=d;a=m+16|0;c[a+4>>2]=0;c[a>>2]=0;a=1<<d;if(!(e&a)){c[3]=e|a;c[b>>2]=m;c[m+24>>2]=b;c[m+12>>2]=m;c[m+8>>2]=m;break}b=c[b>>2]|0;c:do if((c[b+4>>2]&-8|0)!=(h|0)){e=h<<((d|0)==31?0:25-(d>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(h|0)){b=a;break c}else{e=e<<1;b=a}}c[d>>2]=m;c[m+24>>2]=b;c[m+12>>2]=m;c[m+8>>2]=m;break b}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=m;c[v>>2]=m;c[m+8>>2]=w;c[m+12>>2]=b;c[m+24>>2]=0}while(0);w=i+8|0;k=x;return w|0}else n=l}else n=l}else n=-1;while(0);d=c[4]|0;if(d>>>0>=n>>>0){b=d-n|0;a=c[7]|0;if(b>>>0>15){w=a+n|0;c[7]=w;c[4]=b;c[w+4>>2]=b|1;c[a+d>>2]=b;c[a+4>>2]=n|3}else{c[4]=0;c[7]=0;c[a+4>>2]=d|3;w=a+d+4|0;c[w>>2]=c[w>>2]|1}w=a+8|0;k=x;return w|0}h=c[5]|0;if(h>>>0>n>>>0){u=h-n|0;c[5]=u;w=c[8]|0;v=w+n|0;c[8]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;k=x;return w|0}if(!(c[120]|0)){c[122]=4096;c[121]=4096;c[123]=-1;c[124]=-1;c[125]=0;c[113]=0;c[120]=o&-16^1431655768;a=4096}else a=c[122]|0;i=n+48|0;j=n+47|0;g=a+j|0;f=0-a|0;l=g&f;if(l>>>0<=n>>>0){w=0;k=x;return w|0}a=c[112]|0;if(a|0?(m=c[110]|0,o=m+l|0,o>>>0<=m>>>0|o>>>0>a>>>0):0){w=0;k=x;return w|0}d:do if(!(c[113]&4)){d=c[8]|0;e:do if(d){e=456;while(1){o=c[e>>2]|0;if(o>>>0<=d>>>0?(o+(c[e+4>>2]|0)|0)>>>0>d>>>0:0)break;a=c[e+8>>2]|0;if(!a){r=128;break e}else e=a}b=g-h&f;if(b>>>0<2147483647){a=na(b|0)|0;if((a|0)==((c[e>>2]|0)+(c[e+4>>2]|0)|0)){if((a|0)!=(-1|0)){h=b;g=a;r=145;break d}}else{e=a;r=136}}else b=0}else r=128;while(0);do if((r|0)==128){d=na(0)|0;if((d|0)!=(-1|0)?(b=d,p=c[121]|0,q=p+-1|0,b=((q&b|0)==0?0:(q+b&0-p)-b|0)+l|0,p=c[110]|0,q=b+p|0,b>>>0>n>>>0&b>>>0<2147483647):0){o=c[112]|0;if(o|0?q>>>0<=p>>>0|q>>>0>o>>>0:0){b=0;break}a=na(b|0)|0;if((a|0)==(d|0)){h=b;g=d;r=145;break d}else{e=a;r=136}}else b=0}while(0);do if((r|0)==136){d=0-b|0;if(!(i>>>0>b>>>0&(b>>>0<2147483647&(e|0)!=(-1|0))))if((e|0)==(-1|0)){b=0;break}else{h=b;g=e;r=145;break d}a=c[122]|0;a=j-b+a&0-a;if(a>>>0>=2147483647){h=b;g=e;r=145;break d}if((na(a|0)|0)==(-1|0)){na(d|0)|0;b=0;break}else{h=a+b|0;g=e;r=145;break d}}while(0);c[113]=c[113]|4;r=143}else{b=0;r=143}while(0);if(((r|0)==143?l>>>0<2147483647:0)?(u=na(l|0)|0,q=na(0)|0,s=q-u|0,t=s>>>0>(n+40|0)>>>0,!((u|0)==(-1|0)|t^1|u>>>0<q>>>0&((u|0)!=(-1|0)&(q|0)!=(-1|0))^1)):0){h=t?s:b;g=u;r=145}if((r|0)==145){b=(c[110]|0)+h|0;c[110]=b;if(b>>>0>(c[111]|0)>>>0)c[111]=b;j=c[8]|0;f:do if(j){b=456;while(1){a=c[b>>2]|0;d=c[b+4>>2]|0;if((g|0)==(a+d|0)){r=154;break}e=c[b+8>>2]|0;if(!e)break;else b=e}if(((r|0)==154?(v=b+4|0,(c[b+12>>2]&8|0)==0):0)?g>>>0>j>>>0&a>>>0<=j>>>0:0){c[v>>2]=d+h;w=(c[5]|0)+h|0;u=j+8|0;u=(u&7|0)==0?0:0-u&7;v=j+u|0;u=w-u|0;c[8]=v;c[5]=u;c[v+4>>2]=u|1;c[j+w+4>>2]=40;c[9]=c[124];break}if(g>>>0<(c[6]|0)>>>0)c[6]=g;d=g+h|0;b=456;while(1){if((c[b>>2]|0)==(d|0)){r=162;break}a=c[b+8>>2]|0;if(!a)break;else b=a}if((r|0)==162?(c[b+12>>2]&8|0)==0:0){c[b>>2]=g;m=b+4|0;c[m>>2]=(c[m>>2]|0)+h;m=g+8|0;m=g+((m&7|0)==0?0:0-m&7)|0;b=d+8|0;b=d+((b&7|0)==0?0:0-b&7)|0;l=m+n|0;i=b-m-n|0;c[m+4>>2]=n|3;g:do if((j|0)==(b|0)){w=(c[5]|0)+i|0;c[5]=w;c[8]=l;c[l+4>>2]=w|1}else{if((c[7]|0)==(b|0)){w=(c[4]|0)+i|0;c[4]=w;c[7]=l;c[l+4>>2]=w|1;c[l+w>>2]=w;break}a=c[b+4>>2]|0;if((a&3|0)==1){h=a&-8;e=a>>>3;h:do if(a>>>0<256){a=c[b+8>>2]|0;d=c[b+12>>2]|0;if((d|0)==(a|0)){c[2]=c[2]&~(1<<e);break}else{c[a+12>>2]=d;c[d+8>>2]=a;break}}else{g=c[b+24>>2]|0;a=c[b+12>>2]|0;do if((a|0)==(b|0)){d=b+16|0;e=d+4|0;a=c[e>>2]|0;if(!a){a=c[d>>2]|0;if(!a){a=0;break}}else d=e;while(1){f=a+20|0;e=c[f>>2]|0;if(!e){f=a+16|0;e=c[f>>2]|0;if(!e)break;else{a=e;d=f}}else{a=e;d=f}}c[d>>2]=0}else{w=c[b+8>>2]|0;c[w+12>>2]=a;c[a+8>>2]=w}while(0);if(!g)break;d=c[b+28>>2]|0;e=312+(d<<2)|0;do if((c[e>>2]|0)!=(b|0)){w=g+16|0;c[((c[w>>2]|0)==(b|0)?w:g+20|0)>>2]=a;if(!a)break h}else{c[e>>2]=a;if(a|0)break;c[3]=c[3]&~(1<<d);break h}while(0);c[a+24>>2]=g;d=b+16|0;e=c[d>>2]|0;if(e|0){c[a+16>>2]=e;c[e+24>>2]=a}d=c[d+4>>2]|0;if(!d)break;c[a+20>>2]=d;c[d+24>>2]=a}while(0);b=b+h|0;f=h+i|0}else f=i;b=b+4|0;c[b>>2]=c[b>>2]&-2;c[l+4>>2]=f|1;c[l+f>>2]=f;b=f>>>3;if(f>>>0<256){d=48+(b<<1<<2)|0;a=c[2]|0;b=1<<b;if(!(a&b)){c[2]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=l;c[b+12>>2]=l;c[l+8>>2]=b;c[l+12>>2]=d;break}b=f>>>8;do if(!b)e=0;else{if(f>>>0>16777215){e=31;break}v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;e=(w+245760|0)>>>16&2;e=14-(u|v|e)+(w<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);b=312+(e<<2)|0;c[l+28>>2]=e;a=l+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[3]|0;d=1<<e;if(!(a&d)){c[3]=a|d;c[b>>2]=l;c[l+24>>2]=b;c[l+12>>2]=l;c[l+8>>2]=l;break}b=c[b>>2]|0;i:do if((c[b+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(f|0)){b=a;break i}else{e=e<<1;b=a}}c[d>>2]=l;c[l+24>>2]=b;c[l+12>>2]=l;c[l+8>>2]=l;break g}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=l;c[v>>2]=l;c[l+8>>2]=w;c[l+12>>2]=b;c[l+24>>2]=0}while(0);w=m+8|0;k=x;return w|0}b=456;while(1){a=c[b>>2]|0;if(a>>>0<=j>>>0?(w=a+(c[b+4>>2]|0)|0,w>>>0>j>>>0):0)break;b=c[b+8>>2]|0}f=w+-47|0;a=f+8|0;a=f+((a&7|0)==0?0:0-a&7)|0;f=j+16|0;a=a>>>0<f>>>0?j:a;b=a+8|0;d=h+-40|0;u=g+8|0;u=(u&7|0)==0?0:0-u&7;v=g+u|0;u=d-u|0;c[8]=v;c[5]=u;c[v+4>>2]=u|1;c[g+d+4>>2]=40;c[9]=c[124];d=a+4|0;c[d>>2]=27;c[b>>2]=c[114];c[b+4>>2]=c[115];c[b+8>>2]=c[116];c[b+12>>2]=c[117];c[114]=g;c[115]=h;c[117]=0;c[116]=b;b=a+24|0;do{v=b;b=b+4|0;c[b>>2]=7}while((v+8|0)>>>0<w>>>0);if((a|0)!=(j|0)){g=a-j|0;c[d>>2]=c[d>>2]&-2;c[j+4>>2]=g|1;c[a>>2]=g;b=g>>>3;if(g>>>0<256){d=48+(b<<1<<2)|0;a=c[2]|0;b=1<<b;if(!(a&b)){c[2]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=j;c[b+12>>2]=j;c[j+8>>2]=b;c[j+12>>2]=d;break}b=g>>>8;if(b)if(g>>>0>16777215)e=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;e=(w+245760|0)>>>16&2;e=14-(u|v|e)+(w<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=312+(e<<2)|0;c[j+28>>2]=e;c[j+20>>2]=0;c[f>>2]=0;b=c[3]|0;a=1<<e;if(!(b&a)){c[3]=b|a;c[d>>2]=j;c[j+24>>2]=d;c[j+12>>2]=j;c[j+8>>2]=j;break}b=c[d>>2]|0;j:do if((c[b+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(g|0)){b=a;break j}else{e=e<<1;b=a}}c[d>>2]=j;c[j+24>>2]=b;c[j+12>>2]=j;c[j+8>>2]=j;break f}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=j;c[v>>2]=j;c[j+8>>2]=w;c[j+12>>2]=b;c[j+24>>2]=0}}else{w=c[6]|0;if((w|0)==0|g>>>0<w>>>0)c[6]=g;c[114]=g;c[115]=h;c[117]=0;c[11]=c[120];c[10]=-1;c[15]=48;c[14]=48;c[17]=56;c[16]=56;c[19]=64;c[18]=64;c[21]=72;c[20]=72;c[23]=80;c[22]=80;c[25]=88;c[24]=88;c[27]=96;c[26]=96;c[29]=104;c[28]=104;c[31]=112;c[30]=112;c[33]=120;c[32]=120;c[35]=128;c[34]=128;c[37]=136;c[36]=136;c[39]=144;c[38]=144;c[41]=152;c[40]=152;c[43]=160;c[42]=160;c[45]=168;c[44]=168;c[47]=176;c[46]=176;c[49]=184;c[48]=184;c[51]=192;c[50]=192;c[53]=200;c[52]=200;c[55]=208;c[54]=208;c[57]=216;c[56]=216;c[59]=224;c[58]=224;c[61]=232;c[60]=232;c[63]=240;c[62]=240;c[65]=248;c[64]=248;c[67]=256;c[66]=256;c[69]=264;c[68]=264;c[71]=272;c[70]=272;c[73]=280;c[72]=280;c[75]=288;c[74]=288;c[77]=296;c[76]=296;w=h+-40|0;u=g+8|0;u=(u&7|0)==0?0:0-u&7;v=g+u|0;u=w-u|0;c[8]=v;c[5]=u;c[v+4>>2]=u|1;c[g+w+4>>2]=40;c[9]=c[124]}while(0);b=c[5]|0;if(b>>>0>n>>>0){u=b-n|0;c[5]=u;w=c[8]|0;v=w+n|0;c[8]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;k=x;return w|0}}c[(ja()|0)>>2]=12;w=0;k=x;return w|0}function ia(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if(!a)return;d=a+-8|0;f=c[6]|0;a=c[a+-4>>2]|0;b=a&-8;j=d+b|0;do if(!(a&1)){e=c[d>>2]|0;if(!(a&3))return;h=d+(0-e)|0;g=e+b|0;if(h>>>0<f>>>0)return;if((c[7]|0)==(h|0)){a=j+4|0;b=c[a>>2]|0;if((b&3|0)!=3){i=h;b=g;break}c[4]=g;c[a>>2]=b&-2;c[h+4>>2]=g|1;c[h+g>>2]=g;return}d=e>>>3;if(e>>>0<256){a=c[h+8>>2]|0;b=c[h+12>>2]|0;if((b|0)==(a|0)){c[2]=c[2]&~(1<<d);i=h;b=g;break}else{c[a+12>>2]=b;c[b+8>>2]=a;i=h;b=g;break}}f=c[h+24>>2]|0;a=c[h+12>>2]|0;do if((a|0)==(h|0)){b=h+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){a=0;break}}else b=d;while(1){e=a+20|0;d=c[e>>2]|0;if(!d){e=a+16|0;d=c[e>>2]|0;if(!d)break;else{a=d;b=e}}else{a=d;b=e}}c[b>>2]=0}else{i=c[h+8>>2]|0;c[i+12>>2]=a;c[a+8>>2]=i}while(0);if(f){b=c[h+28>>2]|0;d=312+(b<<2)|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=a;if(!a){c[3]=c[3]&~(1<<b);i=h;b=g;break}}else{i=f+16|0;c[((c[i>>2]|0)==(h|0)?i:f+20|0)>>2]=a;if(!a){i=h;b=g;break}}c[a+24>>2]=f;b=h+16|0;d=c[b>>2]|0;if(d|0){c[a+16>>2]=d;c[d+24>>2]=a}b=c[b+4>>2]|0;if(b){c[a+20>>2]=b;c[b+24>>2]=a;i=h;b=g}else{i=h;b=g}}else{i=h;b=g}}else{i=d;h=d}while(0);if(h>>>0>=j>>>0)return;a=j+4|0;e=c[a>>2]|0;if(!(e&1))return;if(!(e&2)){if((c[8]|0)==(j|0)){j=(c[5]|0)+b|0;c[5]=j;c[8]=i;c[i+4>>2]=j|1;if((i|0)!=(c[7]|0))return;c[7]=0;c[4]=0;return}if((c[7]|0)==(j|0)){j=(c[4]|0)+b|0;c[4]=j;c[7]=h;c[i+4>>2]=j|1;c[h+j>>2]=j;return}f=(e&-8)+b|0;d=e>>>3;do if(e>>>0<256){b=c[j+8>>2]|0;a=c[j+12>>2]|0;if((a|0)==(b|0)){c[2]=c[2]&~(1<<d);break}else{c[b+12>>2]=a;c[a+8>>2]=b;break}}else{g=c[j+24>>2]|0;a=c[j+12>>2]|0;do if((a|0)==(j|0)){b=j+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){d=0;break}}else b=d;while(1){e=a+20|0;d=c[e>>2]|0;if(!d){e=a+16|0;d=c[e>>2]|0;if(!d)break;else{a=d;b=e}}else{a=d;b=e}}c[b>>2]=0;d=a}else{d=c[j+8>>2]|0;c[d+12>>2]=a;c[a+8>>2]=d;d=a}while(0);if(g|0){a=c[j+28>>2]|0;b=312+(a<<2)|0;if((c[b>>2]|0)==(j|0)){c[b>>2]=d;if(!d){c[3]=c[3]&~(1<<a);break}}else{e=g+16|0;c[((c[e>>2]|0)==(j|0)?e:g+20|0)>>2]=d;if(!d)break}c[d+24>>2]=g;a=j+16|0;b=c[a>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}a=c[a+4>>2]|0;if(a|0){c[d+20>>2]=a;c[a+24>>2]=d}}}while(0);c[i+4>>2]=f|1;c[h+f>>2]=f;if((i|0)==(c[7]|0)){c[4]=f;return}}else{c[a>>2]=e&-2;c[i+4>>2]=b|1;c[h+b>>2]=b;f=b}a=f>>>3;if(f>>>0<256){d=48+(a<<1<<2)|0;b=c[2]|0;a=1<<a;if(!(b&a)){c[2]=b|a;a=d;b=d+8|0}else{b=d+8|0;a=c[b>>2]|0}c[b>>2]=i;c[a+12>>2]=i;c[i+8>>2]=a;c[i+12>>2]=d;return}a=f>>>8;if(a)if(f>>>0>16777215)e=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;e=(j+245760|0)>>>16&2;e=14-(g|h|e)+(j<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}else e=0;a=312+(e<<2)|0;c[i+28>>2]=e;c[i+20>>2]=0;c[i+16>>2]=0;b=c[3]|0;d=1<<e;a:do if(!(b&d)){c[3]=b|d;c[a>>2]=i;c[i+24>>2]=a;c[i+12>>2]=i;c[i+8>>2]=i}else{a=c[a>>2]|0;b:do if((c[a+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b)break;if((c[b+4>>2]&-8|0)==(f|0)){a=b;break b}else{e=e<<1;a=b}}c[d>>2]=i;c[i+24>>2]=a;c[i+12>>2]=i;c[i+8>>2]=i;break a}while(0);h=a+8|0;j=c[h>>2]|0;c[j+12>>2]=i;c[h>>2]=i;c[i+8>>2]=j;c[i+12>>2]=a;c[i+24>>2]=0}while(0);j=(c[10]|0)+-1|0;c[10]=j;if(j|0)return;a=464;while(1){a=c[a>>2]|0;if(!a)break;else a=a+8|0}c[10]=-1;return}function ja(){return 504}function ka(){}function la(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)>=8192)return W(b|0,d|0,e|0)|0;h=b|0;g=b+e|0;if((b&3)==(d&3)){while(b&3){if(!e)return h|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}e=g&-4|0;f=e-64|0;while((b|0)<=(f|0)){c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];c[b+16>>2]=c[d+16>>2];c[b+20>>2]=c[d+20>>2];c[b+24>>2]=c[d+24>>2];c[b+28>>2]=c[d+28>>2];c[b+32>>2]=c[d+32>>2];c[b+36>>2]=c[d+36>>2];c[b+40>>2]=c[d+40>>2];c[b+44>>2]=c[d+44>>2];c[b+48>>2]=c[d+48>>2];c[b+52>>2]=c[d+52>>2];c[b+56>>2]=c[d+56>>2];c[b+60>>2]=c[d+60>>2];b=b+64|0;d=d+64|0}while((b|0)<(e|0)){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0}}else{e=g-4|0;while((b|0)<(e|0)){a[b>>0]=a[d>>0]|0;a[b+1>>0]=a[d+1>>0]|0;a[b+2>>0]=a[d+2>>0]|0;a[b+3>>0]=a[d+3>>0]|0;b=b+4|0;d=d+4|0}}while((b|0)<(g|0)){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0}return h|0}function ma(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=b+e|0;d=d&255;if((e|0)>=67){while(b&3){a[b>>0]=d;b=b+1|0}f=h&-4|0;g=f-64|0;i=d|d<<8|d<<16|d<<24;while((b|0)<=(g|0)){c[b>>2]=i;c[b+4>>2]=i;c[b+8>>2]=i;c[b+12>>2]=i;c[b+16>>2]=i;c[b+20>>2]=i;c[b+24>>2]=i;c[b+28>>2]=i;c[b+32>>2]=i;c[b+36>>2]=i;c[b+40>>2]=i;c[b+44>>2]=i;c[b+48>>2]=i;c[b+52>>2]=i;c[b+56>>2]=i;c[b+60>>2]=i;b=b+64|0}while((b|0)<(f|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}return h-e|0}function na(a){a=a|0;var b=0,d=0;d=c[i>>2]|0;b=d+a|0;if((a|0)>0&(b|0)<(d|0)|(b|0)<0){U()|0;V(12);return -1}c[i>>2]=b;if((b|0)>(T()|0)?(S()|0)==0:0){c[i>>2]=d;V(12);return -1}return d|0}

// EMSCRIPTEN_END_FUNCS
return{___errno_location:ja,_factorial:ea,_free:ia,_get_prime_count:da,_malloc:ha,_memcpy:la,_memset:ma,_multiply:fa,_sbrk:na,_sum:ga,establishStackSpace:$,getTempRet0:ca,runPostSets:ka,setTempRet0:ba,setThrew:aa,stackAlloc:Y,stackRestore:_,stackSave:Z}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _factorial=Module["_factorial"]=asm["_factorial"];var _free=Module["_free"]=asm["_free"];var _get_prime_count=Module["_get_prime_count"]=asm["_get_prime_count"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memset=Module["_memset"]=asm["_memset"];var _multiply=Module["_multiply"]=asm["_multiply"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var _sum=Module["_sum"]=asm["_sum"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var getTempRet0=Module["getTempRet0"]=asm["getTempRet0"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var setTempRet0=Module["setTempRet0"]=asm["setTempRet0"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];Module["asm"]=asm;if(memoryInitializer){if(!isDataURI(memoryInitializer)){memoryInitializer=locateFile(memoryInitializer)}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")});function doBrowserLoad(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,(function(){throw"could not load memory initializer "+memoryInitializer}))}if(Module["memoryInitializerRequest"]){function useRequest(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}applyMemoryInitializer(response)}if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run()




