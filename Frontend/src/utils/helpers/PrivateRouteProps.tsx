import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';
import UserRootState from '../../redux/rootstate/UserState';
import { USER } from '../constants/constants';

type RouteType = 'user';

interface PrivateRouteProps {
  routeType: RouteType;
}

const UnifiedPrivateRoute: React.FC<PrivateRouteProps> = ({ routeType }) => {
  const userState = useSelector((state: UserRootState) => state.user.userData);  
  const userSignedIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);


  const getRedirectPath = (type: RouteType): string => {
    switch (type) {
      case 'user':
        return USER.LOGIN;
      default:
        return USER.LOGIN;
    }
  };

  const isAuthenticated = (type: RouteType): boolean => {
    switch (type) {
      case 'user':
        return userSignedIn && userState?.isActive !== false;
      default:
        return false;
    }
  };

  return isAuthenticated(routeType) ? (
    <Outlet />
  ) : (
    <Navigate to={getRedirectPath(routeType)} replace />
  );
};

export default UnifiedPrivateRoute;

