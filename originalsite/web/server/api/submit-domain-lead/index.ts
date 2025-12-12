import { readBody } from 'h3';

export default defineEventHandler(async (e) => {
    const config = useRuntimeConfig();
    const backendUrl = config.private.backendUrl;

    // Read the POST body
    let body;
    try {
        body = await readBody(e);
    } catch (error) {
        return {
            error: 'Invalid request body',
            status: 'error'
        };
    }

    // Validate required fields
    if (!body.name || !body.email || !body.domain) {
        return {
            error: 'Name, email, and domain are required fields',
            status: 'error'
        };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
        return {
            error: 'Invalid email format',
            status: 'error'
        };
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(body.domain)) {
        return {
            error: 'Invalid domain format',
            status: 'error'
        };
    }

    // Security check for malicious strings
    const blacklisted_keywords = [
        'wp-config.php', 'wp-admin', 'admin-ajax.php', 'config.php', 
        'wp-cron.php', 'index.php', 'composer.json', 'package.json', 
        'style.css', 'functions.php', 'wp-include', 'wp-login', 'wp-login.php'
    ];

    for (const field in body) {
        const value = body[field];
        if (typeof value === 'string') {
            for (const keyword of blacklisted_keywords) {
                if (value.includes(keyword)) {
                    return {
                        error: 'Invalid request data',
                        status: 'error'
                    };
                }
            }
        }
    }

    try {
        // Call the WordPress REST API endpoint
        const endpoint = `${backendUrl}/wp-json/flowmate/v1/submit-domain-lead`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Domain lead submission error:', error);
        return {
            error: 'Error submitting domain lead',
            status: 'error'
        };
    }
}); 