import { NavLink, Outlet } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <>
      {/* Navigation Bar */}
      <nav>

        {/* Blue Title Div */}
        <div className="nav-titlediv">
          <NavLink to="/" className="title-text"><h2>Class Management - Thomas Jefferson School</h2></NavLink>
        </div>

        {/* Yellow Navlinks Div */}
        <div className="nav-linksdiv">

          <div className="nav-leftalign">
            <NavLink to="/class-directory" className="nav-link">Class Directory</NavLink>
            <NavLink to="/student-directory" className="nav-link">Student Directory</NavLink>
            <NavLink to="/faculty-directory" className="nav-link">Faculty Directory</NavLink>
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
