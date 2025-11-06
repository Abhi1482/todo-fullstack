import api from "./api";


export const listTodos = () => api.get("/todos/");
export const createTodo = (payload) => api.post("/todos/", payload);
export const updateTodo = (id, payload) => api.patch(`/todos/${id}/`, payload);
export const deleteTodo = (id) => api.delete(`/todos/${id}/`);
export const quickAdd = (text) => api.post(`/todos/quick-add/`, { text });
export const suggest = (text) => api.post(`/todos/suggest/`, { text });
export const skipOccurrence = (id, datetime) => api.post(`/todos/${id}/skip-occurrence/`, { datetime });
