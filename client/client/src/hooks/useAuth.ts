// filepath: d:\Projects\HackOdishaSubmission\client\src\hooks\useAuth.ts
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser({ email });
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user info (this is a simplified example)
      const userInfo = JSON.parse(atob(token.split('.')[1]));
      setUser(userInfo);
    }
  }, []);

  return { user, login, logout };
};

export { useAuth };