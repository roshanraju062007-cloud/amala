/**
 * EduSphere LMS — Database Folder Deletion Script
 * Deletes the .pgdata directory completely to reset the database cluster.
 */
const fs = require('fs');
const path = require('path');

const pgdataDir = path.join(__dirname, '../.pgdata');

console.log(`⏳ Attempting to delete PostgreSQL data directory: ${pgdataDir}`);

if (fs.existsSync(pgdataDir)) {
  try {
    fs.rmSync(pgdataDir, { recursive: true, force: true });
    console.log('✅ .pgdata folder deleted successfully!');
  } catch (err) {
    console.error('❌ Failed to delete .pgdata folder:', err.message);
    console.error('⚠️ If the folder is locked, please make sure the Node server and PostgreSQL are fully stopped, then try again.');
    process.exit(1);
  }
} else {
  console.log('ℹ️ .pgdata folder does not exist. Nothing to delete.');
}
