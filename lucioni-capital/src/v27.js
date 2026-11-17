
/* ===================== V27: paleta de gráficos más sobria ===================== */
{const muted=()=>{const dark=(()=>{const dt=document.documentElement.dataset.theme;return dt==='dark'||(!dt&&matchMedia('(prefers-color-scheme: dark)').matches);})();
  COLORS.splice(0,COLORS.length,...(dark?['#E9785E','#8CC7B0','#D9BC7C','#8FA9D6','#C4A1CF','#A9C98E','#D9A07A','#7FB9B9']:['#B8321C','#2F6F57','#8C6D24','#3E6690','#7A5A8C','#9A5E2A','#3F8080','#5E6B3F']));};
 /* el cargador de tema reescribe la paleta: se aplica la versión sobria justo después */
 const _rt27=readTheme;readTheme=function(){_rt27();muted();};
 muted();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(muted,30));}
