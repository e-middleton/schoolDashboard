import { doc, setDoc } from 'firebase/firestore';

import { db } from '../../firebase.js';

export const calendarEvents = [
	{
		title: 'Morning Assembly',
		date: '2026-05-20',
		startTime: '8:30 AM',
		endTime: '9:00 AM',
		location: 'Main Hall',
		color: '#11578A',
	},
	{
		title: 'Staff Meeting',
		date: '2026-05-20',
		startTime: '3:15 PM',
		endTime: '4:00 PM',
		location: 'Conference Room',
		color: '#CE2626',
	},
	{
		title: 'Reading Workshop',
		date: '2026-05-21',
		startTime: '10:00 AM',
		endTime: '11:00 AM',
		location: 'Library',
		color: '#4C7F4A',
	},
	{
		title: 'Class Showcase',
		date: '2026-05-22',
		startTime: '1:00 PM',
		endTime: '2:30 PM',
		location: 'Room 101',
		color: '#8A5CF6',
	},
	{
		title: 'Science Lab',
		date: '2026-05-26',
		startTime: '9:15 AM',
		endTime: '10:15 AM',
		location: 'Science Lab',
		color: '#11578A',
	},
	{
		title: 'Parent Conferences',
		date: '2026-05-27',
		startTime: '4:00 PM',
		endTime: '6:00 PM',
		location: 'Multiple Rooms',
		color: '#CE2626',
	},
	{
		title: 'Field Trip',
		date: '2026-05-29',
		startTime: '8:45 AM',
		endTime: '2:00 PM',
		location: 'City Museum',
		color: '#4C7F4A',
	},
	{
		title: 'Report Cards Due',
		date: '2026-06-02',
		startTime: '12:00 PM',
		endTime: '1:00 PM',
		location: 'Admin Office',
		color: '#8A5CF6',
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
