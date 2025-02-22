import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserRootState from '../../redux/rootstate/UserState';
import { USER } from '../constants/constants';

type RouteType = 'user';

interface PublicRouteProps {
  routeType: RouteType;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ routeType }) => {
  const location = useLocation();
  const userSignedIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);


  const isAuthenticated = (type: RouteType): boolean => {
    switch (type) {
      case 'user':
        return userSignedIn;
      default:
        return false;
    }
  };

  const getRedirectPath = (type: RouteType): string => {
    switch (type) {
      case 'user':
        return USER.HOME;
      default:
        return USER.HOME;
    }
  };

  if (isAuthenticated(routeType)) {
    return <Navigate to={getRedirectPath(routeType)} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;