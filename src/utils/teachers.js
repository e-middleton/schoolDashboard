import { doc, addDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import {db} from "../../firebase.js";

// retrieve all teacher records from the database
const fetchAllTeachers = async () => {
  const querySnapshot = await getDocs(collection(db, "teachers"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// add a new teacher to the database
const addTeacher = async (teacher) => {
  await addDoc(collection(db, "teachers"), {
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    classes: []
  })
}

const updateTeacher = async (teacher) => {
  // classes is usually an array of objects, so check then map if necessary
  if (typeof(teacher.classes) === "string"){
    await updateDoc(doc(db, "teachers", teacher.id), teacher); // ideally should include the updated field
  } else {
    // separate out classIDs
    const classIDs = teacher.classes.map((item) => {
      return item.id;
    })

    teacher.classes = classIDs;
    await updateDoc(doc(db, "teachers", teacher.id), teacher); // ideally should include the updated field
  }
}

export { fetchAllTeachers, addTeacher, updateTeacher };