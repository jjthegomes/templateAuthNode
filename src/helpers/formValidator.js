import Validator from "validator";
import * as formatador from "./formatador";

export const validate = (input) => input.trim();

export const isVazio = (input) => (!input || input.trim().length === 0)

export const isNomeCompleto = (input) => (input.trim().match(/[a-zA-Z]* [a-zA-Z]*/))

export const isEmail = (input) => Validator.isEmail(input)

export const isFaculdade = (input) => (input.trim())

export const isNumero = (input) => (input.match(/^[0-9]{1,5}$/))

export const isMaiorQueZero = (input) => (parseInt(input, 10) > 0)

export const isNotaMax = (input) => (input.match(/^(?=.*\d)[0-9]{1,5}$/))

export const isNumeroIgual = (n1, n2) => (parseInt(n1, 10) === parseInt(n2, 10))

export const isDataValida = (input) => (input.match(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/))

export const getTimeDate = (data) => data.getTime()

export const isDataMenorIgual = (data1, data2) => (formatador.getTime(data1) <= formatador.getTime(data2))

export const isNumeroCelular = (input) => (input.match(/^\([1-9]{2}\) [2-9][0-9]{4}-[0-9]{3,4}$/))

export const isSenha = (input) => (input.match(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%&*?+-]{8,64}$/))

export const isSenhaIgual = (input1, input2) => (input1 === input2)

export const isSelected = (input) => (input !== undefined && input !== null && input.toString().length >= 1)

// Data Nascimento 
const getDate = (dia, mes, ano) => new Date(ano, parseInt(mes, 10) - 1, dia, 0, 0, 0, 0)

const getMilisegundoIdade = (idade) => idade * 365 * 24 * 60 * 60 * 1000;

const isMaiorIdade = (data) => new Date().getTime() - data.getTime() >= getMilisegundoIdade(15)

const isBissexto = (ano) => (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0));

const isFevereiro = (dia, mes, ano) => {
  if (mes === 2) {
    if (isBissexto(ano) && dia > 29) {
      return true
    } else if (!isBissexto(ano) && dia > 28) {
      return true
    }
  }
  return false
}

const isMes30 = (dia, mes) => [4, 6, 9, 11].indexOf(mes) !== -1 && dia > 30

export const isDataNascimento = (input) => {
  if (input.match(/^\s*(3[01]|[12][0-9]|0?[1-9])\/(1[012]|0?[1-9])\/((?:19|20)\d{2})\s*$/)) {
    let d = [];
    input.split("/").forEach(e => { d.push(parseInt(e, 10)) });
    return !(
      (!isMaiorIdade(getDate(d[0], d[1], d[2]))) || (isFevereiro(d[0], d[1], d[2])) || (isMes30(d[0], d[1]))
    )
  }
}

export const getErro = erro => {
  if (erro.data) return erro.data.error;

  if (erro.problem === "NETWORK_ERROR") return "Não foi possível conectar ao servidor";

  return "Erro desconhecido"
}