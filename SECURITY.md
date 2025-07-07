# Security Policy

## Our Commitment to Safety

Survival Pending is a platform for LGBTQ+ individuals to share their stories anonymously during critical times. Given the sensitive nature of our platform and the vulnerability of our users, security is not just a technical concern—it's a moral imperative. We are committed to maintaining the highest security standards to protect our users' identities, stories, and safety.

## Reporting Security Vulnerabilities

### DO NOT CREATE PUBLIC ISSUES

**IMPORTANT**: Never create public GitHub issues for security vulnerabilities. Public disclosure could:
- Expose our users to immediate danger
- Allow malicious actors to exploit vulnerabilities
- Compromise the anonymity of story contributors
- Put vulnerable individuals at risk

### How to Report

Please report all security vulnerabilities via email to:

**security@survivalpending.com**

#### What to Include in Your Report

1. **Description**: Clear explanation of the vulnerability
2. **Impact**: Potential harm to users or the platform
3. **Steps to Reproduce**: Detailed instructions to replicate the issue
4. **Proof of Concept**: Code or screenshots (if applicable)
5. **Suggested Fix**: Your recommendations (if any)

#### Encryption

For sensitive disclosures, please encrypt your email using our PGP key:
- Key ID: [To be added]
- Fingerprint: [To be added]

## Our Security Response Process

### Timeline

1. **Acknowledgment**: Within 24 hours
2. **Initial Assessment**: Within 48 hours
3. **Status Update**: Within 5 business days
4. **Resolution Target**: Based on severity (see below)

### Severity Levels

- **Critical**: Immediate threat to user safety or anonymity
  - Response time: Immediate
  - Resolution target: 24-48 hours
  
- **High**: Potential for identity disclosure or data breach
  - Response time: Within 24 hours
  - Resolution target: 3-5 days
  
- **Medium**: Security issues affecting platform integrity
  - Response time: Within 48 hours
  - Resolution target: 7-14 days
  
- **Low**: Minor security improvements
  - Response time: Within 5 days
  - Resolution target: 30 days

## Security Measures in Place

### User Protection
- **No Email Collection**: We never collect email addresses
- **Anonymous Authentication**: Auto-generated usernames only
- **No Recovery Options**: Protects against social engineering
- **No Personal Data**: We don't store identifying information
- **Auto-deletion**: Stories can be set to auto-delete

### Technical Safeguards
- **End-to-End Encryption**: For sensitive data transmission
- **Secure Token Management**: JWT with short expiration
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Prevention of injection attacks
- **Content Security Policy**: XSS protection
- **HTTPS Only**: All connections encrypted

### Operational Security
- **Regular Security Audits**: Quarterly assessments
- **Dependency Scanning**: Automated vulnerability checks
- **Code Review**: All changes reviewed for security
- **Incident Response Plan**: Documented procedures
- **Data Minimization**: We only store what's necessary

## Quick Exit Feature

The platform includes a quick exit feature (3x ESC or panic button) that:
- Immediately closes the browser tab
- Clears local storage
- Redirects to a benign website
- Leaves no browser history

## Special Considerations

### Location Security
- No IP logging beyond what's required for security
- No geolocation features
- VPN/Tor friendly

### Content Moderation
- Automated scanning for self-harm content
- Immediate crisis intervention resources
- Human review with trauma-informed moderators

### Law Enforcement Requests
- We will resist requests to the fullest extent legally possible
- Users will be notified unless legally prohibited
- Transparency reports published quarterly

## Security Best Practices for Users

1. **Use a VPN or Tor**: For additional anonymity
2. **Private Browsing**: Use incognito/private mode
3. **Secure Device**: Ensure your device is not compromised
4. **Save Credentials Securely**: Use a password manager
5. **Don't Share Usernames**: Keep your identity private

## Bug Bounty Program

[Coming Soon] We plan to launch a bug bounty program to reward security researchers who help us protect our users.

## Contact

- **Security Issues**: security@survivalpending.com
- **General Support**: support@survivalpending.com
- **Crisis Support**: Links available on platform

## Acknowledgments

We maintain a hall of fame for security researchers who have helped improve our platform's security. With your permission, we'll add your name/handle here after a vulnerability is resolved.

---

*Last updated: [Current Date]*
*Version: 1.0*

Remember: The safety of our users depends on the security of our platform. Thank you for helping us protect vulnerable voices.