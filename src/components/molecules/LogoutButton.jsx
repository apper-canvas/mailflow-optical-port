import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../App';
import ApperIcon from '@/components/ApperIcon';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);
  
  const handleLogout = async () => {
    await logout();
  };
  
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.emailAddress) {
      return user.emailAddress[0].toUpperCase();
    }
    return 'M';
  };
  
  return (
    <div className="relative group">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
        <span className="text-white text-sm font-medium">{getUserInitials()}</span>
      </div>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.emailAddress || 'User'}
          </p>
          <p className="text-xs text-gray-600">{user?.emailAddress || ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <ApperIcon name="LogOut" size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default LogoutButton;