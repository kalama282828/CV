// Template Utilities
// Requirements: 3.1, 3.3

import { CVData, WorkExperience, Education, Skill } from '../models/types';

export function formatDate(dateStr: string): string {
  if (dateStr === 'present') return 'Present';
  
  const [year, month] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  
  return `${monthNames[monthIndex]} ${year}`;
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

export function renderPersonalInfo(data: CVData, styles: Record<string, string>): string {
  const { name, email, phone, location, linkedin, website } = data.personalInfo;
  
  const contactParts = [
    escapeHtml(email),
    escapeHtml(phone),
    escapeHtml(location)
  ];
  
  if (linkedin) contactParts.push(escapeHtml(linkedin));
  if (website) contactParts.push(escapeHtml(website));
  
  return `
    <div style="${styles.header}">
      <h1 style="${styles.name}">${escapeHtml(name)}</h1>
      <p style="${styles.contact}">${contactParts.join(' | ')}</p>
    </div>
  `;
}

export function renderSummary(summary: string | undefined, styles: Record<string, string>): string {
  if (!summary) return '';
  
  return `
    <div style="${styles.section}">
      <h2 style="${styles.sectionTitle}">Professional Summary</h2>
      <p style="${styles.text}">${escapeHtml(summary)}</p>
    </div>
  `;
}

export function renderWorkExperience(experiences: WorkExperience[], styles: Record<string, string>): string {
  if (experiences.length === 0) return '';
  
  const items = experiences.map(exp => `
    <div style="${styles.entry}">
      <div style="${styles.entryHeader}">
        <strong style="${styles.entryTitle}">${escapeHtml(exp.title)}</strong>
        <span style="${styles.entryDate}">${formatDateRange(exp.startDate, exp.endDate)}</span>
      </div>
      <div style="${styles.entrySubtitle}">${escapeHtml(exp.company)}${exp.location ? ` | ${escapeHtml(exp.location)}` : ''}</div>
      ${exp.description.length > 0 ? `
        <ul style="${styles.list}">
          ${exp.description.map(d => `<li style="${styles.listItem}">${escapeHtml(d)}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <div style="${styles.section}">
      <h2 style="${styles.sectionTitle}">Work Experience</h2>
      ${items}
    </div>
  `;
}

export function renderEducation(education: Education[], styles: Record<string, string>): string {
  if (education.length === 0) return '';
  
  const items = education.map(edu => `
    <div style="${styles.entry}">
      <div style="${styles.entryHeader}">
        <strong style="${styles.entryTitle}">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</strong>
        <span style="${styles.entryDate}">${formatDateRange(edu.startDate, edu.endDate)}</span>
      </div>
      <div style="${styles.entrySubtitle}">${escapeHtml(edu.institution)}${edu.gpa ? ` | GPA: ${escapeHtml(edu.gpa)}` : ''}</div>
    </div>
  `).join('');
  
  return `
    <div style="${styles.section}">
      <h2 style="${styles.sectionTitle}">Education</h2>
      ${items}
    </div>
  `;
}

export function renderSkills(skills: Skill[], styles: Record<string, string>): string {
  if (skills.length === 0) return '';
  
  const grouped: Record<string, Skill[]> = {
    technical: [],
    soft: [],
    language: [],
    other: []
  };
  
  skills.forEach(skill => {
    grouped[skill.category].push(skill);
  });
  
  const categoryLabels: Record<string, string> = {
    technical: 'Technical Skills',
    soft: 'Soft Skills',
    language: 'Languages',
    other: 'Other Skills'
  };
  
  const sections = Object.entries(grouped)
    .filter(([_, skills]) => skills.length > 0)
    .map(([category, skills]) => `
      <div style="${styles.skillCategory}">
        <strong>${categoryLabels[category]}:</strong> ${skills.map(s => escapeHtml(s.name)).join(', ')}
      </div>
    `).join('');
  
  return `
    <div style="${styles.section}">
      <h2 style="${styles.sectionTitle}">Skills</h2>
      ${sections}
    </div>
  `;
}

export function renderCertifications(certs: string[] | undefined, styles: Record<string, string>): string {
  if (!certs || certs.length === 0) return '';
  
  return `
    <div style="${styles.section}">
      <h2 style="${styles.sectionTitle}">Certifications</h2>
      <ul style="${styles.list}">
        ${certs.map(c => `<li style="${styles.listItem}">${escapeHtml(c)}</li>`).join('')}
      </ul>
    </div>
  `;
}

export function wrapHtml(content: string, title: string, baseStyles: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - CV</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="cv-container">
    ${content}
  </div>
</body>
</html>`;
}
