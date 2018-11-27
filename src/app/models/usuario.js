import mongoose from '../../database';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
    select: false,
  },
  nivel: {
    type: String,
    required: false,
  },
  genero: {
    type: String,
    required: false
  },
  celular: {
    type: String,
    required: false
  },
  dataNascimento: {
    type: String,
    required: false
  },
  ativo: {
    type: Boolean,
    default: false
  },
  fotoPerfil: {
    type: String,
    required: false
  },
  recuperacaoSenha: {
    token: {
      type: String,
      required: false
    },
    dataExpiracao: {
      type: Date,
      required: false
    }
  },
  confirmacaoCadastro: {
    token: {
      type: String,
      required: false
    },
    dataExpiracao: {
      type: Date,
      required: false
    }
  },
  trocaEmail: {
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    tokenConfirmacao: {
      type: String,
      required: false
    },
    tokenRecuperacao: {
      type: String,
      required: false
    },
    dataExpiracao: {
      type: Date,
      required: false
    }
  },
}, { timestamps: true });

UsuarioSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.senha, 10);
  this.senha = hash;
  next();
});

const Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

module.exports = Usuario;
