import {Box, List, ListItem, TextField, Button, MenuItem }from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'
import "../styling/SearchPage.css";
import { addPerson, updatePerson, deletePerson } from '../utils/people';
import { useState, useEffect } from 'react'; 
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { NavLink } from 'react-router-dom';
import axios from "axios";
import profileImage from '../assets/profileImage.png';

const PersonForm = ( {isAdmin, isStudent, update, message, defaultInfo, closePopup} ) => {
  const [personData, setPersonData] = useState(defaultInfo);
  const [errors, setErrors] = useState({one: false, two: false, three: false, four: false, five: false})
  const errMessage = "Required Field";
  const [photoUrl, setPhotoUrl] = useState(null)
  const BACKEND_URL = 'http://localhost:3001'; 
  
  // renders the profile image once or upon new uploads
  useEffect(() => {
    async function fetchImageUrl() {
      if (!personData.profilePhoto) return;

      const fileKey = personData.profilePhoto;
      
      try {
        const { data } = await axios.post(`${BACKEND_URL}/get-view-url`, { fileKey });
        setPhotoUrl(data.viewUrl);
      } catch (error) {
        console.error("Error loading image from S3:", error);
      }
    }

    fetchImageUrl();
  }, [personData]);

  // handle profile photo uploads
  const handleProfilePhoto = async (e) => {
    const profilePhoto = e.target.files[0];
    if (!profilePhoto) return;

    // ask backend for signed URL
    const response = await axios.post(
      "http://localhost:3001/generate-upload-url",
      {
        fileName: profilePhoto.name,
        fileType: profilePhoto.type,
      }
    );
    const { uploadUrl, fileKey } = response.data;

    // upload file directly to S3
    await axios.put(uploadUrl, profilePhoto, {
      headers: {
        "Content-Type": profilePhoto.type,
      },
    });

    setPersonData({...personData, profilePhoto: fileKey});
  }

  // double checking for deleting from the database
  const deleteRecord = async () => {
    try {
      // don't delete any records if it hasn't been created yet, just exit
      if (!update) {
        closePopup(prevState => !prevState);
        return;
      }
      if (isStudent) {
        await deletePerson("students", personData);
      } else if (isAdmin) {
        await deletePerson("admin", personData);
      } else {
        await deletePerson("teachers", personData);
      }
      closePopup(prevState => !prevState);
    } catch (error) {
      console.error(error);
    }
  }

  // helper function for updating db records, handles input checking
  const updateRecord = async () => {
    // input validation
    let err1 = false;
    let err2 = false;
    let err4 = false; // dob
    let err5 = false; // email

    if (personData.firstName === "" ) {
      err1 = true;
    } else if (personData.lastName === "" ) {
      err2 = true;
    } else if (personData.dateOfBirth === null) {
      err4 = true;
    } else if (personData.email === "") {
      err5 = true;
    }
    setErrors({one: err1, two: err2, four: err4, five: err5});

    if ( err1 || err2 || err4 || err5) return;

    // clear out error messages
    setErrors({one: false, two: false, four: false, five: false});

    try {
      if (isStudent) {
        await updatePerson("students", personData);
      } else if (isAdmin) {
        await updatePerson("admin", personData);
      } else {
        await updatePerson("teachers", personData);
      }
      closePopup(prevState => !prevState);
    } catch (error) {
      console.error(error);
    }
      
    return 
  }

  // helper function for creating records in the db - handles input checking
  const createRecord = async () => {
    // input validation [firstName, lastName, role, dateOfBirth] are all REQUIRED
    let err1 = false;
    let err2 = false;
    let err3 = false;
    let err4 = false;
    let err5 = false;

    if (personData.firstName === "" ) {
      err1 = true;
    } else if (personData.lastName === "" ) {
      err2 = true;
    } else if (personData.role === "") {
      if (!isStudent) err3 = true; // students roles are always student
    } else if (personData.dateOfBirth === undefined) {
      err4 = true;
    } else if (personData.email === "") {
      err5 = true;
    }
    setErrors({one: err1, two: err2, three: err3, four: err4, five: err5});

    if ( err1 || err2 || err3 || err4 || err5) return;

    // clear out error messages
    setErrors({one: false, two: false, three: false, four: false, five: false});

    try {
      if (personData.firstName === "") return;

      if (isStudent) {
        await addPerson("students", personData, "student");
      } else if (personData.role === "admin") {
        await addPerson("admin", personData, "admin");
      } else {
        await addPerson("teachers", personData, "teacher");
      }

      // close popup, passes state back to parent
      closePopup(prevState => !prevState);
    } catch (error) {
      console.error(error);
    }
    
    return 
  }

  // valid roles for a faculty member to hold
  const roles = [{value: "admin", label: "Admin"}, {value: "teacher", label: "Teacher"}];

  return (
    <>
      <h3 style={{textAlign:'center', padding:"1rem 0 1px 0"}}>{message}</h3>
      <Box
        component="form"
        sx={{width: "75%", display: "grid", '& .MuiTextField-root': { display: 'flex', flexDirection: 'row', m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <div className="person-info-and-photo">
          <div>

            {/* First and last name entry fields  */}
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

            {/* email entry field */}
            <TextField
              required
              fullWidth
              value={personData.email}
              id="outlined-required"
              label="email"
              error={errors.five}
              helperText={errors.five ? errMessage : ""}
              onChange={(e) => {setPersonData({...personData, email: e.target.value})}}
            />
          </div>
          {/* profile photo */}
          <img style={{width: "14rem", height: "14rem", padding: "1rem", borderRadius: "50%"}} src={photoUrl ? photoUrl : profileImage} alt="Profile Photo" />
        </div>
        
        {/* field for date of birth */}

        <div className="horizButtons">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
            sx={{
              margin: "0.5rem",
              maxWidth: "14rem",
            }}
              slotProps={{
                textField: {
                  required: true, 
                  error: errors.four,
                  helperText: errors.four ? errMessage : "",
                },
              }}
              label="Date of Birth"
              value={personData.dateOfBirth
                ? dayjs(personData.dateOfBirth)
                : null}
              onChange={(newValue) => {
                setPersonData({...personData, dateOfBirth: newValue})}}
            />
          </LocalizationProvider>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            sx={{margin: "0.6rem", width:"14rem", backgroundColor:"#3877A6"}}
          >
            Upload PNG
            <input
              type="file"
              style={{display: "none"}}
              accept="image/png"
              onChange={(e) => handleProfilePhoto(e)}
              multiple
            />
          </Button>
        </div>
        

        {/* assigned classes (not included with admin profiles) */}
        {update && !isAdmin ? 
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

        {/* dropdown menu to select role [teacher - admin] */}
        {!update && !isStudent ?
        <>
        <TextField
          id="outlined-select-role"
          fullWidth
          select
          label="role"
          error={errors.three}
          helperText={errors.three ? errMessage : ""}
          value={personData.role}
          helperText="Please select the faculty position"
          onChange={(e) => {setPersonData({...personData, role: e.target.value})}}
          sx={{
            '& .MuiFormHelperText-root': {
              position: 'absolute',
              top: '100%', // Positions it exactly below the bottom border
            }
          }}
        >
          {roles.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        </> : null}
        
        <Button sx={{
          backgroundColor:"#3877A6",
          width: "200px",
          margin: "8px",
          marginTop: "30px"}}
          variant="contained" 
          onClick={() => {update ? updateRecord() : createRecord()}}
        > 
          Save Changes
        </Button>

        <Button sx={{
          m: "8px",
          width: "200px",
          backgroundColor: "#CE2626", 
          color: "white"
          }} 
          variant="contained" 
          onClick={() => {deleteRecord()}}
          startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
      </Box>
    </>
  );
}

export default PersonForm