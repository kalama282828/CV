// Minimal Template - ATS Compliant
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
  header: 'margin-bottom: 20px;',
  name: 'font-family: Arial, Helvetica, sans-serif; font-size: 24px; margin: 0 0 8px 0; color: #000;',
  contact: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #444; margin: 0;',
  section: 'margin-bottom: 18px;',
  sectionTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;',
  entry: 'margin-bottom: 12px;',
  entryHeader: 'display: flex; justify-content: space-between; align-items: baseline;',
  entryTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000; font-weight: bold;',
  entryDate: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #666;',
  entrySubtitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #444; margin-top: 2px;',
  text: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; line-height: 1.4;',
  list: 'margin: 4px 0 0 16px; padding: 0;',
  listItem: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; margin-bottom: 2px;',
  skillCategory: 'font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; margin-bottom: 4px;'
};

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.3; color: #000; background: #fff; }
  .cv-container { max-width: 800px; margin: 0 auto; padding: 30px; }
`;

export function renderMinimal(data: CVData): string {
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
