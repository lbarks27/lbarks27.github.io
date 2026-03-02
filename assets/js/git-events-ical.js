// GitEvents iCal Generator
// Fetches recent GitHub events and generates an iCal (.ics) file for download

// CONFIGURATION: Set your GitHub username and repo here
const GITHUB_USER = 'lbarks27';
const GITHUB_REPO = 'lbarks27.github.io';

// Fetch recent events from GitHub API
async function fetchGitHubEvents() {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/events`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch GitHub events');
    return response.json();
}

// Convert GitHub events to iCal format
function eventsToICal(events) {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GitEvents iCal Generator//EN\n';
    events.forEach(event => {
        const dt = new Date(event.created_at);
        const dtstamp = dt.toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
        const summary = `${event.type} by ${event.actor.login}`;
        const description = event.payload.commits ? event.payload.commits.map(c => c.message).join('; ') : '';
        ical += `BEGIN:VEVENT\n`;
        ical += `UID:${event.id}@github.com\n`;
        ical += `DTSTAMP:${dtstamp}\n`;
        ical += `DTSTART:${dtstamp}\n`;
        ical += `SUMMARY:${summary}\n`;
        if (description) ical += `DESCRIPTION:${description}\n`;
        ical += `END:VEVENT\n`;
    });
    ical += 'END:VCALENDAR';
    return ical;
}

// Trigger download of the iCal file
function downloadICal(icalData, filename = 'gitevents.ics') {
    const blob = new Blob([icalData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Main function to fetch events and download iCal
async function generateGitEventsICal() {
    try {
        const events = await fetchGitHubEvents();
        const ical = eventsToICal(events);
        downloadICal(ical);
    } catch (err) {
        alert('Error generating iCal: ' + err.message);
    }
}

// Optionally, attach to a button with id 'download-ical-btn'
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('download-ical-btn');
    if (btn) {
        btn.addEventListener('click', generateGitEventsICal);
    }
});
