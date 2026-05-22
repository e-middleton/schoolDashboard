import { doc, addDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";

// Fixed grade categories
const gradeCategories = ["Quizzes", "Participation", "Projects", "Tests"];

// Maps grade categories to weight
const gradeCategoryToWeight = {
  'quizGrades': 0.20, 
  'participationGrades': 0.25,
  'projectGrades': 0.25,
  'testGrades': 0.30 
};

// Structure of grade document
const gradeStructure = {
  classID: "",
  studentID: "",
  participationGrades: [],
  quizGrades: [], // contains grade records ex. {assignmentID: , assignmentName: 'assignment1', assignmentGrade: 98}
  testGrades: [], // contains grade records
  projectGrades: [] // contains grade records
}

// Maps category labels to property names in document
const categoryToProperty = {
  "Participation": "participationGrades",
  "Quizzes": "quizGrades",
  "Tests": "testGrades",
  "Projects": "projectGrades"
}

// create initial grade document
const createGradeDocument = async (targetClassID, targetStudentID) => {
  const newDocument = {
    ...gradeStructure,
    classID: targetClassID,
    studentID: targetStudentID
  };
  const docRef = await addDoc(collection(db, "grades"), newDocument);
  return { id: docRef.id, ...newDocument };
}

// retrieve all grade records from the database for a specified **class and **student
const fetchGradeDocument = async (targetClassID, targetStudentID) => {
  const querySnapshot = await getDocs(collection(db, "grades"));
  const parsedSnapshot = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  // Search by class and student
  const matchingGradeDocument = parsedSnapshot.find((grade) =>
    grade.classID == targetClassID && grade.studentID == targetStudentID);

  if(matchingGradeDocument) {
    console.log("matching grade document found");
    console.log(matchingGradeDocument);
    return matchingGradeDocument;
  }

  console.log("matching grade document not found - initializing new grade document");
  return await createGradeDocument(targetClassID, targetStudentID);
};

// ------------add a new record to the grade document for a specified **class and **student
    // -> returns false if assignmentName already exists
const addGradeRecord = async (gradeRecord) => {
  // fetch all records matching selected class and student
  const gradeDocument = await fetchGradeDocument(gradeRecord.classID, gradeRecord.studentID);
  
  if(!gradeDocument) { // error: grade document doesn't exist
    console.log("error: initial grade document was never created")
  }

  // search for record with matching assignment name
  const categoryListName = categoryToProperty[gradeRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryToProperty[gradeRecord.assignmentCategory]];
  const existingRecord = matchingCategoryList.some((record) => (
    record.assignmentName === gradeRecord.assignmentName
  )); 

  if (existingRecord) {
    console.log(`update failed: record with name ${gradeRecord.assignmentName} already exists`);
    return false;
  }
  
  gradeDocument[categoryListName] = [
    ...matchingCategoryList,
    {
      assignmentID: crypto.randomUUID(),
      assignmentName: gradeRecord.assignmentName,
      assignmentGrade: gradeRecord.assignmentGrade
    }
  ]
  await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument)
  return true;

  console.log(`add failed: record with name ${gradeRecord.name} already exists`);
  return false;
}


// ------------update a specified grade record
const updateGradeRecord = async (updatedRecord) => {
  const gradeDocument = await fetchGradeDocument(updatedRecord.classID, updatedRecord.studentID);
  if(!gradeDocument) {
    console.log("error: initial grade document was never created")
    return false;
  }

  const categoryListName = categoryToProperty[updatedRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryListName];
  const categoryUpdated = updatedRecord.assignmentCategory !== updatedRecord.previousCategory;

  // a different record in the target category already uses this name
  const existingRecord = matchingCategoryList.some((record) => (
    categoryUpdated ? 
      (record.assignmentName === updatedRecord.assignmentName)
      :
      (record.assignmentName === updatedRecord.assignmentName
        && record.assignmentID !== updatedRecord.assignmentID)
  ));

  if (existingRecord) {
    console.log(`update failed: record with name ${updatedRecord.assignmentName} already exists`);
    return false;
  }

  const recordToStore = {
    assignmentID: updatedRecord.assignmentID,
    assignmentName: updatedRecord.assignmentName,
    assignmentGrade: updatedRecord.assignmentGrade
  };

  if (categoryUpdated) {
    gradeDocument[categoryListName] = [...matchingCategoryList, recordToStore];

    const previousCategoryListName = categoryToProperty[updatedRecord.previousCategory];
    gradeDocument[previousCategoryListName] = gradeDocument[previousCategoryListName].filter(
      (record) => record.assignmentID !== updatedRecord.assignmentID
    );
  }
  else {
    gradeDocument[categoryListName] = matchingCategoryList.map((record) => (
      record.assignmentID === updatedRecord.assignmentID ? recordToStore : record
    ));
  }

  await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument);
  return true;
}


// ------------delete a specified grade record
const deleteGradeRecord = async (gradeRecord) => {
  console.log(gradeRecord);
  const gradeDocument = await fetchGradeDocument(gradeRecord.classID, gradeRecord.studentID);
  // initial grade document doesn't exist
  if(!gradeDocument) {
    console.log("error: initial grade document was never created")
  }

  // retrieve list of assignments in same category
  const categoryListName = categoryToProperty[gradeRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryToProperty[gradeRecord.assignmentCategory]];

  // delete record with matching ID
  const updatedCategoryList = matchingCategoryList.filter(record => (record.assignmentID !== gradeRecord.assignmentID));
  gradeDocument[categoryListName] = updatedCategoryList

  await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument)
}

export { gradeCategories, gradeCategoryToWeight,
  fetchGradeDocument, createGradeDocument, addGradeRecord, updateGradeRecord, deleteGradeRecord };