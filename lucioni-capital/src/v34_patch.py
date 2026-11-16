h=open('part1v3.html').read()
css=open('v34.css').read()
m='/* ===== V34 ===== */'
if m in h:
    a=h.index(m);b=h.index('</style>',a);h=h[:a]+css+h[b:]
else:
    h=h.replace('</style>',css+'</style>')
open('part1v3.html','w').write(h)
s=open('part3.js').read()
k=s.index('\n/* ===================== V16:');s=s[:k]+''.join(open(f).read() for f in ['v16.js','v17.js','v18.js','v19.js','v20.js','v21.js','v22.js','v23.js','v24.js','v25.js','v26.js','v27.js','v28.js','v29.js','v30.js','v31.js','v32.js','v33.js','v34.js'])
open('part3.js','w').write(s)
print('ok')
