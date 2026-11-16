/* web: React/Remotion (video y animaciones del intro) se cargan después del primer pintado, o al pedir el video */
(function(){var P=null;window.LCMedia=function(){return P||(P=new Promise(function(ok,ko){var s=document.createElement('script');s.src='/media.js?v=__V__';s.async=true;s.onload=function(){try{if(typeof loopsMount==='function')loopsMount();}catch(e){}ok();};s.onerror=function(){P=null;ko();};document.head.appendChild(s);}));};
 /* mientras carga, LCVideo es un sustituto que recuerda si pidieron reproducir */
 if(!window.LCVideo)window.LCVideo={__stub:1,play:function(){window.__lcPlay=1;},pause:function(){},seek:function(){},mount:function(){}};
 if(typeof mountVideo==='function'){var _mv=mountVideo;mountVideo=function(){if(window.LCVideo.__stub){var a=arguments;window.LCMedia().then(function(){_mv.apply(null,a);if(window.__lcPlay&&!window.LCVideo.__stub){window.__lcPlay=0;setTimeout(function(){LCVideo.play();},60);}});return;}return _mv.apply(null,arguments);};}
 var go=function(){(window.requestIdleCallback||function(f){setTimeout(f,1200);})(function(){window.LCMedia().catch(function(){});},{timeout:3500});};
 if(document.readyState==='complete')go();else addEventListener('load',go);})();
