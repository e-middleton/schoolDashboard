import { NavLink, Outlet } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <>
      {/* Navigation Bar */}
      <nav>

        {/* Blue Title Div */}
        <div className="nav-titlediv">
          <h2 className="title-text">Class Management - Thomas Jefferson School</h2>
        </div>

        {/* Yellow Navlinks Div */}
        <div className="nav-linksdiv">

          <div className="nav-leftalign">
            <NavLink to="/class-directory" className="nav-link">All Classes</NavLink>
            <NavLink to="/student-directory" className="nav-link">Student Directory</NavLink>
            <NavLink to="/teacher-directory" className="nav-link">Teacher Directory</NavLink>
          </div>

          <NavLink to="/calendar" className="nav-link">Calendar</NavLink>

        </div>

      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App
