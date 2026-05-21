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

const AccordianDropdown = ({ label, contentList, setMessage }) => {
  return (
    <>
      {/* Accordian Row */}
      <Accordion disableGutters
        sx={{
          "width": "100%",
          "backgroundColor": "#FFFDEB", 
          "borderRadius": 2,
          "padding": "0.5rem",
        }}
        onClick={() => setMessage("")}>

        {/* Label */}
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="span">{label}</Typography>
        </AccordionSummary>

        {/* Contents */}
        <Grid container sx={{"display": "flex", "flexDirection": "column", "gap": "0.5rem", "padding": "0.5rem"}}>
          {contentList.length !== 0 ? 
          (contentList.map((record) => (
            <div key={record.assignmentName}>
              <Grid container spacing={0}>
                <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
                  <p>{record.assignmentName}</p>
                  <p>Score: {record.assignmentGrade}/100</p>
                </Card>
                  <Button sx={{"backgroundColor": "#11578A", "color": "white"}} startIcon={<EditIcon />} variant="contained">Edit</Button>
                  <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
              </Grid>
            </div>
          )))
          :
          (
            <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
              <p>No {label.toLowerCase()} have been added.</p>
            </Card>
          )
          }
        </Grid>
      </Accordion>
    </>
  )
}

export default AccordianDropdown;