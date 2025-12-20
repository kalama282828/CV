# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js/TypeScript project with package.json
  - Configure TypeScript (tsconfig.json)
  - Install dependencies: fast-check, jest, puppeteer (for PDF)
  - Create directory structure: src/, src/models/, src/services/, src/templates/, src/__tests__/
  - _Requirements: All_

- [x] 2. Implement data models and interfaces
  - [x] 2.1 Create CVData interfaces and types
    - Define PersonalInfo, WorkExperience, Education, Skill, CVData interfaces in src/models/types.ts
    - Define ValidationResult, ValidationError interfaces
    - Define CVError and CVErrorType enum
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Implement Serializer service
    - Create src/services/serializer.ts
    - Implement serialize(data: CVData): string function
    - Implement deserialize(json: string): CVData function
    - Implement JSON schema validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.3 Write property test for serialization round-trip
    - **Property 1: Serialization Round Trip**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 2.4 Write property test for invalid JSON rejection
    - **Property 12: Invalid JSON Schema Rejection**
    - **Validates: Requirements 2.4**

- [x] 3. Implement Validator service
  - [x] 3.1 Create Validator implementation
    - Create src/services/validator.ts
    - Implement validateEmail(email: string): boolean
    - Implement validateDateRange(start: string, end: string): boolean
    - Implement validateRequiredFields for each section
    - Implement validate(data: CVData): ValidationResult
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.2 Write property tests for validation
    - **Property 9: Required Field Validation**
    - **Property 10: Date Range Validation**
    - **Property 11: Email Format Validation**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 4. Implement DataManager service
  - [x] 4.1 Create DataManager implementation
    - Create src/services/dataManager.ts
    - Implement load(filePath: string): Promise<CVData>
    - Implement save(filePath: string): Promise<void>
    - Implement update(section, data) method
    - Implement addEntry/removeEntry methods
    - Implement onChange callback registration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Write property tests for data storage
    - **Property 2: Valid CV Data Storage**
    - **Property 3: Skill Categorization Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ATS-compliant templates
  - [x] 6.1 Create base template utilities
    - Create src/templates/utils.ts with helper functions
    - Implement date formatting, section rendering helpers
    - _Requirements: 3.1, 3.3_

  - [x] 6.2 Implement Classic template
    - Create src/templates/classic.ts
    - Implement ATS-friendly HTML structure with inline styles
    - Use standard fonts (Arial, Helvetica), clear section headers
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Implement Modern template
    - Create src/templates/modern.ts
    - Clean, contemporary layout while maintaining ATS compliance
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.4 Implement Minimal template
    - Create src/templates/minimal.ts
    - Stripped-down, text-focused design
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Implement TemplateEngine service
  - [x] 7.1 Create TemplateEngine implementation
    - Create src/services/templateEngine.ts
    - Implement render(data: CVData, template: TemplateName): string
    - Implement renderAll(data: CVData): Map<TemplateName, string>
    - Implement getAvailableTemplates(): TemplateName[]
    - _Requirements: 3.2, 4.1, 4.2, 4.3_

  - [x] 7.2 Write property tests for template rendering
    - **Property 4: Template Rendering Completeness**
    - **Property 5: Section Removal Exclusion**
    - **Property 6: ATS Compliance**
    - **Property 7: Valid HTML Output**
    - **Validates: Requirements 3.2, 3.3, 3.4, 4.2, 4.3**

- [x] 8. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Exporter service
  - [x] 9.1 Create Exporter implementation
    - Create src/services/exporter.ts
    - Implement exportHTML(html, options): Promise<string>
    - Implement exportPDF(html, options): Promise<string> using puppeteer
    - Implement generateFileName(name, template, format): string
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.2 Write property test for filename generation
    - **Property 8: Filename Pattern Compliance**
    - **Validates: Requirements 5.3**

- [x] 10. Implement Preview functionality
  - [x] 10.1 Create Preview service
    - Create src/services/preview.ts
    - Implement preview generation with auto-refresh on data change
    - Wire up DataManager onChange to trigger preview refresh
    - _Requirements: 6.1, 6.3_

- [x] 11. Create main application entry point
  - [x] 11.1 Wire all components together
    - Create src/index.ts as main entry
    - Export all public interfaces and services
    - Create CVGenerator facade class that orchestrates all services
    - _Requirements: All_

  - [x] 11.2 Create CLI interface
    - Create src/cli.ts for command-line usage
    - Implement commands: init, add, update, remove, preview, export
    - _Requirements: All_

- [x] 12. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

