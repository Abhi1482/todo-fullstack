import { Outlet, Link } from "react-router-dom";
import { logout ,getUsername} from "./auth";
import { useState, useEffect } from "react";


export default function App() {
    const [username, setUsername] = useState(''); 

    // Load the username logic...
    useEffect(() => {
        const storedUsername = getUsername(); 
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);
    
    // Define header styles for clarity
    const headerStyle = {
        display: "flex",          // 1. Make the header a flex container
        alignItems: "center",     // Vertically align items
        padding: "10px 20px",     // Optional: Add padding
        borderBottom: "1px solid #ccc", // Optional divider
    };
    
    // Define the central container style
    const welcomeContainerStyle = {
        flexGrow: 1,             // 2. Allow this container to take up all available space
        display: "flex",         // Make this container a flex container too
        justifyContent: "center",// 3. Center the welcome message horizontally
        alignItems: "center",
        // We need some margin to visually separate it from 'My Tasks' if they are close
        marginLeft: '20px', 
    };

    return (
        <div className="app-shell" style={{ width: "100%" }}>
            {/* 1. Apply flex to the header */}
            <header style={headerStyle}>
                
                {/* Section 1: Title (Stays on the left) */}
                <h2 style={{margin:0}}>My Tasks</h2>
                
                {/* Section 2: Welcome Message (Grows to the center) */}
                <div style={welcomeContainerStyle}>
                    {/* The h2 itself will be centered by the parent div's justify-content: center */}
                    <h2 style={{margin:0}}>Welcome {username}!</h2>
                </div>
                
                {/* Section 3: Logout Button (Pushed to the far right) */}
                <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => { logout(); location.href = "/login"; }}>Logout</button>
                </nav>
            </header>
            <main style={{marginTop:16,display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center',alignContent:'center'}}>
                <Outlet />
            </main>
        </div>
    );
}