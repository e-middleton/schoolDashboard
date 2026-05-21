import { useState } from 'react'
import { useParams } from 'react-router'
import { gradeCategories, addGradeRecord, updateGradeRecord } from "../utils/grades.js"

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const GradeForm = ({ closeForm, editingForm, setEditingForm, message, setMessage, refreshToggle, setRefreshToggle, gradeFormInput, setGradeFormInput}) => {

  // Get route parameters
  const params = useParams(); // {classID: 01, studentID: 01}
  
  const handleSubmit = () => {
    const addData = async () => {
      let success = 
      
      await addGradeRecord({
          ...gradeFormInput,
          classID: params.classID,
          studentID: params.studentID
      });

      // error: assignment name already used
      console.log("success is:")
      console.log(success);
      if(!success) {
        setMessage(`Assignment with name ${gradeFormInput.assignmentName} already exists in the selected category.`);
        return;
      }

      setMessage(`Successfully added ${gradeFormInput.assignmentName} to ${gradeFormInput.assignmentCategory}`);
      closeForm();
      setRefreshToggle(!refreshToggle); // trigger refresh
    }
    addData();
  }

  return (
    <Grid container spacing={1} sx={{"bgcolor": "#F5F3E4", padding: "4rem 2rem", "borderRadius": 2, "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "column"}}>

      {/* Top */}
      <Grid container sx={{"display": "flex", "justifyContent": "space-between"}}>
        {/* Header */}
        <h2>New Grade</h2>

        {/* Hide Form Button */}
        <Button
          sx={{"backgroundColor": "#CE2626", "color": "white"}}
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={() => {setMessage(""); closeForm(); }}
        >Cancel</Button>
      </Grid>

      {/* Name Input */}
      <Grid container direction="column" spacing={1}>
        <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Assignment Name</InputLabel>
        <TextField
          placeholder="Enter name..."
          value={gradeFormInput.assignmentName}
          onChange={(e) => setGradeFormInput({...gradeFormInput, assignmentName: e.target.value})}
          sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1}}
        />
      </Grid>

      {/* Grade Input */}
      <Grid container direction="column" spacing={1}>
        <Grid container direction="row" sx={{"display": "flex", "alignItems": "end"}}>
          <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Grade</InputLabel>
          <Typography variant="body2" sx={{"display": "inline", color: "#858585"}}> (out of 100)</Typography>
        </Grid>
        <Grid columns={12} sx={{"display": "flex", "flexDirection": "row", "alignItems": "center"}}>
          <TextField
            placeholder="Between 0 and 100"
            value={gradeFormInput.assignmentGrade}
            onChange={(e) => setGradeFormInput({...gradeFormInput, assignmentGrade: e.target.value})}
            sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1, width: 1/10}}
          />
        </Grid>
      </Grid>

      {/* Category Select Dropdown */}
      <Grid container direction="column" spacing={1}>
        <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Category</InputLabel>
        <Select
          value={gradeFormInput.assignmentCategory} //update to set to 1st category
          displayEmpty
          renderValue={(value) => {
            if (!value) {
              return <Typography sx={{color:"#929292"}}>Select...</Typography>;
            }
            return <>{value}</>;
          }}
          onChange={(e) => setGradeFormInput({...gradeFormInput, assignmentCategory: e.target.value})}
          sx={{"width": 1/3}}
        >
          {gradeCategories.map((category) => (
            <MenuItem value={category}>{category}</MenuItem>
          ))}
        </Select>
      </Grid>

      {/* Submit Button */}
      <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} endIcon={<SendIcon />} variant="contained"
        onClick={handleSubmit}>
          Add
      </Button>
      
      {message && <Typography variant="body2" sx={{color: "red"}}>
        {message}
      </Typography>}
    </Grid>
  )
}

export default GradeForm;
