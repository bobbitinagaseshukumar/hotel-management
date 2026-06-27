import bcrypt from 'bcryptjs';

async function check() {
  const hash = '$2a$10$TIpLKxXGuDSX6BkftPLriu96tvq8RJqw60W5VX8av0ZmYpDm8PkTa';
  const match = await bcrypt.compare('seshu@2409', hash);
  console.log("Does 'seshu@2409' match the hash in the database?", match);
}

check();
