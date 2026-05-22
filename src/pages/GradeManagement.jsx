import "../styling/GradeManagement.css";

import { fetchGradeDocument, createGradeDocument } from "../utils/grades.js";
import { fetchStudentDocument } from "../utils/people.js";
import { fetchClassDocument } from "../utils/classes.js";
import { calculateStudentAverage } from "../utils/gradeCalculations.js";

// Components displayed
import GradeForm from "../components/GradeForm.jsx";
import GradeCategoryDropdown from "../components/GradeCategoryDropdown.jsx";

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

// MUI
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const GradeManagement = () => {

  /* navigate to grade management page */
  const navigate = useNavigate();

  const params = useParams(); // {classID: 01, studentID: 01}

  // console.log(calculateStudentAverage(params.classID, params.studentID));
  // calculateClassAverage(params.classID);

  // Grades for the student and class being viewed
  const [gradeData, setGradeData] = useState({});
  const [refreshToggle, setRefreshToggle] = useState(false); // triggers refresh on data update

  // States controlling displayed content
  const [gradeFormShown, setGradeFormShown] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false); // true when a grade is being edited/updated
  
  const gradeFormDefault = {
    assignmentName: "",
    assignmentGrade: "",
    assignmentCategory: ""
  };

  // Input Values
  const [gradeFormInput, setGradeFormInput] = useState(gradeFormDefault);


  /* Fetch grade data for class and student viewed*/
  useEffect(() => {
    const getData = async () => {
      const gradeDocument = await fetchGradeDocument(params.classID, params.studentID);
      const [classDocument, studentDocument, studentAverage] = await Promise.all([
        fetchClassDocument(params.classID),
        fetchStudentDocument(params.studentID),
        calculateStudentAverage(params.classID, params.studentID)
      ])

      setGradeData({
        ...gradeDocument,
        className: `${classDocument.className}`,
        studentName: `${studentDocument.firstName} ${studentDocument.lastName}`,
        studentAverage: studentAverage
      });
    }
    getData();
    // createGradeDocument(params.classID, params.studentID);
  }, [refreshToggle])

  
  // Open form to create new grade record
  const openNewForm = () => {
    setGradeFormShown(true);
    setMessage("");
  }

  // Open form to update existing grade record
  const openEditingForm = (gradeRecord) => {
    setEditing(true);
    setGradeFormShown(true);
    setGradeFormInput({
      assignmentName: gradeRecord.assignmentName,
      assignmentGrade: gradeRecord.assignmentGrade,
      assignmentCategory: gradeRecord.assignmentCategory,
      assignmentID: gradeRecord.assignmentID,
      previousCategory: gradeRecord.assignmentCategory
    })
  }

  const handleCloseForm = () => {
    setGradeFormShown(false);
    setEditing(false);
    setGradeFormInput(gradeFormDefault);
  }

  // console.log(gradeFormInput);
  // console.log("params");
  // console.log(params);

  // console.log("grade document");
  // console.log(gradeData);

  const isLoading = !gradeData || Object.keys(gradeData).length === 0;

  return (
    <Grid container spacing={10} columns={12} sx={{"display": "flex", "justifyContent": "center"}}>

      {/* Left side */}

      <Grid container direction="column" spacing={3} size={{ s: 14, md: 7}}>
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/6}} startIcon={<ArrowBackIosIcon />} variant="contained">
            Back
        </Button>

        {isLoading && 
            <h2>Loading grade data...</h2>
        }

        {!isLoading && <>
        {/* Header */}
        <Grid container spacing={0.5} direction="column">
          <p>{gradeData.className}</p>
          <h2>{gradeData.studentName}'s Grades</h2>
        </Grid>


        {/* Grade Form */}
        {gradeFormShown && 
          <GradeForm closeForm={handleCloseForm}
            editing={editing}
            setEditing={setEditing}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            message={message}
            setMessage={setMessage}
            gradeFormInput={gradeFormInput}
            setGradeFormInput={setGradeFormInput}
          />
        }

        {/* Add Grade Button */}
        {!gradeFormShown &&
          <>
            <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} variant="contained" endIcon={<AddIcon />}
            onClick={openNewForm}>
              Add Grade
            </Button>

            {/* Success Message (for user feedback) */}
            {message && <Typography variant="body2" sx={{color: "green"}}>{message}</Typography>}
          </>
        }

        {/* List of Accordians for Grade Categories */}
        {gradeData ? 
        (<Grid container spacing={1}>

          {/* todo: refactor if time */}
          
          {/* Quizzes */}
          <GradeCategoryDropdown label={"Quizzes"} gradeData={gradeData} category={"quizGrades"} setMessage={setMessage}
            refreshToggle={refreshToggle} setRefreshToggle={setRefreshToggle} openEditingForm={openEditingForm}/>
          
          {/* Participation */}
          <GradeCategoryDropdown label={"Participation"} gradeData={gradeData} category={"participationGrades"} setMessage={setMessage}
            refreshToggle={refreshToggle} setRefreshToggle={setRefreshToggle} openEditingForm={openEditingForm}/>
          
          {/* Projects */}
          <GradeCategoryDropdown label={"Projects"} gradeData={gradeData} category={"projectGrades"} setMessage={setMessage}
            refreshToggle={refreshToggle} setRefreshToggle={setRefreshToggle} openEditingForm={openEditingForm}/>
          
          {/* Tests */}
          <GradeCategoryDropdown label={"Tests"} gradeData={gradeData} category={"testGrades"} setMessage={setMessage}
            refreshToggle={refreshToggle} setRefreshToggle={setRefreshToggle} openEditingForm={openEditingForm}/>
        </Grid>)
        :
        (<Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
          <p>Loading grades...</p>
        </Card>)
        }
        </>}

      </Grid>


      {/* Right side - Student Overall Grade, Info*/}
      <Grid container direction="column" size={3} spacing={2}>
        <h3>Grade: {gradeData.studentAverage ? `${gradeData.studentAverage}%`: "N/A"}</h3>
        <h3>Assignments are weighted by group:</h3>
        <Grid container direction="column" spacing={0.5}>
          <p>Quizzes 20%</p>
          <p>Participation 25%</p>
          <p>Projects 25%</p>
          <p>Tests 30%</p>
        </Grid>
      </Grid>
      
    </Grid>
  )
}

export default GradeManagement;