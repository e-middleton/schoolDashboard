import { doc, addDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import {db} from "../../firebase.js";

// retrieve all student records from the database
const fetchAllStudents = async () => {
  const querySnapshot = await getDocs(collection(db, "students"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// add a new student to the database
const addStudent = async (student) => {
  await addDoc(collection(db, "students"), {
    firstName: student.firstName,
    lastName: student.lastName,
    classes: []
  })
}

const updateStudent = async (student) => {
  await updateDoc(doc(db, "students", student.id), student); // already includes updated field
}

export { fetchAllStudents, addStudent, updateStudent };