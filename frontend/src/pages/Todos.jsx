import { useEffect, useState } from "react";
import { listTodos, createTodo, updateTodo, deleteTodo, quickAdd, suggest } from "../todosApi";
import dayjs from "dayjs";
import KanbanBoard from "../components/KanbanBoard";


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



async function onQuickAdd(e) {
  e.preventDefault();
  const raw = (text || "").trim();
  if (!raw) return;

  try {
    const resp = await quickAdd(raw); // expects { data: { ... } } or the created object
    const created = resp?.data ?? resp; // handle both axios and fetch shapes

    // normalize id into `id` field
    const normalizeId = (t) => {
      if (!t) return t;
      if (!t.id) {
        if (t._id && typeof t._id === "object" && t._id.$oid) t.id = String(t._id.$oid);
        else if (t._id) t.id = String(t._id);
      }
      return t;
    };
    const todo = normalizeId({ ...created });

    // Clear UI
    setText("");
    setHint(null);

    // optimistic event: include created todo so Kanban can insert immediately
    window.dispatchEvent(new CustomEvent("todosChanged", { detail: { created: todo } }));

    // also send a generic event to force listeners that don't handle detail to reload
    window.dispatchEvent(new Event("todosChanged"));

  } catch (err) {
    console.error("Quick add failed", err);
    // optionally show UI error
  }
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
  <div style={{ display: "flex",flexDirection:"column",alignItems:"center", gap: 20 }}>
    <form onSubmit={onQuickAdd} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input
        style={{ flex: 1, marginLeft: "2%", padding: "8px 10px", borderRadius: 6 ,width:"50vw"}}
        placeholder="e.g. Buy milk tomorrow 6pm #groceries"
        value={text}
        onChange={(e) => onSuggest(e.target.value)}
      />
      <button style={{ padding: "8px 12px", borderRadius: 6 }}>Add</button>
    </form>

    {hint && (
      <p style={{ fontSize: 12 }}>
        Due: {hint.suggested_due ? dayjs(hint.suggested_due).format("DD MMM, HH:mm") : "—"} · Tags: {hint.suggested_tags?.join(", ") || "—"}{" "}
        {hint.rrule ? `· Repeat: ${hint.rrule}` : ""}
      </p>
    )}

    {/* Kanban board */}
    <div >
      <KanbanBoard />
    </div>
  </div>
);


}