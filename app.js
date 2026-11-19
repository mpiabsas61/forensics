const express = require('express');
const path = require('path');
const morgan = require('morgan');
const chalk = require('chalk');
const createError = require('http-errors');

const peritosRouter = require('./routes/peritos');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/peritos', peritosRouter);

// 404 para rutas inexistentes
app.use((req, res, next) => next(createError(404, 'Ruta no encontrada')));

// Manejador central de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // JSON mal formado
  if (err.type === 'entity.parse.failed') err = createError(400, 'JSON inválido');

  const status = err.status || 500;

  if (status >= 500) {
    console.error(chalk.red(`[ERROR CRÍTICO 500] ${err.message}\n${err.stack}`));
  } else if (status === 400) {
    console.warn(
      chalk.yellow(`[VALIDACIÓN] campo fallido: ${err.field || 'desconocido'} -> ${err.message}`)
    );
  }

  res.status(status).json({
    error: status >= 500 ? 'Error interno del servidor' : err.message,
    status,
  });
});

module.exports = app;
