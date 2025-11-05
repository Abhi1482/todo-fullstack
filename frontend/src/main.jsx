import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Todos from "./pages/Todos";
import "./index.css";


function RequireAuth({ children }) {
const token = localStorage.getItem("access");
return token ? children : <Navigate to="/login" replace />;
}


ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
<BrowserRouter>
<Routes>
<Route path="/" element={<App />}>
<Route index element={<RequireAuth><Todos /></RequireAuth>} />
<Route path="login" element={<Login />} />
<Route path="register" element={<Register />} />
</Route>
</Routes>
</BrowserRouter>
</React.StrictMode>
);