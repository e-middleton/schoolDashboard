import { useState, useEffect } from 'react';
import "../styling/SearchPage.css";
import {List, ListItem, IconButton, ListItemText, Box, TextField, Button, InputAdornment }from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import desk from "../assets/desk.png";
import { fetchAllTeachers } from "../utils/teachers";
import TeacherForm from '../components/TeacherForm';

const TeacherDirectory = () => {
  const [teachers, setTeachers] = useState([]);
  const [addNewTeacher, setAddNewTeacher] = useState(false);
  const [updateTeacher, setUpdateTeacher] = useState(false);
  const [defaultInfo, setDefaultInfo] = useState({firstName: "", lastName: "", class: "", id: ""});

  // fetch database (happens with each reload)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllTeachers();
        console.log(data);
        setTeachers(data);

      } catch (error) {
        console.error("Failed to fetch teacher records:", error);
      }
    };

    fetchData();
  }, [addNewTeacher, updateTeacher]);

  // const teachers = [{firstName: "Jane", lastName: "Doe", class: "Math 3", id: "1"}];

  const handleTeacherUpdate = (teacher) => {
    // function to grab classes associated with a teacher id
    const classArr = [{name: "Bio", id: "1"}, {name: "Chem", id: "2"}];

    setDefaultInfo({firstName: teacher.firstName, lastName: teacher.lastName, class: teacher.class, id: teacher.id, classes: classArr});
    setUpdateTeacher(prevState => !prevState);
  }

  return (
    <>
      <section className={`page ${addNewTeacher ? "blurred" : ""}`}>
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
                label="Teacher Name"
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
                        secondary={ teacher.class }>
                      </ListItemText>
                      <Button 
                      sx={{backgroundColor:"#3877A6"}}
                      variant="contained"
                      onClick={() => handleTeacherUpdate(teacher)}
                      >
                        Update
                      </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          </div>

          {/* Image and Add Teacher Button */}
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
              onClick={() => setAddNewTeacher(prevState => !prevState)}
            >
              Add Teacher
            </Button>
            <img className="image" src={desk} alt="School Desk Image" />
          </div>
        </div>
      </section>
      
      {/* popup to add or edit teacher records */}
      {addNewTeacher || updateTeacher ? 
        <div className="form-overlay">
          <div className="person-form">
            <TeacherForm 
            message={addNewTeacher ? "New Teacher Form" : "Update Teacher"}
            defaultInfo={addNewTeacher ? {firstName: "", lastName: "", class: ""} : defaultInfo}
            closePopup={addNewTeacher ? setAddNewTeacher : setUpdateTeacher}
            update={addNewTeacher ? false : true}
            />
            
            {/* exit button */}
            <IconButton
              onClick={() => {addNewTeacher ? setAddNewTeacher(prevState => !prevState) : setUpdateTeacher(prevState => !prevState)}}
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

export default TeacherDirectory;