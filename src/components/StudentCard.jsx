import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const StudentCard = ( {studentName, studentClass } ) => {
  return (
    <>
      <ListItem >
        <div>
          <ListItemText
            primary={ studentName }
            secondary={ studentClass }>
          </ListItemText>
        </div>
      </ListItem>
    </>
  );
}
export default StudentCard