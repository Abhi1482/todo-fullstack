import { useEffect, useState } from "react";
import { listTodos, createTodo, updateTodo, deleteTodo, quickAdd, suggest } from "../todosApi";
import dayjs from "dayjs";


export default function Todos(){
const [items, setItems] = useState([]);
const [text, setText] = useState("");
const [hint, setHint] = useState(null);


async function refresh(){
try{
const { data } = await listTodos();
setItems(data);
}catch(e){ console.error(e); }
}


useEffect(()=>{ refresh(); },[]);


async function onQuickAdd(e){
e.preventDefault();
if(!text.trim()) return;
try{
const { data } = await quickAdd(text);
setText(""); setHint(null);
setItems(prev=>[data, ...prev]);
}catch(e){ console.error(e); }
}


async function onSuggest(v){
setText(v);
if(!v.trim()) { setHint(null); return; }
try{
const { data } = await suggest(v);
setHint(data);
}catch(e){ console.error(e); }
}


return (
<div>
<form onSubmit={onQuickAdd} style={{display:"flex", gap:8}}>
<input style={{flex:1}} placeholder="e.g. Buy milk tomorrow 6pm #groceries" value={text} onChange={e=>onSuggest(e.target.value)} />
<button>Add</button>
</form>


{hint && (
<p style={{fontSize:12}}>Due: {hint.suggested_due ? dayjs(hint.suggested_due).format("DD MMM, HH:mm") : "—"} · Tags: {hint.suggested_tags?.join(", ") || "—"} {hint.rrule?`· Repeat: ${hint.rrule}`:""}</p>
)}


<ul style={{listStyle:'none',padding:0,marginTop:12}}>
{items.map(t => (
<li key={t.id || t._id?.$oid} style={{display:"flex", gap:8, alignItems:"center", padding:'8px 0', borderBottom:'1px solid #eee'}}>
<input type="checkbox" checked={t.is_completed} onChange={async()=>{
try{ const { data } = await updateTodo(t.id || t._id?.$oid, { is_completed: !t.is_completed });
setItems(prev => prev.map(x => ((x.id||x._id?.$oid) === (t.id||t._id?.$oid) ? data : x)));
}catch(e){console.error(e)}
}}/>
<div style={{flex:1}}>
<div><b>{t.title}</b> {t.tags?.length ? ` #${t.tags.join(" #")}` : ""}</div>
<div style={{fontSize:12, opacity:.7}}>
{t.due ? `Due ${dayjs(t.due).format("DD MMM, HH:mm")}` : "No due"}
{t.recurrence?.rrule ? ` · Repeats (${t.recurrence.rrule})` : ""}
</div>
</div>
<button onClick={async()=>{ try{ await deleteTodo(t.id || t._id?.$oid); setItems(prev => prev.filter(x => (x.id||x._id?.$oid) !== (t.id||t._id?.$oid))); }catch(e){console.error(e)} }}>Delete</button>
</li>
))}
</ul>
</div>
);
}