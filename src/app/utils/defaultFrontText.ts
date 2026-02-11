import type { FrontSideText } from './templateData';

/**
 * DEFAULT FRONT SIDE FIELD LABELS
 * 
 * These are the default labels used for fields on the front side of ID cards.
 * Users can customize these labels via the "Edit Front Side Labels" feature in Templates.
 * 
 * CUSTOMIZABLE FIELD (field1):
 * - Default: 'Website'
 * - Common alternatives: 'Designation', 'Department', 'Email', 'Location', 'Branch'
 * - Can be enabled/disabled via field1Enabled
 * 
 * USAGE:
 * - Used in forms for data entry
 * - Used in ID card previews
 * - Used in bulk upload templates
 * - Stored per template in template.frontText
 */
export const DEFAULT_FRONT_TEXT: FrontSideText = {
  mobileLabel: 'Mobile No.',
  bloodGroupLabel: 'Blood Group',
  field1Label: 'Website',  // Customizable field (can be changed to Designation, Department, etc.)
  field1Enabled: true,
  joiningDateLabel: 'Joining Date',
  validTillLabel: 'Valid Till',
};
