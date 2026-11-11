import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'
import {collection,doc,getFirestore,limit,onSnapshot,orderBy,query,serverTimestamp,setDoc} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
import {firebaseConfig} from './community-config.js'

const app=initializeApp(firebaseConfig)
const auth=getAuth(app)
const posts=collection(getFirestore(app),'communityPosts')
const get=id=>document.getElementById(id)
const say=(en,ar)=>document.documentElement.lang==='ar'?ar:en
function element(tag,text){
  const node=document.createElement(tag)
  node.textContent=text
  return node
}
function failed(status){
  status.textContent=say('Could not connect to the community. Check your connection and try again.','تعذّر الاتصال بالمجتمع. تحقق من الاتصال وأعد المحاولة.')
}
function button(label){
  const node=element('button',label)
  node.type='button'
  node.className='pill'
  return node
}
const publish=get('publishPublic')
const feed=get('communityFeed')
onAuthStateChanged(auth,user=>{
  if(publish){publish.disabled=!user;get('publishLogin').hidden=!!user}
  const entry=document.querySelector('.side > .pill')
  if(entry){
    entry.href=user?'account.html':'login.html'
    entry.dataset.ar=user?'حسابي':'تسجيل الدخول'
    entry.dataset.en=user?'My account':'Sign in'
    entry.textContent=say(entry.dataset.en,entry.dataset.ar)
  }
})
if(publish){
  const form=get('form')
  publish.onclick=async()=>{
    const user=auth.currentUser
    if(!user||!form.reportValidity())return
    const title=get('title').value.trim(),body=get('description').value.trim(),link=get('link').value.trim()
    if(!title||!body||link.length>2048||(link&&!/^https:\/\//i.test(link))){get('message').textContent='تحقق من العنوان والوصف والرابط.';return}
    publish.disabled=true
    get('message').textContent='جارٍ النشر…'
    try{
      await setDoc(doc(posts),{author:user.uid,title,body,category:get('category').value,link,createdAt:serverTimestamp()})
      form.reset()
      const a=element('a','عرض المنشور في المجتمع')
      a.href='index.html#community'
      get('message').replaceChildren(a)
    }catch{failed(get('message'))}
    finally{publish.disabled=!auth.currentUser}
  }
}
let stopComments
function openComments(post){
  const dialog=get('communityDialog'),list=get('replies'),form=get('replyForm'),status=get('replyStatus')
  const comments=collection(post.ref,'comments')
  get('threadTitle').textContent=post.data().title
  list.replaceChildren()
  form.reset()
  status.textContent=''
  const toggle=onAuthStateChanged(auth,user=>{
    form.hidden=!user
    get('replyLogin').hidden=!!user
  })
  const unsubscribe=onSnapshot(query(comments,orderBy('createdAt','desc'),limit(50)),rows=>{
    list.replaceChildren(...rows.docs.slice().reverse().map(row=>element('p',row.data().body)))
  },()=>failed(status))
  stopComments=()=>{unsubscribe();toggle()}
  const submit=form.querySelector('button')
  submit.disabled=false
  form.onsubmit=async event=>{
    event.preventDefault()
    const user=auth.currentUser,body=get('reply').value.trim()
    if(!user||!body||submit.disabled)return
    submit.disabled=true
    try{await setDoc(doc(comments),{author:user.uid,body,createdAt:serverTimestamp()});form.reset()}
    catch{failed(status)}
    finally{submit.disabled=false}
  }
  dialog.showModal()
}
if(feed){
  get('communityDialog').addEventListener('close',()=>stopComments?.())
  onSnapshot(query(posts,orderBy('createdAt','desc'),limit(30)),rows=>{
    get('feedStatus').textContent=rows.empty?say('Be the first to publish.','كن أول من ينشر.'): ''
    feed.replaceChildren(...rows.docs.map(post=>{
      const data=post.data(),article=element('article','')
      article.append(element('h3',data.title),element('p',data.body))
      if(data.link&&/^https:\/\//i.test(data.link)){
        const a=element('a',say('Open preview','فتح المعاينة'))
        a.href=data.link;a.target='_blank';a.rel='ugc noopener noreferrer'
        article.append(a,element('p',''))
      }
      const view=button(say('Comments','التعليقات'))
      view.onclick=()=>openComments(post)
      article.append(view)
      return article
    }))
  },()=>failed(get('feedStatus')))
}
