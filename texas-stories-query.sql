-- Find all stories from users in Texas
-- First, let's see all users from Texas
SELECT 
    ud.id as demo_id,
    ud."userId",
    ud.state,
    u.username,
    ud."createdAt" as demo_created
FROM "UserDemographics" ud
JOIN "User" u ON u.id = ud."userId"
WHERE ud.state = 'TX'
ORDER BY ud."createdAt" DESC;

-- Now let's find all stories from Texas users
SELECT 
    s.id as story_id,
    s."userId",
    u.username,
    ud.state,
    s.status,
    s."createdAt" as story_created,
    LEFT(s."contentText", 100) as story_preview
FROM "Story" s
JOIN "User" u ON u.id = s."userId"
JOIN "UserDemographics" ud ON ud."userId" = u.id
WHERE ud.state = 'TX'
ORDER BY s."createdAt" DESC;

-- Count stories by state to verify
SELECT 
    ud.state,
    COUNT(DISTINCT s.id) as story_count,
    COUNT(DISTINCT ud."userId") as user_count
FROM "UserDemographics" ud
LEFT JOIN "Story" s ON s."userId" = ud."userId"
GROUP BY ud.state
HAVING COUNT(s.id) > 0
ORDER BY story_count DESC;