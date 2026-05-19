import {Box, TextField, Button }from '@mui/material';
import "../styling/StudentDirectory.css";

const NewStudentForm = ( ) => {
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
          id="outlined-required"
          label="First Name"
        />
        <TextField
          required
          id="outlined-required"
          label="Last Name"
        />
        <TextField
          required
          id="outlined-required"
          label="Class"
        />
        <Button variant="contained"> Enter </Button>
      </Box>
    </>
  );
}
export default NewStudentForm