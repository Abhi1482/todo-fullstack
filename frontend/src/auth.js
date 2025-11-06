import api from "./api";


export async function register(username, password) {
return api.post("/auth/register/", { username, password });
}
export async function login(username, password) {
    // 1. Get Tokens
    const { data } = await api.post("/auth/token/", { username, password });

    // Save tokens immediately so they can be used for the next API call
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // 2. Fetch User Data (Requires the token to be set for the 'api' instance)
    try {
        // Assuming your API client is set up to automatically use the 'access' token
        // from localStorage for subsequent calls.
        const { data: userData } = await api.get("/user/me/"); 
        
        // 3. Store the Username
        if (userData.username) {
            localStorage.setItem("username", userData.username);
        }
    } catch (error) {
        // If this fails, the user is logged in, but the name isn't displayed.
        console.error("Failed to fetch user data after login:", error);
    }

    return data;
}


export function logout(){
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // 🔑 You must clear the username as well!
    localStorage.removeItem("username"); 
}


export function getUsername() {
    return localStorage.getItem("username");
}