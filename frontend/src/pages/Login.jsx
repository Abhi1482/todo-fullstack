import { useState } from "react";
import { login } from "../auth";


export default function Login(){
const [username, setU] = useState("");
const [password, setP] = useState("");
const [err, setErr] = useState("");


async function onSubmit(e){
e.preventDefault();
try{
await login(username, password);
location.href = "/";
}catch(err){
setErr("Login failed: check credentials");
}
}


return (
<form onSubmit={onSubmit} style={{maxWidth:420}}>
<h3>Login</h3>
{err && <p style={{color:'red'}}>{err}</p>}
<div style={{display:'flex',flexDirection:'column',gap:8}}>
<input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
<div style={{display:'flex',gap:8}}>
<button type="submit">Login</button>
<a href="/register" style={{alignSelf:'center'}}>Register</a>
</div>
</div>
</form>
);
}