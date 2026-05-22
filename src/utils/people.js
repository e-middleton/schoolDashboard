import { doc, addDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import {db} from "../../firebase.js";

// retrieve all teacher records from the database
const fetchAllPeople = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// add a new person to the database
const addPerson = async (collectionName, person) => {
  await addDoc(collection(db, collectionName), {
    firstName: person.firstName,
    lastName: person.lastName,
    classes: []
  })
}

const updatePerson = async (collectionName, person) => {
  // classes is usually an array of objects, so check then map if necessary
  if (typeof(person.classes) === "string"){
    await updateDoc(doc(db, collectionName, person.id), person); // ideally should include the updated field
  } else {
    // separate out classIDs
    const classIDs = person.classes.map((item) => {
      return item.id;
    })

    person.classes = classIDs;
    await updateDoc(doc(db, collectionName, person.id), person); // ideally should include the updated field
  }
}

const deletePerson = async (collectionName, person) => {
  await deleteDoc(doc(db, collectionName, person.id))
}

// function for fetching a specific student document
const fetchStudentDocument = async (targetStudentID) => {
  const parsedSnapshot = await fetchAllPeople("students");
  return parsedSnapshot.find((doc) => (doc.id === targetStudentID));
};


export { fetchAllPeople, addPerson, updatePerson, deletePerson, fetchStudentDocument };