import './../styling/StudentDirectory.css';
import playground from '../assets/playground.png';
import {List, Box, TextField, Button, InputAdornment }from '@mui/material';
import StudentCard from '../components/StudentCard';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { fetchAllStudents } from "../utils/students";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import NewStudentForm from '../components/NewStudentForm';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [addNewStudent, setAddNewStudent] = useState(false);

  // fetch database (happens with each reload)
  useEffect(() => {

    const fetchData = async () => {
      try {
        console.log("testing");
        const data = await fetchAllStudents();
        console.log(data);
        setStudents(data);

      } catch (error) {
        console.error("Failed to fetch student records:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <section className={`page ${addNewStudent ? "blurred" : ""}`}>
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
                {students.map( (student)  => (
                  <StudentCard studentName={`${student.firstName} ${student.lastName}`} studentClass={student.class} key={student.id}/>
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
              textTransform: 'none'}}
            onClick={() => setAddNewStudent(prevState => !prevState)}
              >
              Add Student
            </Button>
            <img className="image" src={playground} alt="School Playground Image" />
          </div>
        </div>
      </section>

      {addNewStudent ? 
        <div className="new-student">
          <div className="new-student-form">
            <NewStudentForm />
            
            {/* exit button */}
            <IconButton
              onClick={() => setAddNewStudent(prevState => !prevState)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      : null }
    </>
  );
}

export default StudentDirectory;