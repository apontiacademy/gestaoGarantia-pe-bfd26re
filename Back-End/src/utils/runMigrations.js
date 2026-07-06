const { execSync } = require('child_process');
const path = require('path');

function runMigrations() {
  const rootDir = path.resolve(__dirname, '../..');

  console.log('🔄 Executando migrations...');
  console.log('   NODE_ENV =', process.env.NODE_ENV || 'development');
  console.log('   DB_HOST =', process.env.DB_HOST || '(não definido)');
  console.log('   DB_NAME =', process.env.DB_NAME || '(não definido)');
  execSync('npx sequelize-cli db:migrate', {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Migrations concluídas');
}

module.exports = { runMigrations };
