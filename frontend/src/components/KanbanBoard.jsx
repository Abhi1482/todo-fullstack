// frontend/src/components/KanbanBoard.jsx
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { listTodos, updateTodo, deleteTodo } from "../todosApi"; // now uses deleteTodo

const COLUMNS = [
  { id: "new", title: "New task", width: 320, bg: "#F6F8FA" },
  { id: "scheduled", title: "Scheduled", width: 320, bg: "#FAF7F2" },
  { id: "in_progress", title: "In progress", width: 320, bg: "#FFF6F6" },
  { id: "completed", title: "Completed", width: 320, bg: "#EFFAF1" },
];

function pickColumn(todo) {
  if (todo.status) return todo.status;
  if (todo.is_completed) return "completed";
  const now = dayjs();
  if (todo.due) {
    const due = dayjs(todo.due);
    if (due.isBefore(now) || due.isSame(now, "minute")) return "in_progress";
    if (due.diff(now, "day") >= 1) return "scheduled";
  }
  return "new";
}

function Card({ todo, index, onToggle, onDelete }) {
  const id = todo.id || (todo._id && (todo._id.$oid || todo._id));
  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            background: "#fff",
            boxShadow: snapshot.isDragging ? "0 8px 20px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
            ...provided.draggableProps.style,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{todo.title}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {todo.tags?.slice(0, 3).map((t) => (
                  <span key={t} style={{ marginRight: 6, padding: "3px 8px", background: "#F1F5F9", borderRadius: 8, fontSize: 11 }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                {todo.due ? `Due ${dayjs(todo.due).format("DD MMM, HH:mm")}` : "No due"}
                {todo.recurrence?.rrule ? ` · Repeats (${todo.recurrence.rrule})` : ""}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <button
                onClick={() => onToggle(todo)}
                style={{ cursor: "pointer", border: "none", background: "transparent", fontSize: 18 }}
                title="Toggle complete"
              >
                {todo.is_completed ? "✅" : "⭕"}
              </button>

              <button
                onClick={() => onDelete(todo)}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "6px 8px",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                title="Delete task"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard() {
  const [cols, setCols] = useState({ new: [], scheduled: [], in_progress: [], completed: [] });
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // initial load
  load();

  const handler = (e) => {
    try {
      const d = e?.detail;
      // possible shapes:
      // 1) { created: { ... } }
      // 2) created object directly
      // 3) { deletedId: '...' } or { id: '...' }
      // 4) undefined (just a signal to reload)

      // helper normalize
      const normalize = (t) => {
        if (!t) return null;
        if (!t.id) {
          if (t._id && typeof t._id === "object" && t._id.$oid) t.id = String(t._id.$oid);
          else if (t._id) t.id = String(t._id);
        }
        return t;
      };

      if (d) {
        // if wrapper { created: {...} }
        if (d.created) {
          const todo = normalize({ ...d.created });
          if (todo && todo.id) {
            const col = pickColumn(todo);
            setCols(prev => {
              // remove duplicates then add on top
              const newMap = { ...prev };
              Object.keys(newMap).forEach(k => {
                newMap[k] = newMap[k].filter(x => (x.id || (x._id && (x._id.$oid || x._id))) !== todo.id);
              });
              newMap[col] = [todo, ...newMap[col]];
              return newMap;
            });
            return;
          }
        }

        // if detail is already an object representing created todo
        if (typeof d === "object" && (d.id || d._id)) {
          const todo = normalize({ ...d });
          if (todo && todo.id) {
            const col = pickColumn(todo);
            setCols(prev => {
              const newMap = { ...prev };
              Object.keys(newMap).forEach(k => {
                newMap[k] = newMap[k].filter(x => (x.id || (x._id && (x._id.$oid || x._id))) !== todo.id);
              });
              newMap[col] = [todo, ...newMap[col]];
              return newMap;
            });
            return;
          }
        }

        // if deletion info: { deletedId: '...' } or { id: '...' }
        if (d.deletedId || d.id) {
          const delId = d.deletedId || d.id;
          setCols(prev => {
            const map = { ...prev };
            Object.keys(map).forEach(k => {
              map[k] = map[k].filter(t => (t.id || (t._id && (t._id.$oid || t._id))) !== delId);
            });
            return map;
          });
          return;
        }
      }

      // fallback: reload everything
      load();

    } catch (err) {
      console.error("todosChanged handler error", err);
      load();
    }
  };

  window.addEventListener("todosChanged", handler);
  return () => window.removeEventListener("todosChanged", handler);
}, []);



  async function load() {
    setLoading(true);
    try {
      const { data } = await listTodos();
      const map = { new: [], scheduled: [], in_progress: [], completed: [] };
      data.forEach((item) => {
        item.id = item.id || (item._id && (item._id.$oid || item._id));
        const c = pickColumn(item);
        map[c].push(item);
      });
      setCols(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onDragEnd(result) {
  if (!result.destination) return;
  const { source, destination, draggableId } = result;
  const src = source.droppableId;
  const dst = destination.droppableId;

  if (src === dst) {
    // same-column reorder (no backend change required)
    const list = Array.from(cols[src]);
    const [m] = list.splice(source.index, 1);
    list.splice(destination.index, 0, m);
    setCols(prev => ({ ...prev, [src]: list }));
    return;
  }

  // optimistic move locally:
  const srcList = Array.from(cols[src]);
  const [moved] = srcList.splice(source.index, 1);
  const dstList = Array.from(cols[dst]);
  dstList.splice(destination.index, 0, moved);
  setCols(prev => ({ ...prev, [src]: srcList, [dst]: dstList }));

  // persist status on backend
  try {
    // set status string exactly matching backend choices
    await updateTodo(draggableId, { status: dst });
  } catch (err) {
    console.error("Failed to save status on backend", err);
    // revert by reloading from backend
    load();
  }
}


  async function toggleComplete(todo) {
    const id = todo.id || (todo._id && (todo._id.$oid || todo._id));
    try {
      await updateTodo(id, { is_completed: !todo.is_completed });
      // optimistic UI: update locally to avoid refetch, then sync
      setCols((prev) => {
        const from = pickColumn(todo);
        const updated = { ...todo, is_completed: !todo.is_completed };
        const newMap = { ...prev };
        // remove from its previous column
        newMap[from] = newMap[from].filter((t) => (t.id || (t._id && (t._id.$oid || t._id))) !== id);
        // add to appropriate new column at top
        const to = pickColumn(updated);
        newMap[to] = [updated, ...newMap[to]];
        return newMap;
      });
    } catch (e) {
      console.error(e);
      load();
    }
  }

  async function handleDelete(todo) {
    const id = todo.id || (todo._id && (todo._id.$oid || todo._id));
    // optimistic remove
    setCols((prev) => {
      const map = { ...prev };
      Object.keys(map).forEach((k) => {
        map[k] = map[k].filter((t) => (t.id || (t._id && (t._id.$oid || t._id))) !== id);
      });
      return map;
    });
    try {
      await deleteTodo(id);
      window.dispatchEvent(new Event("todosChanged"));
    } catch (err) {
      console.error("Delete failed; reloading", err);
      load();
    }
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", width: "100%", boxSizing: "border-box" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {COLUMNS.map((col) => (
          <div key={col.id} style={{ width: col.width, minWidth: 260 }}>
            <div style={{ padding: 12, background: "#0f172a", color: "#fff", borderRadius: 10, marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{col.title}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{cols[col.id]?.length || 0}</div>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: 200,
                    padding: 12,
                    borderRadius: 10,
                    background: col.bg,
                    transition: "background .15s ease",
                    boxShadow: snapshot.isDraggingOver ? "0 6px 18px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {cols[col.id]?.map((t, i) => (
                    <Card key={(t.id || (t._id && (t._id.$oid || t._id)) || i)} todo={t} index={i} onToggle={toggleComplete} onDelete={handleDelete} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
