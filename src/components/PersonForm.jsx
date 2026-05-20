import {Box, List, ListItem, TextField, Button }from '@mui/material';
import "../styling/SearchPage.css";
import { addStudent, updateStudent } from '../utils/students';
import { addTeacher, updateTeacher } from '../utils/teachers';
import { useState, useEffect, useRef } from 'react'; 
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';

const PersonForm = ( {isStudent, update, message, defaultInfo, closePopup} ) => {
  const isMounted = useRef(false);
  const [enter, setEnter] = useState(false);
  const [personData, setPersonData] = useState(defaultInfo);
  const [errors, setErrors] = useState({one: false, two: false, three: false})
  const [isUpdated, setIsUpdated] = useState(false);
  const errMessage = "Required Field";

  const handleSubmit = () => {
    // input validation
    let err1 = false;
    let err2 = false;

    if (personData.firstName === "" ) {
      err1 = true;
    } else if (personData.lastName === "" ) {
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
    // create a new student record
    if (isMounted.current) {
      const createRecord = async () => {
        try {
          if (personData.firstName === "") return;

          if (isStudent) {
            await addStudent(personData);
          } else {
            await addTeacher(personData);
          }

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
          if (isStudent) {
            await updateStudent(personData);
          } else {
            await updateTeacher(personData);
          }
          closePopup(prevState => !prevState);
        } catch (error) {
          console.error(error);
        }
      }

      update ? updateRecord() : createRecord();
    } else {
      isMounted.current = true;
    }
  }, [enter])

  return (
    <>
      <h3 style={{textAlign:'center', padding:"5px 0 1px 0"}}>{message}</h3>
      <Box
        component="form"
        sx={{width: "75%", display: "grid", '& .MuiTextField-root': { display: 'flex', flexDirection: 'row', m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          required
          fullWidth
          value={personData.firstName}
          id="outlined-required"
          label="First Name"
          error={errors.one}
          helperText={errors.one ? errMessage : ""}
          onChange={(e) => {setPersonData({...personData, firstName: e.target.value})}}
        />
        <TextField
          required
          fullWidth
          value={personData.lastName}
          id="outlined-required"
          label="Last Name"
          error={errors.two}
          helperText={errors.two ? errMessage : ""}
          onChange={(e) => {setPersonData({...personData, lastName: e.target.value})}}
        />

        {/* assigned classes */}
        {update ? 
        <>
          <h4 style={{textAlign:'center', padding:"15px 0 15px 0"}}>Assigned Classes</h4>
          <div className="class-list">
            <List sx={{
                  width: '100%',
                  position: 'relative',
                  overflow: 'auto',
                  '& ul': { padding: 0 },
                }} >
                  {/* Map the classes associated with the person */}
                  {personData.classes.map( (item)  => (
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
          width: "200px",
          margin: "8px",
          marginTop: "30px"}}
          variant="contained" 
          onClick={() => handleSubmit()}
        > 
          {isStudent ? "Save Student" : "Save Teacher"} 
        </Button>

        <Button sx={{
          m: "8px",
          width: "200px",
          backgroundColor: "#CE2626", 
          color: "white"
          }} 
          variant="contained" 
          startIcon={<DeleteIcon />}
          >
            {isStudent ? "Delete Student" : "Delete Teacher"} 
          </Button>
      </Box>
    </>
  );
}
export default PersonForm