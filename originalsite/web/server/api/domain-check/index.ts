import { getQuery } from 'h3';

export default defineEventHandler(async (e) => {
    const config = useRuntimeConfig();
    const backendUrl = config.private.backendUrl;

    const query = getQuery(e);
    const domain = query.domain?.toString() || '';

    // Basic validation
    if (!domain) {
        return {
            error: 'Domain parameter is required',
            status: 'error'
        };
    }

    // Validate domain format - basic check
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return {
            error: 'Invalid domain format',
            domain,
            status: 'error'
        };
    }

    // Security check for malicious strings
    const blacklisted_keywords = [
        'wp-config.php', 'wp-admin', 'admin-ajax.php', 'config.php', 
        'wp-cron.php', 'index.php', 'composer.json', 'package.json', 
        'style.css', 'functions.php', 'wp-include', 'wp-login', 'wp-login.php'
    ];

    for (const keyword of blacklisted_keywords) {
        if (domain.includes(keyword)) {
            return {
                error: 'Invalid domain',
                status: 'error'
            };
        }
    }

    try {
        // Call the WordPress REST API endpoint
        const endpoint = `${backendUrl}/wp-json/flowmate/v1/domain-check?domain=${encodeURIComponent(domain)}`;
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Domain check error:', error);
        return {
            error: 'Error checking domain availability',
            status: 'error'
        };
    }
}); 