import { deleteGradeRecord } from "../utils/grades.js"

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

// Accordian
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

const GradeCategoryDropdown = ({ label, gradeData, category, setMessage, refreshToggle, setRefreshToggle, openEditingForm }) => {

  // Delete grade record
  const handleDelete = async (record, targetClassID, targetStudentID) => {
    await deleteGradeRecord(
      {
        ...record, 
        classID: targetClassID, 
        studentID: targetStudentID,
        assignmentCategory: label
      }
    );
    setRefreshToggle(!refreshToggle) // trigger refresh
  }
  

  return (
    <>
      {/* Accordian Row */}
      <Accordion disableGutters sx={{"width": "100%", "backgroundColor": "#FFFDEB", "borderRadius": 2, "padding": "0.5rem",}}
        onClick={() => setMessage("")}>

        {/* Category Label */}
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {/* "flexGrow": 1, "marginRight": "0.25rem", "justifyContent": "space-between",  */}
          <div style={{display: "flex", gap: "0.5rem", "alignItems": "center"}}>
            <div style={{"backgroundColor": "rgb(231, 227, 198)", padding: "0.25rem 0.65rem", "borderRadius": "0.25rem"}}>
              <Typography variant="body2" component="span">{Object.keys(gradeData?.[category]).length}</Typography>
            </div>
            <Typography component="span">{label}</Typography>
          </div>
        </AccordionSummary>

        {/* Contents */}
        <Grid container sx={{"display": "flex", "flexDirection": "column", "gap": "0.5rem", "padding": "0.5rem"}}>
          {gradeData?.[category]?.length ?
          
          // Category list
          (gradeData[category].map((record) => (

            // Assignment Grade Row
            <div key={record.assignmentName}>
              <Grid container spacing={0}>

                {/* Assignment and Grade Info */}
                <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
                  <p>{record.assignmentName}</p>
                  <p>Score: {record.assignmentGrade}/100</p>
                </Card>

                {/* Edit Button */}
                <Button 
                  onClick={() => openEditingForm({assignmentID: record.assignmentID, assignmentName: record.assignmentName, assignmentGrade: record.assignmentGrade, assignmentCategory: label})}
                  sx={{"backgroundColor": "#11578A", "color": "white"}} startIcon={<EditIcon />} variant="contained">
                    Edit
                </Button>
                
                {/* Delete Button */}
                <Button
                  onClick={() => handleDelete(record, gradeData.classID, gradeData.studentID)}
                  sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>
                    Delete
                </Button>

              </Grid>
            </div>
          )))
          :
          (
            // Empty category list
            <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
              <p>No {label.toLowerCase()} exist.</p>
            </Card>
          )
          }
        </Grid>
      </Accordion>
    </>
  )
}

export default GradeCategoryDropdown;