#!/usr/bin/env node
// ATS CV Generator CLI
// Requirements: All

import * as fs from 'fs/promises';
import * as path from 'path';
import { CVGenerator, CVData, TemplateName } from './index';

const COMMANDS = {
  init: 'Create a new CV data file',
  add: 'Add entry (experience, education, skill)',
  update: 'Update personal info or summary',
  remove: 'Remove an entry',
  preview: 'Preview CV in terminal',
  export: 'Export CV to HTML or PDF',
  validate: 'Validate CV data',
  help: 'Show help'
};

function printHelp(): void {
  console.log('\nATS CV Generator - Command Line Interface\n');
  console.log('Usage: cv-gen <command> [options]\n');
  console.log('Commands:');
  Object.entries(COMMANDS).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(12)} ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  cv-gen init cv-data.json');
  console.log('  cv-gen export cv-data.json --template classic --format html --output ./output');
  console.log('  cv-gen validate cv-data.json');
}

async function initCommand(filePath: string): Promise<void> {
  const sampleData: CVData = {
    personalInfo: {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+1 234 567 8900',
      location: 'City, Country'
    },
    summary: 'A brief professional summary about yourself.',
    workExperience: [
      {
        id: '1',
        company: 'Company Name',
        title: 'Job Title',
        startDate: '2020-01',
        endDate: 'present',
        description: ['Key achievement or responsibility']
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University Name',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-06'
      }
    ],
    skills: [
      { name: 'JavaScript', category: 'technical' },
      { name: 'Communication', category: 'soft' }
    ]
  };

  await fs.writeFile(filePath, JSON.stringify(sampleData, null, 2));
  console.log(`Created CV data file: ${filePath}`);
  console.log('Edit this file to add your information, then use "export" to generate your CV.');
}

async function exportCommand(
  filePath: string,
  template: TemplateName,
  format: 'html' | 'pdf',
  outputDir: string
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data: CVData = JSON.parse(content);
  
  const generator = new CVGenerator(data);
  const validation = generator.validate();
  
  if (!validation.valid) {
    console.error('Validation errors:');
    validation.errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });
  
  if (format === 'html') {
    const outputPath = await generator.exportHTML(outputDir, template);
    console.log(`Exported HTML: ${outputPath}`);
  } else {
    const outputPath = await generator.exportPDF(outputDir, template);
    console.log(`Exported PDF: ${outputPath}`);
  }
  
  generator.dispose();
}

async function validateCommand(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data: CVData = JSON.parse(content);
  
  const generator = new CVGenerator(data);
  const validation = generator.validate();
  
  if (validation.valid) {
    console.log('✓ CV data is valid');
  } else {
    console.error('✗ Validation errors:');
    validation.errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
    process.exit(1);
  }
  
  generator.dispose();
}

async function previewCommand(filePath: string, template: TemplateName): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data: CVData = JSON.parse(content);
  
  const generator = new CVGenerator(data);
  const html = generator.render(template);
  
  // Simple text preview - strip HTML tags
  const textPreview = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  console.log(`\n=== CV Preview (${template} template) ===\n`);
  console.log(textPreview);
  
  generator.dispose();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    printHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'init': {
        const filePath = args[1] || 'cv-data.json';
        await initCommand(filePath);
        break;
      }
      
      case 'export': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: Please provide a CV data file path');
          process.exit(1);
        }
        
        const templateIdx = args.indexOf('--template');
        const template = (templateIdx > -1 ? args[templateIdx + 1] : 'classic') as TemplateName;
        
        const formatIdx = args.indexOf('--format');
        const format = (formatIdx > -1 ? args[formatIdx + 1] : 'html') as 'html' | 'pdf';
        
        const outputIdx = args.indexOf('--output');
        const outputDir = outputIdx > -1 ? args[outputIdx + 1] : './output';
        
        await exportCommand(filePath, template, format, outputDir);
        break;
      }
      
      case 'validate': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: Please provide a CV data file path');
          process.exit(1);
        }
        await validateCommand(filePath);
        break;
      }
      
      case 'preview': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: Please provide a CV data file path');
          process.exit(1);
        }
        const templateIdx = args.indexOf('--template');
        const template = (templateIdx > -1 ? args[templateIdx + 1] : 'classic') as TemplateName;
        await previewCommand(filePath, template);
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
