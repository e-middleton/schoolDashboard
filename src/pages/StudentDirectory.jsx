import './../styling/SearchPage.css';
import playground from '../assets/playground.png';
import {List, ListItem, ListItemText, Box, TextField, Button, InputAdornment }from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { fetchAllPeople } from "../utils/people";
import { fetchAllClasses } from "../utils/classes";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PersonForm from '../components/PersonForm';

const StudentDirectory = () => {
  const [addNewStudent, setAddNewStudent] = useState(false);
  const [updateStudent, setUpdateStudent] = useState(false);
  const [defaultInfo, setDefaultInfo] = useState({firstName: "", lastName: "", classes: [], id: ""});
  const [searchName, setSearchName] = useState("");
  const [allStudents, setAllStudents] = useState([]);

  const students = allStudents.filter((student) => `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchName.toLowerCase()))

  // fetch database (happens with each reload)
  useEffect(() => {

    const fetchData = async () => {
      try {
        const data = await fetchAllPeople("students");
        const classData = await fetchAllClasses();
        
        // map class data into students as objects {className, classID}
        const studentData = data.map((record) => {
          if ( record.classIDs[0] ) {
            // match the student's classIDs to class record ids
            const classes = record.classIDs.map((classID) => {
              const assignedClass = classData.filter((item) => item.id === classID)[0];

              return {name: assignedClass.className, id: assignedClass.id};
            })
            record.classes = classes;
          } else {
            const classes = []; // empty
            record.classes = classes;
          }

          return record;

        })
        setAllStudents(studentData);

      } catch (error) {
        console.error("Failed to fetch student records:", error);
      }
    };

    fetchData();
  }, [addNewStudent, updateStudent]);

  const handleStudentUpdate = (student) => {
    setDefaultInfo({...student});
    setUpdateStudent(prevState => !prevState);
  }

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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                
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
            <div className="people-list">
              <List sx={{
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                '& ul': { padding: 0 },
              }} >
                {/* Map the students to list elements */}
                {students.map( (student)  => (
                  <ListItem key={student.id}>
                      <ListItemText
                        primary={ `${student.firstName} ${student.lastName}` }
                      >
                      </ListItemText>
                      <Button 
                      sx={{backgroundColor:"#3877A6"}}
                      variant="contained"
                      onClick={() => handleStudentUpdate(student)}
                      >
                        View
                      </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          </div>

          {/* Image and Add Student Button */}
          <div className="half-content">
            <Button 
              sx={{
                "backgroundColor": "#ce2626", 
                "color": "white", 
                width: 'fit-content',
                marginBottom: "20px",
                marginTop: "10px"}
              } 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setAddNewStudent(prevState => !prevState)}
            >
              Add Student
            </Button>
            <img className="image" src={playground} alt="School Playground Image" />
          </div>
        </div>
      </section>

      {addNewStudent || updateStudent ? 
        <div className="form-overlay">
          <div className="person-form" style={{gridTemplateRows: addNewStudent ? '1fr 6fr 1.5fr' : '1fr 6fr 0.5fr'}}>
            <PersonForm
            isStudent={true} 
            message={addNewStudent ? "New Student Form" : "Update Student"}
            defaultInfo={addNewStudent ? {firstName: "", lastName: "", classes: []} : defaultInfo}
            closePopup={addNewStudent ? setAddNewStudent : setUpdateStudent}
            update={addNewStudent ? false : true}
            />
            
            {/* exit button */}
            <IconButton
              onClick={() => {addNewStudent ? setAddNewStudent(prevState => !prevState) : setUpdateStudent(prevState => !prevState)}}
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