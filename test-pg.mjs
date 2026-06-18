/**
 * EduSphere LMS — Quick embedded PostgreSQL test + connection
 */
async function test() {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const path = require('path');

  const pg = new EmbeddedPostgres({
    databaseDir: path.join(__dirname, '.pgdata'),
    user:        'postgres',
    password:    'postgres',
    port:        5432,
    persistent:  true,
  });

  try {
    console.log('Initialising...');
    await pg.initialise();
    console.log('Starting...');
    await pg.start();
    console.log('PG started!');

    const { Client } = require('pg');
    const c = new Client({ host:'localhost', port:5432, user:'postgres', password:'postgres', database:'postgres' });
    await c.connect();
    const r = await c.query('SELECT version()');
    console.log('PG Version:', r.rows[0].version);
    await c.end();
    await pg.stop();
    console.log('Test PASSED!');
  } catch(e) {
    console.error('Test FAILED:', e.message);
    try { await pg.stop(); } catch(se) {}
  }
}
test();
