// scripts/setAdmin.ts

import { auth } from "./admin";

async function setAdminRole(uidOrEmail: string) {
  try {
    let user;

    if (uidOrEmail.includes('@')) {
      user = await auth.getUserByEmail(uidOrEmail);
    } else {
      user = await auth.getUser(uidOrEmail);
    }
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for ${user.email} (UID: ${user.uid})`);
  } catch (err) {
    console.error('❌ Failed to set admin claim:', err);
  }
}

// Example usage — replace with real email or UID
// setAdminRole('interview-ai-admin@gmail.com');

export default setAdminRole;