import './../styling/SearchPage.css';
import playground from '../assets/playground.png';
import {List, ListItemText, Box, TextField, Button, InputAdornment }from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { fetchAllPeople } from "../utils/people";
import { fetchAllClasses } from "../utils/classes";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PersonForm from '../components/PersonForm';
import dayjs from 'dayjs';
import axios from 'axios';
import profileImage from '../assets/profileImage.png';

const StudentDirectory = () => {
  const [addNewStudent, setAddNewStudent] = useState(false);
  const [updateStudent, setUpdateStudent] = useState(false);
  const [defaultInfo, setDefaultInfo] = useState({firstName: "", lastName: "", classes: [], classIDs: [], id: "", role: "student", dateOfBirth: dayjs(), profilePhoto: null});
  const [searchName, setSearchName] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const BACKEND_URL = 'http://localhost:3001'; 

  // temporary display students - changes as search bar updates
  const students = allStudents.filter((student) => `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchName.toLowerCase()))

  // grab a temporary viewing url from the aws database
  const uploadPhoto = async (fileKey) => {
    try {
        const { data } = await axios.post(`${BACKEND_URL}/get-view-url`, { fileKey });
        return data.viewUrl;
      } catch (error) {
        console.error("Error loading image from S3:", error);
      }
  }

  // fetch database (happens with each reload)
  useEffect(() => {

    const fetchData = async () => {
      try {
        const data = await fetchAllPeople("students");
        const classData = await fetchAllClasses();
        
        // map class data into students as objects {className, classID}
        // Creates an array of promises by marking the map callback as async
        const studentPromises = data.map(async (record) => {
          // Map class data into students
          if (record.classIDs && record.classIDs[0]) {
            const classes = record.classIDs.map((classID) => {
              const assignedClass = classData.find((item) => item.id === classID);
              return assignedClass 
                ? { name: assignedClass.className, id: assignedClass.id }
                : null;
            }).filter(Boolean); // Removes nulls if a class isn't found
            
            record.classes = classes;
          } else {
            record.classes = [];
          }

          // await photo uploads
          if (record.profilePhoto) {
            const url = await uploadPhoto(record.profilePhoto); // Added 'await'
            record.photoUrl = url;
          }

          return record;
        });

        // wait for all student records to complete uploading
        const studentData = await Promise.all(studentPromises);
        setAllStudents(studentData);

      } catch (error) {
        console.error("Failed to fetch student records:", error);
      }
    };

    fetchData();
  }, [addNewStudent, updateStudent]);

  // helper function for updating student records
  const handleStudentUpdate = (student) => {
    setDefaultInfo({...student});
    setUpdateStudent(prevState => !prevState);
  }

  return (
    <>
      <section className="page">
        <div className="directory-content">
          <div className="half-content">
            
            {/* Search Form for Students by Name */}

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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevents implicit form submission
                  }
                }}
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
                  <li key={student.id} className="person-entry">
                      <div className="photo-and-name">
                        <img style={{width: "5rem", height: "5rem", padding: "1rem", borderRadius: "50%"}} src={student.photoUrl ? student.photoUrl : profileImage} alt="Profile photo"/>
                        <ListItemText
                          primary={ `${student.firstName} ${student.lastName}` }
                          secondary={`ID: ${student.id}`}
                        >
                        </ListItemText>
                      </div>
                      <Button 
                      sx={{backgroundColor:"#3877A6", width: "fit-content", height: "fit-content"}}
                      variant="contained"
                      onClick={() => handleStudentUpdate(student)}
                      >
                        View
                      </Button>
                  </li>
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
      
      {/* Form for adding a new student */}
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