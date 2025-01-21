import { useEffect, useState } from "react";


const useAuth = (): any => {
    const [authenticated, setAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [login, setLogin] = useState();
  
    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setAuthenticated(true);
      }
    }, []);
  
    const logout = () => {
      setToken(null);
      setAuthenticated(false);
      localStorage.removeItem('token');
    };
  
    return { authenticated, token, logout };
  };

  export default useAuth