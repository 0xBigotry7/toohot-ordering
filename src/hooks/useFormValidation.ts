import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: unknown): string => {
    const rule = rules[name];
    if (!rule) return '';

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${name} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return '';
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${name} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${name} must be no more than ${rule.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [rules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [values, rules, validateField]);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field when it's touched
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.values(errors).some(error => error !== '')
  };
}

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !value.includes('@')) return 'Please enter a valid email address';
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s-']+$/,
    custom: (value: string) => {
      if (value && value.trim() !== value) return 'Name cannot start or end with spaces';
      return null;
    }
  },
  phone: {
    pattern: /^[\+]?[\d\s\-\(\)]+$/,
    minLength: 10,
    custom: (value: string) => {
      if (value && value.replace(/\D/g, '').length < 10) {
        return 'Phone number must be at least 10 digits';
      }
      return null;
    }
  },
  required: { required: true },
  nonEmpty: {
          custom: (value: unknown) => {
      if (Array.isArray(value) && value.length === 0) return 'At least one item is required';
      return null;
    }
  }
}; 