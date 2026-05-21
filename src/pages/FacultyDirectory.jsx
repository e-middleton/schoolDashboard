import { useState, useEffect } from 'react';
import "../styling/SearchPage.css";
import {List, ListItem, IconButton, ListItemText, Box, TextField, Button, InputAdornment }from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import desk from "../assets/desk.png";
import { fetchAllPeople } from "../utils/people";
import { fetchAllClasses } from "../utils/classes";
import PersonForm from '../components/PersonForm';
import dayjs from 'dayjs';

const FacultyDirectory = () => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [allAdmin, setAllAdmin] = useState([]);
  const [addNewFaculty, setAddNewFaculty] = useState(false);
  const [updateFaculty, setUpdateFaculty] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [defaultInfo, setDefaultInfo] = useState({firstName: "", lastName: "", classes: [], classIDs: [], dateOfBirth: dayjs(), id: ""});
  const [isAdmin, setIsAdmin] = useState(false);

  const teachers = allTeachers.filter((teacher) => `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchName.toLowerCase()))
  const admin = allAdmin.filter((admin) => `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchName.toLowerCase()))

  // fetch database (happens with each reload)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllPeople("teachers");
        const data2 = await fetchAllPeople("admin");
        const classData = await fetchAllClasses();
        
        // map class data into teachers as objects {className, classID}
        // no need to map admin
        const teacherData = data.map((record) => {
          if ( record.classIDs[0] ) {
            // match the teacher's classIDs to class record ids
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
        setAllTeachers(teacherData);
        setAllAdmin(data2);

      } catch (error) {
        console.error("Failed to fetch faculty records:", error);
      }
    };

    fetchData();
  }, [addNewFaculty, updateFaculty]);

  const handleFacultyUpdate = (faculty) => {
    setDefaultInfo({...faculty});
    setUpdateFaculty(prevState => !prevState);
    // keeps track of whether the role updated is a teacher or admin
    setIsAdmin(faculty.role==="admin");
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
                label="Faculty Name"
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

            {/* List of Teachers */}
            <div className="people-list">
              <List sx={{
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                '& ul': { padding: 0 },
              }} >
                {/* Map the teachers to list elements */}
                {teachers.map( (teacher)  => (
                  <ListItem key={teacher.id}>
                      <ListItemText
                        primary={ `${teacher.firstName} ${teacher.lastName}` }
                        secondary={teacher.role}
                      >
                      </ListItemText>
                      <Button 
                      sx={{backgroundColor:"#3877A6"}}
                      variant="contained"
                      onClick={() => handleFacultyUpdate(teacher)}
                      >
                        View
                      </Button>
                  </ListItem>
                ))}
                {/* map the administrative faculty to list elements */}
                {admin.map( (admin) => (
                  <ListItem key={admin.id}>
                    <ListItemText
                    primary={`${admin.firstName} ${admin.lastName}`}
                    secondary={admin.role}
                    >
                    </ListItemText>
                    <Button 
                      sx={{backgroundColor:"#3877A6"}}
                      variant="contained"
                      onClick={() => handleFacultyUpdate(admin)}
                      >
                        View
                      </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          </div>

          {/* Image and Add Faculty Button */}
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
              onClick={() => setAddNewFaculty(prevState => !prevState)}
            >
              Add Faculty
            </Button>
            <img className="image" src={desk} alt="School Desk Image" />
          </div>
        </div>
      </section>
      
      {/* popup to add or edit faculty records */}
      {addNewFaculty || updateFaculty ? 
        <div className="form-overlay">
          <div className="person-form" style={{gridTemplateRows: addNewFaculty ? '1fr 6fr 1.5fr' : '1fr 6fr 0.5fr',
            height: addNewFaculty || isAdmin ? '35rem' : '40rem',
          }}>
            <PersonForm
            isStudent={false} 
            isAdmin={isAdmin}
            message={addNewFaculty ? "New Faculty Form" : "Update Faculty"}
            defaultInfo={addNewFaculty ? {firstName: "", lastName: "", role: ""} : defaultInfo}
            closePopup={addNewFaculty? setAddNewFaculty : setUpdateFaculty}
            update={addNewFaculty ? false : true}
            />
            
            {/* exit button */}
            <IconButton
              onClick={() => {addNewFaculty ? setAddNewFaculty(prevState => !prevState) : setUpdateFaculty(prevState => !prevState)}}
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
  )
};

export default FacultyDirectory;