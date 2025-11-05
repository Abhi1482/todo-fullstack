import { useState } from "react";
import { register } from "../auth";


export default function Register(){
const [username, setU] = useState("");
const [password, setP] = useState("");
const [msg, setMsg] = useState("");


async function onSubmit(e){
e.preventDefault();
try{
const res = await register(username, password);
if(res.status === 201){ setMsg('Registered! Please login.'); }
}catch(e){ setMsg('Registration failed'); }
}


return (
<form onSubmit={onSubmit} style={{maxWidth:420}}>
<h3>Register</h3>
{msg && <p>{msg}</p>}
<div style={{display:'flex',flexDirection:'column',gap:8}}>
<input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
<button type="submit">Register</button>
</div>
</form>
);
}