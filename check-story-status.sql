-- Check story statuses
SELECT 
    status,
    COUNT(*) as count
FROM "Story"
GROUP BY status
ORDER BY count DESC;

-- See which states have stories and their statuses
SELECT 
    ud.state,
    s.status,
    COUNT(*) as count
FROM "Story" s
JOIN "User" u ON u.id = s."userId"
JOIN "UserDemographics" ud ON ud."userId" = u.id
GROUP BY ud.state, s.status
ORDER BY ud.state, s.status;

-- List a few stories to see their status
SELECT 
    s.id,
    s.status,
    u.username,
    ud.state,
    s."createdAt"
FROM "Story" s
JOIN "User" u ON u.id = s."userId"
LEFT JOIN "UserDemographics" ud ON ud."userId" = u.id
LIMIT 10;