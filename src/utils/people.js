import { doc, addDoc, deleteDoc, updateDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import {db} from "../../firebase.js";
import dayjs from 'dayjs';

// retrieve all teacher records from the database
const fetchAllPeople = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), dateOfBirth: dayjs(doc.data().dateOfBirth.toDate())}));
};

// add a new person to the database
const addPerson = async (collectionName, person, role) => {
  await addDoc(collection(db, collectionName), {
    firstName: person.firstName,
    lastName: person.lastName,
    classIDs: [],
    role: role,
    dateOfBirth: Timestamp.fromDate(person.dateOfBirth.toDate())
  })
}

const updatePerson = async (collectionName, person) => {
  person.dateOfBirth = Timestamp.fromDate(person.dateOfBirth.toDate())
  await updateDoc(doc(db, collectionName, person.id), person); // ideally should include the updated field
}

const deletePerson = async (collectionName, person) => {
  await deleteDoc(doc(db, collectionName, person.id))
}

export { fetchAllPeople, addPerson, updatePerson, deletePerson };