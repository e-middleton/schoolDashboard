import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import classes from "../utils/classes";

const CardCard = ( {className, teacherName, image} ) => {
  return (
    <Card>
      <ListItem >
        <div>
          <ListItemText
            primary={ className }
            secondary={ teacherClass }>
          </ListItemText>
        </div>
      </ListItem>
    </Card>
  );
}
export default CardCard