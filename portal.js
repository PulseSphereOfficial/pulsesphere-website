const $ = id => document.getElementById(id)
const worlds = [
 ['Science','العلوم','⚗'],['Mysteries','القصص والألغاز','✧'],['Games','الألعاب','♧'],
 ['Football','كرة القدم','⚽'],['Comedy','الكوميديا','☻'],['Series','المسلسلات','▣'],['Films','الأفلام','◉']
]
const stories = [
 [6,'Journey into the Unknown','رحلة إلى المجهول','A lone astronaut receives a transmission from a planet that vanished centuries ago.','يتلقى رائد فضاء إشارة من كوكب اختفى قبل قرون.'],
 [4,'Neighbors in Trouble','جيران في ورطة','One misplaced invitation turns a quiet afternoon into a neighborhood comedy.','دعوة تصل إلى العنوان الخطأ فتحوّل مساءً هادئًا إلى مغامرة كوميدية.'],
 [3,'Football Challenges','تحديات كرة القدم','Three friends have one afternoon to put together a team for the final.','أمام ثلاثة أصدقاء مساء واحد لتكوين فريق يخوض المباراة النهائية.'],
 [5,'Kingdoms of the East','ممالك الشرق','An unexpected message reaches a desert kingdom on the eve of a royal succession.','رسالة غامضة تصل إلى مملكة صحراوية عشية اختيار وريث العرش.'],
 [0,'Secrets of AI','أسرار الذكاء الاصطناعي','Meet a small robot learning to recognize the world through sound and light.','تعرف على روبوت صغير يتعلم اكتشاف العالم من خلال الضوء والصوت.'],
 [1,'The Castle Mystery','لغز القلعة','A lantern lights up in an abandoned castle. Who has returned after midnight?','يضيء فانوس داخل قلعة مهجورة. من عاد إليها بعد منتصف الليل؟'],
 [2,'The Arcade Door','بوابة الألعاب','Beyond a glowing arcade cabinet lies a puzzle with seven hidden doors.','خلف آلة ألعاب مضيئة يختبئ لغز له سبعة أبواب.']
]
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
let ar=read('ps-portal-language','en')==='ar', category=-1, onlySaved=false, selected=0
let saved=read('ps-portal-favorites',[])
if(!Array.isArray(saved))saved=[]
const tr=(en,arabic)=>ar?arabic:en
function button(label,fn,cls=''){const b=document.createElement('button');b.className=cls;b.textContent=label;b.onclick=fn;return b}
function picture(path){const img=document.createElement('img');img.alt='';img.src='art/'+path+'.webp';return img}
function choose(id){category=id;onlySaved=false;$('search').value='';render()}
function art(i){return i===6?'world2':'story'+i}
function detail(i){
 selected=i;const s=stories[i];$('detailArt').src='art/'+art(i)+'.webp';$('detailTitle').textContent=tr(s[1],s[2]);$('detailText').textContent=tr(s[3],s[4]);$('save').textContent=saved.includes(i)?tr('Remove from favorites','أزل من المفضلة'):tr('♡ Save to favorites','♡ أضف إلى المفضلة');document.querySelector('dialog').showModal()
}
function render(){
 document.documentElement.lang=ar?'ar':'en'
 for(const node of document.querySelectorAll('[data-en]'))node.textContent=ar?node.dataset.ar:node.dataset.en
 for(const node of document.querySelectorAll('.side,.catalog,.right,dialog,input'))node.dir=ar?'rtl':'ltr'
 $('language').textContent=tr('العربية','English')
 $('search').placeholder=tr('Search stories…','ابحث عن محتوى…');$('search').setAttribute('aria-label',$('search').placeholder)
 const nav=$('nav'),rail=$('worlds');nav.replaceChildren();rail.replaceChildren()
 function navItem(icon,label,id){const b=button(label,()=>choose(id),category===id&&!onlySaved?'on':'');const symbol=document.createElement('b');symbol.textContent=icon;b.prepend(symbol);nav.append(b)}
 navItem('⌂',tr('Home','الرئيسية'),-1)
 for(let i=6;i>=0;i--)navItem(worlds[i][2],tr(...worlds[i]),i)
 worlds.forEach((w,i)=>{const b=button('',()=>choose(i),'world'+(i===category?' active':''));const label=document.createElement('span');label.textContent=tr(...w);b.append(picture('world'+i),label);rail.append(b)})
 $('featured').replaceChildren()
 for(const i of [6,3,4]){const b=button(tr(...worlds[i]),()=>choose(i),'feature');b.prepend(picture('world'+i));$('featured').append(b)}
 const query=$('search').value.trim().toLowerCase()
 $('heading').textContent='✦ '+(onlySaved?tr('Favorites','المفضلة'):query?tr('Search results','نتائج البحث'):category<0?tr('Recommended for you','موصى به لك'):tr(...worlds[category]))
 const cards=$('cards');cards.replaceChildren()
 stories.forEach((s,i)=>{if((onlySaved&&!saved.includes(i))||(category>=0&&s[0]!==category)||(query&&!s.slice(1).concat(worlds[s[0]].slice(0,2)).join(' ').toLowerCase().includes(query))||(!query&&!onlySaved&&category<0&&i===6))return
 const b=button('',()=>detail(i),'story');const name=document.createElement('strong'),genre=document.createElement('small');name.textContent=tr(s[1],s[2]);genre.textContent=tr(...worlds[s[0]]);b.append(picture(art(i)),name,genre);cards.append(b)})
 $('empty').hidden=!!cards.children.length;$('empty').textContent=onlySaved?tr('Open a story and save it here.','افتح بطاقة وأضفها إلى المفضلة.'):tr('No matching stories.','لم نجد محتوى مطابقًا.')
}
$('language').onclick=()=>{ar=!ar;write('ps-portal-language',ar?'ar':'en');render()}
$('favorites').onclick=()=>{category=-1;onlySaved=true;$('search').value='';render();$('heading').scrollIntoView({block:'center'})}
$('search').oninput=()=>{category=-1;onlySaved=false;render()}
$('guide').onclick=()=>{$('search').focus();$('search').scrollIntoView({block:'center'})}
$('save').onclick=()=>{const next=saved.includes(selected)?saved.filter(i=>i!==selected):[...saved,selected];if(!write('ps-portal-favorites',next)){$('detailText').textContent=tr('Your browser could not save this favorite.','تعذر حفظ المفضلة في هذا المتصفح.');return}saved=next;document.querySelector('dialog').close();render()}
render()
