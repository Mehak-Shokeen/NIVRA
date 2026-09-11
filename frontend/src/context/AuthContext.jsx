import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const savedUser =
            localStorage.getItem("nivra_user");

        const savedToken =
            localStorage.getItem("nivra_token");

        if (savedUser && savedToken) {

            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("nivra_user");
                localStorage.removeItem("nivra_token");
            }
        }

        setLoading(false);

    }, []);

    const login = async (email, password) => {

        const response = await api.post(
            "/auth/login",
            {
                email,
                password
            }
        );

        const data = response.data;

        const userData = {
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role
        };

        localStorage.setItem(
            "nivra_token",
            data.token
        );

        localStorage.setItem(
            "nivra_user",
            JSON.stringify(userData)
        );

        setUser(userData);

        return userData;
    };

    const register = async (
        name,
        email,
        password
    ) => {

        await api.post(
            "/auth/register",
            {
                name,
                email,
                password
            }
        );

        return login(email, password);
    };

    const logout = () => {

        localStorage.removeItem("nivra_token");
        localStorage.removeItem("nivra_user");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}