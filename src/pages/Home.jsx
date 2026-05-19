
import { Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

import classroom from '../assets/classroom.jpg';

import '../styling/Home.css';

const Home = () => {
  return (
    <section className="home-page">
      <div className="home-content">
        <div className="home-copy">
          <h1>Welcome to Thomas Jefferson Elementary School class management hub!</h1>
          <p>
            Explore classes, students, teachers, and calendars from one central
            place.
          </p>
          <Button
            component={NavLink}
            to="/class-directory"
            variant="contained"
            sx={{ backgroundColor: '#11578A', color: 'white', width: 'fit-content', textTransform: 'none' }}
          >
            Go to Class Directory
          </Button>
        </div>

        <img className="home-image" src={classroom} alt="Classroom at Thomas Jefferson Elementary School" />
      </div>
    </section>
  );
}

export default Home;