import { Outlet, Link } from "react-router-dom";
import { logout } from "./auth";


export default function App() {
return (
<div className="app-shell">
<header>
<h2 style={{margin:0}}>✅ Todo</h2>
<nav style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
<Link to="/">Home</Link>
<button onClick={() => { logout(); location.href = "/login"; }}>Logout</button>
</nav>
</header>
<main style={{marginTop:16}}>
<Outlet />
</main>
</div>
);
}