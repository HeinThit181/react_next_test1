import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
    const initialUser = JSON.parse(localStorage.getItem("session")) ?? {
        isLoggedIn: false, name: '', email: ''
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const [user, setUser] = useState(initialUser);

    const login = async (email, password) => {
        try {
            const result = await fetch(`${API_URL}/api/user/login`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            if (result.status !== 200) {
                // Fixed: Removed the reference to the undefined 'error' variable
                console.log("Login failed with status:", result.status);
                return false;
            } else {
                const newUser = { isLoggedIn: true, name: '', email: email };
                setUser(newUser);
                localStorage.setItem("session", JSON.stringify(newUser));
                return true; // Fixed: Added return true so Login.jsx knows it worked
            }
        } catch (error) {
            console.log("Login Exception: ", error);
            return false;
        }
    }

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/user/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.log("Logout failed", err);
        }
        const newUser = { isLoggedIn: false, name: '', email: '' };
        setUser(newUser);
        localStorage.setItem("session", JSON.stringify(newUser));
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}