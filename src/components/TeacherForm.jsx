import {Box, List, ListItem, TextField, Button }from '@mui/material';
import "../styling/SearchPage.css";
import { addTeacher, updateTeacher } from '../utils/teachers';
import { useState, useEffect, useRef } from 'react'; 
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';

const TeacherForm = ( { update, message, defaultInfo, closePopup } ) => {
  const isMounted = useRef(false);
  const [enter, setEnter] = useState(false);
  const [teacherData, setTeacherData] = useState(defaultInfo);
  const [errors, setErrors] = useState({one: false, two: false})
  const [isUpdated, setIsUpdated] = useState(false);
  const errMessage = "Required Field";

  const handleSubmit = () => {
    // input validation
    let err1 = false;
    let err2 = false;

    if (teacherData.firstName === "" ) {
      err1 = true;
    } else if (teacherData.lastName === "" ) {
      err2 = true;
    } 
    setErrors({one: err1, two: err2});

    if ( err1 || err2 ) return;

    // notify if the old entry has been updated
    if (update) {
      setIsUpdated(true);
    }

    // clear out error messages
    setErrors({one: false, two: false});

    // triggers useEffect to update the database
    setEnter(prevState => !prevState);
    return 
  }

  useEffect(() => {
    // create a new teacher record
    if (isMounted.current) {
      const createTeacher = async () => {
        try {
          if (teacherData.firstName === "") return;
          await addTeacher(teacherData);

          // close popup, passes state back to parent
          closePopup(prevState => !prevState);
        } catch (error) {
          console.error(error);
        }
      }

      // update an old student record
      const updateRecord = async () => {
        if (!isUpdated) return;

        try {
          await updateTeacher(teacherData);
          closePopup(prevState => !prevState);
        } catch (error) {
          console.error(error);
        }
      }

      update ? updateRecord() : createTeacher();
    } else {
      isMounted.current = true;
    }
  }, [enter])

  return (
    <>
      <h3 style={{textAlign:'center', padding:"5px 0 1px 0"}}>{message}</h3>
      <Box
        component="form"
        sx={{display: "grid", '& .MuiTextField-root': { display: 'flex', flexDirection: 'row', m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          required
          value={teacherData.firstName}
          id="outlined-required"
          label="First Name"
          error={errors.one}
          helperText={errors.one ? errMessage : ""}
          onChange={(e) => {setTeacherData({...teacherData, firstName: e.target.value})}}
        />
        <TextField
          required
          value={teacherData.lastName}
          id="outlined-required"
          label="Last Name"
          error={errors.two}
          helperText={errors.two ? errMessage : ""}
          onChange={(e) => {setTeacherData({...teacherData, lastName: e.target.value})}}
        />

        {/* assigned classes */}
        {update ? 
        <>
          <h4 style={{textAlign:'center', padding:"5px 0 4px 0"}}>Assigned Classes</h4>
          <div className="class-list">
            <List sx={{
                  width: '100%',
                  position: 'relative',
                  overflow: 'auto',
                  '& ul': { padding: 0 },
                }} >
                  {/* Map the classes associated with the teacher */}
                  {teacherData.classes.map( (item)  => (
                    <ListItem key={item.id}>
                      <Button component={NavLink} to={`/class-directory/${item.id}`} variant="outlined" fullWidth>
                        {item.name}
                      </Button>
                    </ListItem>
                  ))}
                </List>
          </div> 
        </>
        : null }

        <Button sx={{
          backgroundColor:"#3877A6",
          margin: "8px"}}
          variant="contained" 
          onClick={() => handleSubmit()}
        > 
          Save Teacher 
        </Button>

        <Button sx={{
          m: "8px",
          "backgroundColor": "#CE2626", 
          "color": "white"
          }} 
          variant="contained" 
          startIcon={<DeleteIcon />}
          >
            Delete Teacher
          </Button>
      </Box>
    </>
  );
}
export default TeacherForm