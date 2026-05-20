import { doc, setDoc } from 'firebase/firestore';

import { db } from '../../firebase.js';

// Mock data for calendar events. For testing/demo purposes
=======
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../../firebase.js';

>>>>>>> 21defa2 (feat: connected events to firebase)
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

const makeEventDocId = (eventItem) => `${eventItem.date}-${eventItem.title}-${eventItem.startTime}`
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-+|-+$/g, '');

const seedCalendarEvents = async () => {
	await Promise.all(
		calendarEvents.map((eventItem) => setDoc(doc(db, 'events', makeEventDocId(eventItem)), eventItem)),
	);
};

void seedCalendarEvents();
