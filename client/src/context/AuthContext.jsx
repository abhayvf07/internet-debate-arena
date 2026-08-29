// Auth context — manages user state, login, logout, and error handling
import { createContext, useContext, useReducer, useEffect } from "react";
import { logoutUser } from "../services/api";
import { disconnectSocket } from "../socket/socket";

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

// Reducer for auth state transitions
function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, loading: false, user: action.payload, error: null };
    case "AUTH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync user to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.user]);

  const login = (userData) => {
    dispatch({ type: "AUTH_SUCCESS", payload: userData });
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed", err);
    }
    disconnectSocket();
    dispatch({ type: "LOGOUT" });
  };

  const setError = (error) => {
    dispatch({ type: "AUTH_FAILURE", payload: error });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const setLoading = () => {
    dispatch({ type: "AUTH_START" });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        logout,
        setError,
        clearError,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);