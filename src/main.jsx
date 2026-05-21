import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import App from './App.jsx';
import Home from './pages/Home.jsx';
import ClassDirectory from './pages/ClassDirectory.jsx'
import StudentDirectory from './pages/StudentDirectory.jsx';
import TeacherDirectory from './pages/TeacherDirectory.jsx';
import Calendar from './pages/Calendar.jsx'
import ClassDetail from "./pages/ClassDetail.jsx"
import GradeManagement from "./pages/GradeManagement.jsx"

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/class-directory",
        element: <ClassDirectory />
      },
      {
        path: "/student-directory",
        element: <StudentDirectory />
      },
      {
        path: "/teacher-directory",
        element: <TeacherDirectory />
      },
      {
        path: "/calendar",
        element: <Calendar />
      },
      {
        path: "/class-directory/:id",
        element: <ClassDetail />
      },
      {
        path: "/grades/:classID/:studentID",
        element: <GradeManagement />
      }
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
