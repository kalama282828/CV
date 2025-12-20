// Classic Template - ATS Compliant
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
  header: 'text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;',
  name: 'font-family: Arial, Helvetica, sans-serif; font-size: 28px; margin: 0 0 10px 0; color: #333;',
  contact: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #666; margin: 0;',
  section: 'margin-bottom: 20px;',
  sectionTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;',
  entry: 'margin-bottom: 15px;',
  entryHeader: 'display: flex; justify-content: space-between; align-items: baseline;',
  entryTitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333;',
  entryDate: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #666;',
  entrySubtitle: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #666; margin-top: 2px;',
  text: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; line-height: 1.5;',
  list: 'margin: 5px 0 0 20px; padding: 0;',
  listItem: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; margin-bottom: 3px;',
  skillCategory: 'font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; margin-bottom: 5px;'
};

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.4; color: #333; background: #fff; }
  .cv-container { max-width: 800px; margin: 0 auto; padding: 40px; }
`;

export function renderClassic(data: CVData): string {
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
