import {Box, TextField, Button }from '@mui/material';
import "../styling/StudentDirectory.css";
import { addStudent } from '../utils/students';
import { useState, useEffect } from 'react'; 

const NewStudentForm = ( {addNewStudent} ) => {
  const [enter, setEnter] = useState(false);
  const [studentData, setStudentData] = useState({firstName: "", lastName: "", class: ""})
  const [errors, setErrors] = useState({one: false, two: false, three: false})

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

    if (! (studentData.firstName && studentData.lastName && studentData.class) ) return;


    // clear out error messages
    setErrors({one: false, two: false, three: false});

    // triggers useEffect to update the database
    setEnter(prevState => !prevState);

    return 
  }

  useEffect(() => {
    const createStudent = async () => {
      try {
        // prevents database additions on initial render
        console.log("adding a student here");
        if (studentData.firstName === "") return; 
        console.log("first name is good!");
        await addStudent(studentData);

        // close popup, passes state back to parent
        addNewStudent(prevState => !prevState);
      } catch (error) {
        console.error(error);
      }
    }

    createStudent();
  }, [enter])

  return (
    <>
      <h3 style={{textAlign:'center', padding:"5px 0 1px 0"}}>New Student Form</h3>
      <Box
        component="form"
        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' , display: 'flex', flexDirection: 'row'} }}
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
        <Button sx={{margin: "8px"}}
          variant="contained" 
          onClick={() => handleSubmit()}
        > 
          Enter 
        </Button>
      </Box>
    </>
  );
}
export default NewStudentForm