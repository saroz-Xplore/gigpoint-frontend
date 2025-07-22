
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import  RootLayout  from './Layout/RootLayout.jsx'
import HomePage from './pages/Home'
import { createRoot } from 'react-dom/client'
import AboutPage from './pages/About.jsx'
import  Dashboard  from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import  WorkerSignup  from './pages/WorkerSignup.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import OAuthHandler from './pages/OAuthHandler.jsx'
import UserContextProvider from './context/UserContextProvider.jsx'
import WorkerDashboard from './pages/WorkerDashboard.jsx'
import GoogleCallbackHandler from './pages/GoogleCallBackHandler.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'



const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/about",
        element: <AboutPage/>
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/worker-signup",
        element: <WorkerSignup />
      },
      {
        path: "/oauth-handler",
        element: <OAuthHandler />
      },
      {
        path: "/user-dashboard",
        element: (
          <ProtectedRoute >
         <UserDashboard />
           </ProtectedRoute>
        )
      },
      {
        path: "/worker-dashboard",
        element: (
            <ProtectedRoute >
              <WorkerDashboard />
            </ProtectedRoute>
        )
      },
      {
        path: "/oauth-success",
        element: <GoogleCallbackHandler />
      },
    
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <UserContextProvider >
    <RouterProvider router = {router} />
  </UserContextProvider>
)

