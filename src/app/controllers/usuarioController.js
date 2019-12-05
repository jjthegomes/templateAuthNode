import express from 'express';
import authMiddleware from '../middlewares/auth';
import mailer from '../../modules/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Usuario from '../models/usuario';
import * as FormValidator from "../../helpers/formValidator";

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);
    return res.send({ usuario });

  } catch (err) {
    return res.status(400).send({ error: "Error loading user" })
  }
});

router.put('/alterarSenha', async (req, res) => {
  try {
    const { senhaAtual, senha } = req.body;
    const usuario = await Usuario.findById(req.usuarioId).select('+senha');

    if (!usuario)
      return res.status(400).send({ error: 'Erro ao carregar suas informações' });

    if (!await bcrypt.compare(senhaAtual, usuario.senha))
      return res.status(400).send({ error: 'Senha atual incorreta' });

    usuario.senha = senha;
    await usuario.save();
    usuario.senha = undefined;
    return res.send({ usuario });

  } catch (err) {
    console.log({ ...err })
    return res.status(400).send({ error: "Error updating password" })
  }
});

router.put('/alterarEmail', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!FormValidator.isEmail(email))
      return res.status(400).send({ error: 'Email inválido!' });

    if (!FormValidator.isSenha(senha))
      return res.status(400).send({ error: 'Senha inválida!' });

    const usuario = await Usuario.findById(req.usuarioId).select('+senha');

    if (!usuario)
      return res.status(400).send({ error: 'Erro ao carregar suas informações' });

    if (!await bcrypt.compare(senha, usuario.senha))
      return res.status(400).send({ error: 'Senha incorreta' });

    if (await Usuario.findOne({ email }))
      return res.status(400).send({ error: 'E-mail já está em uso' });

    const tokenConfirmacao = crypto.randomBytes(20).toString('hex');
    const tokenRecuperacao = crypto.randomBytes(20).toString('hex');

    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    await Usuario.findByIdAndUpdate(req.usuarioId, {
      '$set': {
        trocaEmail: { email, tokenConfirmacao, tokenRecuperacao, dataExpiracao }
      }
    });

    mailer.sendMail({
      to: usuario.email,
      from: `"Template" <${process.env.EMAIL_USER}>`,
      subject: "Alteração de Email",
      template: 'auth/troca_email',
      context: { nome: usuario.nome, novoEmail: email, emailAntigo: usuario.email, tokenRecuperacao, host: process.env.HOST },
    }, (err) => {
      if (err)
        console.log('Não foi possível enviar email de alteração de email!');
      else
        setTimeout(function () {
          mailer.sendMail({
            to: email,
            from: `"Template" <${process.env.EMAIL_USER}>`,
            subject: "Alteração de Email",
            template: 'auth/troca_email_confirmacao',
            context: { nome: usuario.nome, novoEmail: email, tokenConfirmacao, host: process.env.HOST },
          }, (err) => {
            if (err)
              console.log('Não foi possível enviar email de alteração de email!');
          })
        }, 4000);
    })

    usuario.senha = undefined;
    return res.send({ usuario });

  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: "Error updating email" })
  }
});

module.exports = app => app.use('/api/usuario', router);
