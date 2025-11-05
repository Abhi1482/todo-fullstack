import api from "./api";


export async function register(username, password) {
return api.post("/auth/register/", { username, password });
}


export async function login(username, password) {
const { data } = await api.post("/auth/token/", { username, password });
localStorage.setItem("access", data.access);
localStorage.setItem("refresh", data.refresh);
return data;
}


export function logout(){
localStorage.removeItem("access");
localStorage.removeItem("refresh");
}