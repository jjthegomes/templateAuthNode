import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mailer from '../../modules/mailer';
import User from '../models/usuario';
const authconfig = { secret: process.env.AUTH_SECRET };

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authconfig.secret, {
    expiresIn: 1296000
  });
}

function generateTokenWeb(params = {}) {
  return jwt.sign(params, authconfig.secret, {
    expiresIn: 3600 * 5 // segundos
  });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "Este e-mail já está cadastrado, para obter acesso ao sistema, clique em recuperar senha e siga os procedimentos enviados para sua caixa de entrada. Verifique a caixa de SPAM." })

    const user = await User.create(req.body);

    user.senha = undefined;

    const token = crypto.randomBytes(20).toString('hex');

    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        confirmacaoCadastro: { token, dataExpiracao }
      }
    });

    mailer.sendMail({
      to: email,
      from: `"Template" <${process.env.EMAIL_USER}>`,
      subject: "Confirmação de Cadastro",
      template: 'auth/confirmacao_cadastro',
      context: { nome: user.nome, token, host: process.env.HOST },
    }, (err) => {
      if (err)
        return res.status(400).send({ error: 'Não foi possível enviar email confirmação!' });

    })

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });

  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: 'Cadastro falhou' })
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, senha, web } = req.body;
  let user = null;

  try {
    user = await User.findOne({ email }).select('+senha');

    if (!user)
      return res.status(400).send({ error: 'E-mail ou senha inválidos' });

    if (!await bcrypt.compare(senha, user.senha))
      return res.status(400).send({ error: 'E-mail ou senha inválidos' })
  } catch (error) {
    console.log(error)
  }

  user.senha = undefined;

  res.send({
    user,
    token: (web) ? generateTokenWeb({ id: user.id }) : generateToken({ id: user.id }),
  });

});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.sendStatus(200);
    // return res.status(400).send({ error: 'Usuário não encontrado!' });

    const token = crypto.randomBytes(20).toString('hex');

    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        recuperacaoSenha: { token, dataExpiracao }
      }
    });

    mailer.sendMail({
      to: email,
      from: `"Template" <${process.env.EMAIL_USER}>`,
      subject: "Recuperação de Senha",
      template: 'auth/recuperacao_senha',
      context: { nome: user.nome, token, host: process.env.HOST },
    }, (err) => {
      if (err)
        return res.status(400).send({ error: 'Não foi possível enviar email  de recuperação de senha!' });
    })

    return res.sendStatus(200);

  } catch (err) {
    res.status(400).send({ error: 'Erro ao resetar senha, tente novamente.' })
  }
});

router.post('/confirm_token_reset_password', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ "recuperacaoSenha.token": token })
    if (!user)
      return res.status(400).send({ error: 'Token Inválido!' });

    const now = new Date();

    if (now > user.recuperacaoSenha.dataExpiracao)
      return res.status(400).send({ error: 'Token expirou!' });

    return res.send({ user });

  } catch (error) {
    res.status(400).send({ error: "Não foi possível confirmar seu cadastro!" })
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, senha } = req.body;
  try {

    const user = await User.findOne({ email, "recuperacaoSenha.token": token });

    if (!user)
      return res.status(400).send({ error: 'Usuário não encontrado!' });

    if (token !== user.recuperacaoSenha.token)
      return res.status(400).send({ error: 'Token inválido!' });

    const now = new Date();

    if (now > user.recuperacaoSenha.dataExpiracao)
      return res.status(400).send({ error: 'Token expirou!' });

    user.senha = senha;
    user.ativo = true;

    await user.save();
    return res.sendStatus(200);

  } catch (error) {
    return res.status(400).send({ error: "Não foi possível alterar a senha!" })
  }
});

router.post('/confirm_account', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ "confirmacaoCadastro.token": token })
    if (!user)
      return res.status(400).send({ error: 'Token Inválido!' });

    const now = new Date();

    if (now > user.confirmacaoCadastro.dataExpiracao)
      return res.status(400).send({ error: 'Token expirou!' });

    await User.findByIdAndUpdate(user._id, {
      '$set': {
        confirmacaoCadastro: { token: "", dataExpiracao: "" },
        ativo: true
      }
    });
    return res.sendStatus(200);

  } catch (error) {
    res.status(400).send({ error: "Não foi possível confirmar seu cadastro!" })
  }
});

router.post('/confirm_token_update_email', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ "trocaEmail.tokenConfirmacao": token })

    if (!user)
      return res.status(400).send({ error: 'Token Inválido!' });

    const now = new Date();

    if (now > user.trocaEmail.dataExpiracao)
      return res.status(400).send({ error: 'Token expirou!' });

    const emailAux = user.email;
    user.email = user.trocaEmail.email;
    user.trocaEmail.email = emailAux;
    user.trocaEmail.tokenConfirmacao = "";

    await User.findByIdAndUpdate(user._id, {
      email: user.email,
      trocaEmail: user.trocaEmail
    }, { new: true });

    return res.status(200).send({ user });

  } catch (error) {
    res.status(400).send({ error: "Não foi possível confirmar seu cadastro!" })
  }
});

router.post('/confirm_token_revert_email', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ "trocaEmail.tokenRecuperacao": token })

    if (!user)
      return res.status(400).send({ error: 'Token Inválido!' });

    const now = new Date();

    if (now > user.trocaEmail.dataExpiracao)
      return res.status(400).send({ error: 'Token expirou!' });

    if (!user.trocaEmail.tokenConfirmacao) {
      user.email = user.trocaEmail.email;
    }

    user.trocaEmail = {};

    await User.findByIdAndUpdate(user._id, {
      email: user.email,
      trocaEmail: user.trocaEmail
    }, { new: true });

    return res.status(200).send({ user });

  } catch (error) {
    res.status(400).send({ error: "Não foi possível confirmar seu cadastro!" })
  }
});

module.exports = app => app.use('/api/auth', router)