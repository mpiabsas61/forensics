require('dotenv').config();
const chalk = require('chalk');
const { sequelize, Role, User } = require('../models');

(async () => {
  try {
    await sequelize.sync();

    const roles = {};
    for (const nombre_rol of ['ADMIN', 'FORENSIC_INSPECTOR', 'AUDITOR']) {
      const [r] = await Role.findOrCreate({ where: { nombre_rol } });
      roles[nombre_rol] = r.id;
    }

    const users = [
      { username: 'admin.garcia', role_id: roles.ADMIN },
      { username: 'perito.lopez', role_id: roles.FORENSIC_INSPECTOR },
      { username: 'auditor.diaz', role_id: roles.AUDITOR },
    ];
    for (const u of users) await User.findOrCreate({ where: { username: u.username }, defaults: u });

    console.log(chalk.cyan('Seed completado: 3 roles y 3 usuarios.'));
    process.exit(0);
  } catch (err) {
    console.error(chalk.red(err.stack));
    process.exit(1);
  }
})();
