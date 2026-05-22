import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const default_image = "https://kidsparkeducation.org/hubfs/stem-elementary-school-kid-spark-education.jpg"
const ClassCard = ( {className, teacherName, image, onView} ) => {
  return (
    <Card sx={{ "backgroundColor": "#FFFDEB"}}>
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
        {/* Card text and button */}
        <CardContent sx={{padding: "2rem"}}>
          <Typography variant="h5" component="div">
            { className }
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            { teacherName }
          </Typography>
          <Button 
            sx={{"backgroundColor": "#11578A", "color": "white"}} 
            variant="contained"
            onClick={onView}>
            View Dashboard
          </Button>
        </CardContent>
              
        {/* Card image */}
        <CardMedia
          component="img"
          height="220"
          image={default_image || "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"}
          alt={`Image for ${className} class`}
          sx={{"width": 120}}
        />
      </Box>
    </Card>
  );
};
export default ClassCard