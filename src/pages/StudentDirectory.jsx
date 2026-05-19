import './../styling/StudentDirectory.css';
import playground from '../assets/playground.png';
import {List, Box, TextField, Button, InputAdornment }from '@mui/material';
import StudentCard from '../components/StudentCard';
import SearchIcon from '@mui/icons-material/Search';

// temporary student info for testing
const studentNames = ["name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8", "name9"];
const studentClasses = ["class1", "class2", "class3", "class4", "class5", "class6", "class7", "class8", "class9"];

const students = studentNames.map((student,index) => {
  const entry = {
    name: student ,
    class: studentClasses[index],
  }
  return entry;
});

const StudentDirectory = () => {
  return (
    <>
      <section className="page">
        <div className="directory-content">
          <div className="half-content">
            
            {/* Search Form for Students */}
            <Box component="form" className="searchForm">
              <TextField
                sx={{
                  backgroundColor:"#fffdeb",
                  borderRadius: "10px",
                  boxShadow: "2px 2px 12px 1px #d2d2d2"}}
                fullWidth
                label="Student Name"
                placeholder="Jane Doe"
                // onChange={(e) => onNameChange(e.target.value)}
                slotProps={{
                  input: {
                  endAdornment: <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                  },
                }}
              />
            </Box>

            {/* List of Students */}
            <div className="student-list">
              <List sx={{
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                '& ul': { padding: 0 },
              }} >
                {/* Map the students to list elements */}
                {students.map( (student, index)  => (
                  <StudentCard studentName={student.name} studentClass={student.class} key={index}/>
                ))}
              </List>
            </div>
          </div>

          {/* Image and Add Student Button */}
          <div className="half-content">
            <Button
            sx={{
              backgroundColor:"#ce2626", 
              color: "white",
              width: 'fit-content',
              marginBottom: "20px",
              textTransform: 'none'}}>
              Add Student
            </Button>
            <img className="image" src={playground} alt="School Playground Image" />
          </div>
        </div>
      </section>
    </>
  );
}

export default StudentDirectory;