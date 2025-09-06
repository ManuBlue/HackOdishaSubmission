// filepath: d:\Projects\HackOdishaSubmission\client\src\components\Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface SidebarProps {
  userEmail?: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userEmail, onLogout }) => {
  return (
    <div className="w-64 bg-white shadow-md h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold">User: {userEmail}</h2>
        <Button onClick={onLogout} className="mt-4">
          Logout
        </Button>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link to="/dashboard" className="block p-2 hover:bg-gray-200">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/createModel" className="block p-2 hover:bg-gray-200">
              Create Model
            </Link>
          </li>
          <li>
            <Link to="/makeModel" className="block p-2 hover:bg-gray-200">
              Make Model
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;