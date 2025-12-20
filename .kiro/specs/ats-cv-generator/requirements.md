# Requirements Document

## Introduction

Bu sistem, kullanıcıların CV bilgilerini merkezi bir veri kaynağında yönetmelerini ve bu bilgileri ATS (Applicant Tracking System) standartlarına uygun birden fazla şablonda otomatik olarak güncellemelerini sağlar. Kullanıcı bilgi eklediğinde, değiştirdiğinde veya sildiğinde tüm CV şablonları otomatik olarak güncellenir.

## Glossary

- **ATS (Applicant Tracking System)**: İşverenlerin özgeçmişleri taramak ve filtrelemek için kullandığı yazılım sistemi
- **CV_Data**: Kullanıcının tüm özgeçmiş bilgilerini içeren merkezi veri yapısı
- **CV_Template**: ATS uyumlu özgeçmiş tasarım şablonu
- **CV_Generator**: CV_Data'yı alıp şablonlara dönüştüren sistem bileşeni
- **Section**: CV'nin bir bölümü (deneyim, eğitim, beceriler vb.)

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to store my CV information in a central data source, so that I can manage all my information from one place.

#### Acceptance Criteria

1. WHEN a user enters personal information (name, email, phone, location) THEN the CV_Generator SHALL store the information in CV_Data structure
2. WHEN a user adds a work experience entry THEN the CV_Generator SHALL validate required fields (company, title, dates) and store the entry
3. WHEN a user adds an education entry THEN the CV_Generator SHALL validate required fields (institution, degree, dates) and store the entry
4. WHEN a user adds skills THEN the CV_Generator SHALL categorize and store the skills in CV_Data
5. WHEN a user modifies any CV_Data field THEN the CV_Generator SHALL update the stored data immediately

### Requirement 2

**User Story:** As a job seeker, I want my CV data to be serialized and deserialized reliably, so that I can save and load my information without data loss.

#### Acceptance Criteria

1. WHEN CV_Data is saved to storage THEN the CV_Generator SHALL serialize the data to JSON format
2. WHEN CV_Data is loaded from storage THEN the CV_Generator SHALL deserialize the JSON and reconstruct the CV_Data structure
3. WHEN serializing CV_Data THEN the CV_Generator SHALL preserve all field values and data types exactly
4. WHEN deserializing CV_Data THEN the CV_Generator SHALL validate the JSON structure against the expected schema

### Requirement 3

**User Story:** As a job seeker, I want multiple ATS-compliant CV templates, so that I can choose the best format for different job applications.

#### Acceptance Criteria

1. WHEN the CV_Generator initializes THEN the system SHALL provide at least three ATS-compliant templates (classic, modern, minimal)
2. WHEN a template is selected THEN the CV_Generator SHALL render CV_Data using that template's structure
3. WHEN rendering a template THEN the CV_Generator SHALL use ATS-friendly formatting (standard fonts, no tables, no graphics, clear section headers)
4. WHEN rendering a template THEN the CV_Generator SHALL output valid HTML that can be converted to PDF

### Requirement 4

**User Story:** As a job seeker, I want all my CV templates to update automatically when I change my data, so that I don't have to manually update each version.

#### Acceptance Criteria

1. WHEN CV_Data is modified THEN the CV_Generator SHALL trigger regeneration of all active templates
2. WHEN a section is added to CV_Data THEN the CV_Generator SHALL include the new section in all template outputs
3. WHEN a section is removed from CV_Data THEN the CV_Generator SHALL exclude the removed section from all template outputs
4. WHEN regenerating templates THEN the CV_Generator SHALL complete the update within 2 seconds

### Requirement 5

**User Story:** As a job seeker, I want to export my CV in multiple formats, so that I can submit applications in the required format.

#### Acceptance Criteria

1. WHEN a user requests HTML export THEN the CV_Generator SHALL produce a valid HTML file with inline styles
2. WHEN a user requests PDF export THEN the CV_Generator SHALL convert the HTML output to a PDF document
3. WHEN exporting THEN the CV_Generator SHALL name the file using the pattern "{name}_{template}_{date}.{format}"

### Requirement 6

**User Story:** As a job seeker, I want to preview my CV before exporting, so that I can verify the content and formatting.

#### Acceptance Criteria

1. WHEN a user requests preview THEN the CV_Generator SHALL render the selected template with current CV_Data
2. WHEN previewing THEN the CV_Generator SHALL display the output in a readable format
3. WHEN CV_Data changes during preview THEN the CV_Generator SHALL refresh the preview automatically

### Requirement 7

**User Story:** As a job seeker, I want the system to validate my CV data, so that I can ensure completeness before applying.

#### Acceptance Criteria

1. WHEN validating CV_Data THEN the CV_Generator SHALL check for required sections (personal info, at least one experience or education)
2. WHEN a required field is missing THEN the CV_Generator SHALL report the specific missing field
3. WHEN date ranges are invalid (end before start) THEN the CV_Generator SHALL report the validation error
4. WHEN email format is invalid THEN the CV_Generator SHALL report the format error

