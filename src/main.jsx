
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
import UserContextProvider from './context/UserContextProvider.jsx'
import WorkerDashboard from './pages/WorkerDashboard.jsx'
import GoogleCallbackHandler from './pages/GoogleCallBackHandler.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'
import WorkerProfileUpdate from './components/WorkerProfileUpdate.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ChangePassword from './components/ChangePassword.jsx'
import ApplyForm from './components/applyform.jsx'
import Admin from "./pages/AdminDashboard.jsx";



const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/admin",
        element: (
           
            <Admin />
      
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/worker-signup",
        element: <WorkerSignup />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/user-dashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "/worker-dashboard",
        element: (
          <ProtectedRoute>
            <WorkerDashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "/oauth-success",
        element: <GoogleCallbackHandler />,
        errorElement: <ErrorPage />,
      },

      {
        path: "/update-profile",
        element: <WorkerProfileUpdate />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/profile/change-password",
        element: <ChangePassword />,
      },
      {
        path: "/worker-dashboard/apply/:id",
        element: <ApplyForm />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <UserContextProvider >
    <RouterProvider router = {router} />
  </UserContextProvider>
)

