
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import  RootLayout  from './Layout/RootLayout.jsx'
import HomePage from './pages/Home'
import { createRoot } from 'react-dom/client'
import { About } from './pages/About.jsx'
import { Account } from './pages/Account.jsx'

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
        element: <About />
      },
      {
        path: "/dashboard",
        element: <Account />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router = {router} />
)

