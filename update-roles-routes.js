const fs = require('fs');

let content = fs.readFileSync('src/modules/roles/roles.routes.js', 'utf8');

// Replace all instances
content = content.replace(/authorizeRoles\('superadmin'/g, "authorizeRoles('SUPER_ADMIN'");
content = content.replace(/'school_admin'/g, "'ORG_ADMIN'");
content = content.replace(/'teacher'/g, "'VOLUNTEER'");

fs.writeFileSync('src/modules/roles/roles.routes.js', content);
console.log('Updated roles.routes.js');