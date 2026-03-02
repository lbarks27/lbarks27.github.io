// scripts/issues-to-ical.js
// Generates an iCal file (issues.ics) from GitHub issues using the REST API

const fs = require('fs');
const fetch = require('node-fetch');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

if (!GITHUB_TOKEN || !REPO) {
  console.error('Missing GITHUB_TOKEN or GITHUB_REPOSITORY');
  process.exit(1);
}

const [owner, repo] = REPO.split('/');

async function fetchIssues() {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`;
  const res = await fetch(url, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

function toICalDate(dateStr) {
  return dateStr.replace(/[-:]/g, '').replace(/\..+/, 'Z');
}

function issuesToICal(issues) {
  let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GitHub Issues iCal//EN\n';
  for (const issue of issues) {
    if (issue.pull_request) continue; // skip PRs
    const created = toICalDate(issue.created_at);
    const updated = toICalDate(issue.updated_at);
    ical += 'BEGIN:VEVENT\n';
    ical += `UID:${issue.id}@github.com\n`;
    ical += `DTSTAMP:${created}\n`;
    ical += `DTSTART:${created}\n`;
    ical += `SUMMARY:Issue #${issue.number}: ${issue.title}\n`;
    ical += `DESCRIPTION:${issue.html_url}\\n${issue.body ? issue.body.replace(/\n/g, '\\n') : ''}\n`;
    ical += `LAST-MODIFIED:${updated}\n`;
    ical += 'END:VEVENT\n';
  }
  ical += 'END:VCALENDAR\n';
  return ical;
}

(async () => {
  try {
    const issues = await fetchIssues();
    const ical = issuesToICal(issues);
    fs.writeFileSync('issues.ics', ical);
    console.log('issues.ics generated.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
