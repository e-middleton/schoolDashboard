import {Box, TextField, Button }from '@mui/material';
import "../styling/SearchPage.css";
import { addStudent, updateStudent } from '../utils/students';
import { useState, useEffect, useRef } from 'react'; 
import DeleteIcon from '@mui/icons-material/Delete';

const NewStudentForm = ( {update, message, defaultInfo, closePopup} ) => {
  const isMounted = useRef(false);
  const [enter, setEnter] = useState(false);
  const [studentData, setStudentData] = useState(defaultInfo);
  const [errors, setErrors] = useState({one: false, two: false, three: false})
  const [isUpdated, setIsUpdated] = useState(false);
  const errMessage = "Required Field";

  const handleSubmit = () => {
    // input validation
    let err1 = false;
    let err2 = false;
    let err3 = false;

    if (studentData.firstName === "" ) {
      err1 = true;
    } else if (studentData.lastName === "" ) {
      err2 = true;
    } else if (studentData.class === "" ) {
      err3 = true;
    }
    setErrors({one: err1, two: err2, three: err3});

    if ( err1 || err2 || err3 ) return;

    // notify if the old entry has been updated
    if (update) {
      setIsUpdated(true);
    }

    // clear out error messages
    setErrors({one: false, two: false, three: false});

    // triggers useEffect to update the database
    setEnter(prevState => !prevState);
    return 
  }

  useEffect(() => {
    // create a new student record
    if (isMounted.current) {
      const createStudent = async () => {
        try {
          if (studentData.firstName === "") return;
          await addStudent(studentData);

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
          await updateStudent(studentData);
          closePopup(prevState => !prevState);
        } catch (error) {
          console.error(error);
        }
      }

      update ? updateRecord() : createStudent();
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
          value={studentData.firstName}
          id="outlined-required"
          label="First Name"
          error={errors.one}
          helperText={errors.one ? errMessage : ""}
          onChange={(e) => {setStudentData({...studentData, firstName: e.target.value})}}
        />
        <TextField
          required
          value={studentData.lastName}
          id="outlined-required"
          label="Last Name"
          error={errors.two}
          helperText={errors.two ? errMessage : ""}
          onChange={(e) => {setStudentData({...studentData, lastName: e.target.value})}}
        />
        <TextField
          required
          value={studentData.class}
          id="outlined-required"
          label="Class"
          error={errors.three}
          helperText={errors.three ? errMessage : ""}
          onChange={(e) => {setStudentData({...studentData, class: e.target.value})}}
        />
        <Button sx={{
          backgroundColor:"#3877A6",
          margin: "8px"}}
          variant="contained" 
          onClick={() => handleSubmit()}
        > 
          Save Student 
        </Button>

        <Button sx={{
          m: "8px",
          "backgroundColor": "#CE2626", 
          "color": "white"
          }} 
          variant="contained" 
          startIcon={<DeleteIcon />}
          >
            Delete Student
          </Button>
      </Box>
    </>
  );
}
export default NewStudentForm