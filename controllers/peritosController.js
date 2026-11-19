const createError = require('http-errors');
const chalk = require('chalk');
const { Role, User } = require('../models');

const roleInclude = { model: Role, attributes: ['id', 'nombre_rol'], required: false };

// Error de validacion (400) con el campo fallido -> se loguea en amarillo
const validationError = (field, message) => {
  const err = createError(400, message);
  err.field = field;
  return err;
};

// POST /api/v1/peritos
exports.create = async (req, res, next) => {
  try {
    const { username, role_id } = req.body || {};

    if (typeof username !== 'string' || username.trim() === '') {
      throw validationError('username', 'El nombre de usuario no puede estar vacío');
    }

    const roleIdNum = Number(role_id);
    if (!Number.isInteger(roleIdNum) || roleIdNum <= 0) {
      throw validationError('role_id', 'El role_id debe ser un entero válido');
    }

    const role = await Role.findByPk(roleIdNum);
    if (!role) {
      throw validationError('role_id', `El rol con id ${roleIdNum} no existe`);
    }

    const cleanName = username.trim();
    const existing = await User.findOne({ where: { username: cleanName } });
    if (existing) {
      throw createError(409, `El username '${cleanName}' ya existe`);
    }

    const user = await User.create({ username: cleanName, role_id: roleIdNum });

    console.log(
      chalk.cyan(
        `[NUEVO PERITO] id=${user.id} | username=${user.username} | rol=${role.nombre_rol} | creado=${user.created_at.toISOString()}`
      )
    );

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: role.nombre_rol,
      active: user.active,
      created_at: user.created_at,
    });
  } catch (err) {
    // Antes de hacer create hace findOne y la restriccion UNIQUE de la BD responde 409
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(createError(409, 'El username ya existe'));
    }
    next(err);
  }
};

// DELETE /api/v1/peritos/:id  (baja logica)
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw validationError('id', 'El id debe ser un entero válido');
    }

    const user = await User.findByPk(id);
    if (!user || !user.active) {
      throw createError(404, `Perito con id ${id} no encontrado`);
    }

    user.active = false;
    await user.save();

    console.log(chalk.cyan(`[BAJA LÓGICA] id=${user.id} | username=${user.username}`));
    res.json({ message: `Perito ${user.username} dado de baja`, id: user.id, active: false });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/peritos?role=ADMIN
exports.list = async (req, res, next) => {
  try {
    const where = { active: true };

    if (req.query.role) {
      where['$Role.nombre_rol$'] = String(req.query.role).toUpperCase();
    }

    // required:false => LEFT JOIN
    const users = await User.findAll({
      where,
      include: [roleInclude],
      order: [['id', 'ASC']],
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        role_id: u.role_id,
        role: u.Role ? u.Role.nombre_rol : null,
        active: u.active,
        created_at: u.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/peritos/:id
exports.getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw validationError('id', 'El id debe ser un entero válido');
    }

    const user = await User.findOne({ where: { id, active: true }, include: [roleInclude] });
    if (!user) {
      throw createError(404, `Perito con id ${id} no encontrado`);
    }

    res.json({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      role: user.Role ? user.Role.nombre_rol : null,
      active: user.active,
      created_at: user.created_at,
    });
  } catch (err) {
    next(err);
  }
};
