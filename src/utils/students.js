import { collection, getDocs } from "firebase/firestore";
import {db} from "../../firebase.js";

// retrieve all student records from the database
const fetchAllStudents = async () => {
  const querySnapshot = await getDocs(collection(db, "students"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export { fetchAllStudents };