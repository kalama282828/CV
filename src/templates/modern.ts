// Modern Template - ATS Compliant
// Requirements: 3.1, 3.2, 3.3, 3.4

import { CVData } from '../models/types';
import {
  renderPersonalInfo,
  renderSummary,
  renderWorkExperience,
  renderEducation,
  renderSkills,
  renderCertifications,
  wrapHtml
} from './utils';

const styles: Record<string, string> = {
  header: 'margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #2563eb;',
  name: 'font-family: Arial, Helvetica, sans-serif; font-size: 32px; margin: 0 0 10px 0; color: #1e3a5f;',
  contact: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #4b5563; margin: 0;',
  section: 'margin-bottom: 25px;',
  sectionTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 18px; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb;',
  entry: 'margin-bottom: 18px;',
  entryHeader: 'display: flex; justify-content: space-between; align-items: baseline;',
  entryTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1e3a5f; font-weight: bold;',
  entryDate: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #6b7280; font-style: italic;',
  entrySubtitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #4b5563; margin-top: 3px;',
  text: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #374151; line-height: 1.6;',
  list: 'margin: 8px 0 0 20px; padding: 0;',
  listItem: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #374151; margin-bottom: 4px;',
  skillCategory: 'font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #374151; margin-bottom: 6px;'
};

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #374151; background: #fff; }
  .cv-container { max-width: 800px; margin: 0 auto; padding: 45px; }
`;

export function renderModern(data: CVData): string {
  const content = [
    renderPersonalInfo(data, styles),
    renderSummary(data.summary, styles),
    renderWorkExperience(data.workExperience, styles),
    renderEducation(data.education, styles),
    renderSkills(data.skills, styles),
    renderCertifications(data.certifications, styles)
  ].join('');

  return wrapHtml(content, data.personalInfo.name, baseStyles);
}
