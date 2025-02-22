import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Auth/Login'
import PublicRoute from './utils/helpers/PublicRouteProps'
// import ErrorBoundary from './utils/helpers/ErrorBoundary'
import UnifiedPrivateRoute from './utils/helpers/PrivateRouteProps'
import { USER } from './utils/constants/constants'
import LandingPage from './pages/LandingPage'
import Register from './pages/Auth/Register'
import { InkSpireNavbar } from './components/common/Navbar'
import { NextUIProvider } from '@nextui-org/react'
import OTPVerification from './pages/Auth/Otp'
import Home from './pages/Home'
import UserProfile from './components/user/UserProfile'
import ArticleForm from './components/articles/ArticleForm'
import MyArticles from './components/articles/MyArticles'

function App() {
  const noNavbarRoutes = ['/login', '/signup', '/verifyOtp'];
  const location = useLocation();
  const shouldHideNavbar = noNavbarRoutes.includes(location.pathname);
  return (
    <NextUIProvider>
      {/* <ErrorBoundary> */}
      {!shouldHideNavbar && <InkSpireNavbar />}
        <Routes>
          <Route element={<PublicRoute routeType='user' />}>
            <Route path={USER.LANDINGPAGE} element={<LandingPage />} />
            <Route path={USER.LOGIN} element={<LoginPage />} />
            <Route path={USER.SIGNUP} element={<Register />} />
            <Route path={USER.VERIFY} element={<OTPVerification />} />
          </Route>

          <Route element={<UnifiedPrivateRoute routeType='user' />}>
            <Route path={USER.HOME} element={<Home />} />
            <Route path={USER.PROFILE} element={<UserProfile />} />
            <Route path={USER.CREATE_ARTICLE} element={<ArticleForm />} />
            <Route path={USER.ARTICLE} element={<MyArticles />} />
          </Route>
        </Routes>
      {/* </ErrorBoundary> */}
      </NextUIProvider>
  )
}

export default App
