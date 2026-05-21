import "../styling/GradeManagement.css"

import { useState, useEffect } from 'react'

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { styled } from '@mui/material/styles';

const GradeManagement = () => {
  
  /*
  todo:
  - refactor components
  - params
  - back button (class page), need to know which class came from
  - validate grade input; error message
  */
  // if time: add search bar for assignments (?)
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentGrade, setAssignmentGrade] = useState(null);
  const [assignmentCategory, setAssignmentCategory] = useState("");
  const [age, setAge] = React.useState('');

  const handleChange = (newAge) => {
    setAge(newAge);
  };

  console.log(assignmentName)
    console.log(assignmentGrade)
      console.log(assignmentCategory)

  const updateAssignmentName = (newName) => {
    setAssignmentName(newName);
  }

  const updateAssignmentGrade = (newGrade) => {
    setAssignmentGrade(newGrade);
  }

  return (
    <Grid container spacing={10} columns={12} sx={{"display": "flex", "justifyContent": "center"}}>

      {/* Left side */}
      <Grid container direction="column" spacing={3} size={{ s: 14, md: 7}}>
        {/* Back Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/6}} startIcon={<ArrowBackIosIcon />} variant="contained">Back </Button>
        
        {/* Header */}
        <Grid container spacing={0.5} direction="column">
          <p>Class Name</p>
          <h2>[Student Name]'s Grades</h2>
        </Grid>


        {/*  */}
        <Grid container sx={{"bgcolor": "#F5F3E4", padding: "4rem 2rem", "borderRadius": 2, "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "column"}}>
          <Grid container sx={{"display": "flex", "justifyContent": "space-between"}}>
            <h2>New Assignment Grading</h2>
            <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Cancel</Button>
          </Grid>
          <Grid container direction="column" spacing={1}>
            <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Assignment Name</InputLabel>
            <TextField
              placeholder="Enter name..."
              inputProps={{ 'aria-label': 'search' }}
              value={assignmentName}
              onChange={(e) => updateAssignmentName(e.target.value)}
              sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1}}
            />
          </Grid>
          <Grid container direction="column" spacing={1}>
            <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Grade</InputLabel>
            <Grid columns={12} sx={{"display": "flex", "flexDirection": "row", "alignItems": "center"}}>
              <TextField
                placeholder="Between 0 and 100"
                inputProps={{ 'aria-label': 'search' }}
                value={assignmentGrade}
                onChange={(e) => updateAssignmentGrade(e.target.value)}
                sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1, width: 1/10}}
              />
              <Typography variant="body1">out of 100</Typography>
            </Grid>
          </Grid>
              <Box sx={{ minWidth: 120 }}>
          <Grid container direction="column" spacing={1}>
            <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Category</InputLabel>
            <Select
              value={age}
              displayEmpty
              renderValue={(value) => {
                if (!value) {
                  return <Typography sx={{color:"#707070"}}>Select...</Typography>;
                }
                return <>{value}</>;
              }}
              onChange={(e) => handleChange(e.target.value)}
              sx={{"width": 1/3}}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </Grid>
        </Box>
          <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} endIcon={<SendIcon />} variant="contained">Submit </Button>
        </Grid>

        {/* Add Assignments Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} variant="contained" endIcon={<AddIcon />}>Add Assignment</Button>

        {/* List of Accordians */}
        <Grid container spacing={1}>
          {/* Accordian Row */}
          <Accordion disableGutters
            sx={{
              "width": "100%",
              "backgroundColor": "#FFFDEB", 
              "borderRadius": 2
            }}>

            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography component="span">Quizzes</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={0.5}>
                <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
                  <p>Quiz 1</p>
                  <p>95/100</p>
                </Card>
                  <Button sx={{"backgroundColor": "#11578A", "color": "white"}} startIcon={<EditIcon />} variant="contained">Edit</Button>
                  <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
                <Grid container space={1}>
                </Grid>
              </Grid>
            </AccordionDetails>

          </Accordion>

          {/* Accordian Row */}
          <Accordion disableGutters
            sx={{
              "width": "100%",
              "backgroundColor": "#FFFDEB", 
              "borderRadius": 2
            }}>

            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography component="span">Quizzes</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>

          </Accordion>
        </Grid>

      </Grid>

      {/* Right side */}
      <Grid container direction="column" size={3} spacing={2}>
        <h3>Grade: 94.8%</h3>
        <h3>Assignments are weighted by group:</h3>
        <Grid container direction="column" spacing={0.5}>
          <p>Quizzes 20%</p>
          <p>Participation 25%</p>
          <p>Projects 25%</p>
          <p>Tests 25%</p>
        </Grid>
      </Grid>
      
    </Grid>
  )
}

export default GradeManagement;