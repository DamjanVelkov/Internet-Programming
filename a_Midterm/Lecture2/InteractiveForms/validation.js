// Form validation JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Get form and form elements
    const form = document.getElementById('user-form');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const successMessage = document.getElementById('success-message');
    const bioTextarea = document.getElementById('bio');
    const bioCounter = document.getElementById('bio-count');
    
    // Validation rules
    const validationRules = {
        firstName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'First name must contain only letters and be at least 2 characters long'
        },
        lastName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Last name must contain only letters and be at least 2 characters long'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: false,
            pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number'
        },
        birthDate: {
            required: true,
            customValidation: validateAge,
            message: 'You must be at least 13 years old'
        },
        username: {
            required: true,
            minLength: 3,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9_]+$/,
            message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
        },
        password: {
            required: true,
            minLength: 8,
            customValidation: validatePassword,
            message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        },
        confirmPassword: {
            required: true,
            customValidation: validatePasswordMatch,
            message: 'Passwords do not match'
        },
        website: {
            required: false,
            pattern: /^https?:\/\/.+\..+/,
            message: 'Please enter a valid URL starting with http:// or https://'
        },
        terms: {
            required: true,
            message: 'You must agree to the terms and conditions'
        }
    };
    
    // Custom validation functions
    function validateAge(value) {
        if (!value) return false;
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 13;
    }
    
    function validatePassword(value) {
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    }
    
    function validatePasswordMatch(value) {
        const password = document.getElementById('password').value;
        return value === password;
    }
    
    function validateInterests() {
        const checkboxes = document.querySelectorAll('input[name="interests"]:checked');
        return checkboxes.length > 0;
    }
    
    // Validation function
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = validationRules[fieldName];
        const errorElement = document.getElementById(fieldName + '-error');
        
        if (!rules) return true;
        
        // Clear previous error
        clearError(field, errorElement);
        
        // Required field validation
        if (rules.required && !value) {
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    showError(field, errorElement, rules.message);
                    return false;
                }
            } else {
                showError(field, errorElement, 'This field is required');
                return false;
            }
        }
        
        // Skip other validations if field is empty and not required
        if (!value && !rules.required) {
            return true;
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            showError(field, errorElement, `Minimum ${rules.minLength} characters required`);
            return false;
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            showError(field, errorElement, `Maximum ${rules.maxLength} characters allowed`);
            return false;
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            showError(field, errorElement, rules.message);
            return false;
        }
        
        // Custom validation
        if (rules.customValidation && !rules.customValidation(value)) {
            showError(field, errorElement, rules.message);
            return false;
        }
        
        // If all validations pass
        field.classList.add('valid');
        return true;
    }
    
    // Special validation for interests
    function validateInterestsField() {
        const errorElement = document.getElementById('interests-error');
        const isValid = validateInterests();
        
        if (!isValid) {
            errorElement.textContent = 'Please select at least one interest';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    // Show error function
    function showError(field, errorElement, message) {
        field.classList.remove('valid');
        field.classList.add('invalid');
        errorElement.textContent = message;
    }
    
    // Clear error function
    function clearError(field, errorElement) {
        field.classList.remove('invalid');
        errorElement.textContent = '';
    }
    
    // Validate entire form
    function validateForm() {
        let isValid = true;
        
        // Validate all fields with rules
        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                if (!validateField(field)) {
                    isValid = false;
                }
            }
        });
        
        // Validate interests separately
        if (!validateInterestsField()) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Update character counter for bio
    function updateBioCounter() {
        const count = bioTextarea.value.length;
        bioCounter.textContent = count;
        
        if (count > 450) {
            bioCounter.style.color = '#dc3545';
        } else if (count > 400) {
            bioCounter.style.color = '#ffc107';
        } else {
            bioCounter.style.color = '#6c757d';
        }
    }
    
    // Simulate form submission
    function submitForm(formData) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                console.log('Form submitted with data:', formData);
                resolve(true);
            }, 2000);
        });
    }
    
    // Event listeners
    
    // Real-time validation for all form fields
    form.addEventListener('input', function(e) {
        const field = e.target;
        
        // Special handling for bio character counter
        if (field.id === 'bio') {
            updateBioCounter();
        }
        
        // Validate field on input
        if (validationRules[field.name]) {
            validateField(field);
        }
        
        // Re-validate confirm password when password changes
        if (field.id === 'password') {
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword.value) {
                validateField(confirmPassword);
            }
        }
    });
    
    // Validation on blur (when field loses focus)
    form.addEventListener('blur', function(e) {
        const field = e.target;
        if (validationRules[field.name]) {
            validateField(field);
        }
    }, true);
    
    // Validate interests when checkboxes change
    document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
        checkbox.addEventListener('change', validateInterestsField);
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate entire form
        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        try {
            // Submit form (simulated)
            await submitForm(data);
            
            // Hide form and show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            successMessage.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred while submitting the form. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
    
    // Reset form
    resetBtn.addEventListener('click', function() {
        // Clear all validation states
        document.querySelectorAll('.valid, .invalid').forEach(field => {
            field.classList.remove('valid', 'invalid');
        });
        
        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
        
        // Reset bio counter
        bioCounter.textContent = '0';
        bioCounter.style.color = '#6c757d';
        
        // Hide success message and show form
        successMessage.classList.add('hidden');
        form.style.display = 'block';
    });
    
    // Initialize bio counter
    updateBioCounter();
    
    // Add some helpful console messages
    console.log('Form validation initialized');
    console.log('Available validation rules:', Object.keys(validationRules));
    
    // Demo function to show validation in action
    window.demoValidation = function() {
        console.log('Running validation demo...');
        
        // Fill form with sample data
        document.getElementById('firstName').value = 'John';
        document.getElementById('lastName').value = 'Doe';
        document.getElementById('email').value = 'john.doe@example.com';
        document.getElementById('phone').value = '+389 70 123 456';
        document.getElementById('birthDate').value = '1990-01-01';
        document.getElementById('username').value = 'johndoe123';
        document.getElementById('password').value = 'SecurePass123!';
        document.getElementById('confirmPassword').value = 'SecurePass123!';
        document.getElementById('website').value = 'https://johndoe.com';
        document.getElementById('bio').value = 'I am a software developer passionate about web technologies.';
        document.getElementById('newsletter').checked = true;
        document.getElementById('terms').checked = true;
        document.querySelector('input[name="interests"][value="programming"]').checked = true;
        
        // Trigger validation
        validateForm();
        updateBioCounter();
        
        console.log('Demo data filled and validated');
    };
    
});