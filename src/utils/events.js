<<<<<<< HEAD
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

import { db } from '../../firebase.js';

// Mock data for calendar events. For testing/demo purposes
=======
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../../firebase.js';

>>>>>>> 6c9de20 (feat: connected events to firebase)
export const calendarEvents = [
	{
		eventName: 'Library Visit',
		date: '2026-05-05',
		startTime: '9:00 AM',
		endTime: '10:00 AM',
		duration: '1h',
		location: 'Library',
		color: '#11578A',
		description: '',
	},
	{
		eventName: 'Math Check-In',
		date: '2026-05-07',
		startTime: '11:30 AM',
		endTime: '12:00 PM',
		duration: '30m',
		location: 'Room 204',
		color: '#CE2626',
		description: '',
	},
	{
		eventName: 'Science Fair Prep',
		date: '2026-05-20',
		startTime: '2:00 PM',
		endTime: '3:00 PM',
		duration: '1h',
		location: 'Science Lab',
		color: '#4C7F4A',
		description: '',
	},
	{
		eventName: 'Morning Assembly',
		date: '2026-05-20',
		startTime: '8:30 AM',
		endTime: '9:00 AM',
		duration: '30m',
		location: 'Main Hall',
		color: '#11578A',
		description: '',
	},
	{
		eventName: 'Staff Meeting',
		date: '2026-05-20',
		startTime: '3:15 PM',
		endTime: '4:00 PM',
		duration: '45m',
		location: 'Conference Room',
		color: '#CE2626',
		description: '',
	},
	{
		eventName: 'Reading Workshop',
		date: '2026-05-21',
		startTime: '10:00 AM',
		endTime: '11:00 AM',
		duration: '1h',
		location: 'Library',
		color: '#4C7F4A',
		description: '',
	},
	{
		eventName: 'Class Showcase',
		date: '2026-05-22',
		startTime: '1:00 PM',
		endTime: '2:30 PM',
		duration: '1h 30m',
		location: 'Room 101',
		color: '#8A5CF6',
		description: '',
	},
	{
		eventName: 'Science Lab',
		date: '2026-05-26',
		startTime: '9:15 AM',
		endTime: '10:15 AM',
		duration: '1h',
		location: 'Science Lab',
		color: '#11578A',
		description: '',
	},
	{
		eventName: 'Parent Conferences',
		date: '2026-05-27',
		startTime: '4:00 PM',
		endTime: '6:00 PM',
		duration: '2h',
		location: 'Multiple Rooms',
		color: '#CE2626',
		description: '',
	},
	{
		eventName: 'Field Trip',
		date: '2026-05-29',
		startTime: '8:45 AM',
		endTime: '2:00 PM',
		duration: '5h 15m',
		location: 'City Museum',
		color: '#4C7F4A',
		description: '',
	},
	{
		eventName: 'Report Cards Due',
		date: '2026-06-02',
		startTime: '12:00 PM',
		endTime: '1:00 PM',
		duration: '1h',
		location: 'Admin Office',
		color: '#8A5CF6',
		description: '',
	},
];

<<<<<<< HEAD
// Helper function to convert time string to minutes for duration calculation
const parseTimeToMinutes = (timeStr) => {
	const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
 	if (!match) return 0;
 	let [, h, m, period] = match;
 	h = Number(h);
 	m = Number(m);
 	if (/pm/i.test(period) && h !== 12) h += 12;
 	if (/am/i.test(period) && h === 12) h = 0;
 	return h * 60 + m;
};

// Helper function to compute duration string from start and end times
const computeDurationStr = (start, end) => {
 	const diff = parseTimeToMinutes(end) - parseTimeToMinutes(start);
 	if (diff <= 0) return '0m';
 	const hrs = Math.floor(diff / 60);
 	const mins = diff % 60;
 	return `${hrs > 0 ? `${hrs}h${mins > 0 ? ' ' : ''}` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
};


// Generate Firestore-safe document ID based on event properties
// Helpful for insert/delete operations
export const makeEventDocId = (eventItem) => `${eventItem.date}-${(eventItem.eventName || eventItem.title)}-${eventItem.startTime}`
=======
const makeEventDocId = (eventItem) => `${eventItem.date}-${eventItem.title}-${eventItem.startTime}`
>>>>>>> 6c9de20 (feat: connected events to firebase)
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-+|-+$/g, '');

<<<<<<< HEAD
// Update existing events or insert new events in the in-memory array (not the Firebase collection)
const upsertCalendarEventInMemory = (eventItem, docId) => {
	const nextEvent = { ...eventItem, docId };
	const existingIndex = calendarEvents.findIndex((calendarEvent) => makeEventDocId(calendarEvent) === docId);

	if (existingIndex >= 0) {
		calendarEvents[existingIndex] = nextEvent;
	} else {
		calendarEvents.push(nextEvent);
	}

	return nextEvent;
};

// Delete events from the in-memory array (not the Firebase collection)
const removeCalendarEventInMemory = (docId) => {
	const existingIndex = calendarEvents.findIndex((calendarEvent) => makeEventDocId(calendarEvent) === docId);

	if (existingIndex >= 0) {
		calendarEvents.splice(existingIndex, 1);
	}
};


// Upsert (update or insert) a calendar event in Firebase and in-memory array
export const saveCalendarEvent = async (eventItem, docId = makeEventDocId(eventItem)) => {
	await setDoc(doc(db, 'events', docId), eventItem);
	return upsertCalendarEventInMemory(eventItem, docId);
};

// Delete a calendar event from Firebase and in-memory array
export const deleteCalendarEvent = async (eventItem, docId = makeEventDocId(eventItem)) => {
	await deleteDoc(doc(db, 'events', docId));
	removeCalendarEventInMemory(docId);
	return docId;
};

// Seed the Firebase collection with the mock calendar events (for testing/demo purposes)
// Can be commented out after demo/testing to avoid duplicate entries on every app start
=======
>>>>>>> 6c9de20 (feat: connected events to firebase)
const seedCalendarEvents = async () => {
	await Promise.all(
		calendarEvents.map((eventItem) => setDoc(doc(db, 'events', makeEventDocId(eventItem)), eventItem)),
	);
};

void seedCalendarEvents();
