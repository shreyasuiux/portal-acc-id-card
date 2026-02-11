import type { Template } from './templateData';
import { templates } from './templateData';

/**
 * ORIGINAL TEMPLATE - Cannot be deleted, always recoverable
 * This is the default company template based on logo and brand colors
 */
export const ORIGINAL_TEMPLATE = templates[0]; // Modern Minimal is the original

/**
 * Local Storage Keys
 */
const SELECTED_TEMPLATE_KEY = 'hr_idcard_selected_template';
const CUSTOM_TEMPLATES_KEY = 'hr_idcard_custom_templates';

/**
 * Get the currently selected template
 * Falls back to ORIGINAL_TEMPLATE if none is selected
 */
export function getSelectedTemplate(): Template {
  try {
    const saved = localStorage.getItem(SELECTED_TEMPLATE_KEY);
    if (saved) {
      const template = JSON.parse(saved);
      // Validate template structure
      if (template && template.id && template.front && template.back) {
        return template;
      }
    }
  } catch (error) {
    console.error('Error loading selected template:', error);
  }
  return ORIGINAL_TEMPLATE;
}

/**
 * Set the currently selected template
 */
export function setSelectedTemplate(template: Template): void {
  try {
    localStorage.setItem(SELECTED_TEMPLATE_KEY, JSON.stringify(template));
    console.log('✓ Template saved:', template.name);
  } catch (error) {
    console.error('Error saving selected template:', error);
  }
}

/**
 * Reset to the original template
 */
export function resetToOriginalTemplate(): Template {
  setSelectedTemplate(ORIGINAL_TEMPLATE);
  console.log('✓ Reset to original template');
  return ORIGINAL_TEMPLATE;
}

/**
 * Get all custom templates (uploaded by user)
 */
export function getCustomTemplates(): Template[] {
  try {
    const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading custom templates:', error);
  }
  return [];
}

/**
 * Save a custom template
 */
export function saveCustomTemplate(template: Template): void {
  try {
    const customTemplates = getCustomTemplates();
    const updatedTemplates = [...customTemplates, template];
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    console.log('✓ Custom template saved:', template.name);
  } catch (error) {
    console.error('Error saving custom template:', error);
    throw error;
  }
}

/**
 * Delete a custom template
 */
export function deleteCustomTemplate(templateId: string): void {
  try {
    const customTemplates = getCustomTemplates();
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    console.log('✓ Custom template deleted:', templateId);
  } catch (error) {
    console.error('Error deleting custom template:', error);
    throw error;
  }
}

/**
 * Get all templates (predefined + custom)
 */
export function getAllTemplates(): Template[] {
  const customTemplates = getCustomTemplates();
  return [...templates, ...customTemplates];
}

/**
 * Check if the current template is the original template
 */
export function isOriginalTemplate(template: Template): boolean {
  return template.id === ORIGINAL_TEMPLATE.id;
}

/**
 * Clear all template data (for testing/reset)
 */
export function clearAllTemplateData(): void {
  localStorage.removeItem(SELECTED_TEMPLATE_KEY);
  localStorage.removeItem(CUSTOM_TEMPLATES_KEY);
  console.log('✓ All template data cleared');
}
