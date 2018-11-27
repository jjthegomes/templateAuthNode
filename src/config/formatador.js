export const getPrimeiroNome = nome => {
  if (nome) {
    nome = nome.split(" ");
    nome = nome[0].charAt(0).toUpperCase() + nome[0].toLowerCase().slice(1);
  }
  return nome;
}

export const arrayMes = [];
arrayMes[0] = ["Janeiro", "JAN"];
arrayMes[1] = ["Fevereiro", "FEV"];
arrayMes[2] = ["Março", "MAR"];
arrayMes[3] = ["Abril", "ABR"];
arrayMes[4] = ["Maio", "MAI"];
arrayMes[5] = ["Junho", "JUN"];
arrayMes[6] = ["Julho", "JUL"];
arrayMes[7] = ["Agosto", "AGO"];
arrayMes[8] = ["Setembro", "SET"];
arrayMes[9] = ["Outubro", "OUT"];
arrayMes[10] = ["Novembro", "NOV"];
arrayMes[11] = ["Dezembro", "DEZ"];

export const getData = (data) => new Date(data);

export const getTime = (data) => getData(data).getTime();

export const getMes = (data) => arrayMes[getData(data).getMonth()][0];

export const getMesAbreviado = (data) => arrayMes[getData(data).getMonth()][1];

export const getDiaMes = (data) => getData(data).getUTCDate();

export const getAno = (data) => getData(data).getFullYear();

export const getHora = (data) =>
  (getData(data).getHours().toString().length === 1) ? "0" + getData(data).getHours() : getData(data).getHours();

export const getMinutos = (data) =>
  (getData(data).getMinutes().toString().length === 1) ? "0" + getData(data).getMinutes() : getData(data).getMinutes();

// export const getDataFormatada = (data) =>
//   getDiaMes(data) + " de " + getMes(data) + " de " + getAno(data) + " às " + getHora(data) + ":" + getMinutos(data);

//aaaa-mm-dd
export const getDataFormatada = (data) => {
  data = new Date(data);
  const ano = data.getUTCFullYear();
  const mes = (data.getUTCMonth() + 1 >= 10) ? data.getUTCMonth() + 1 : "0" + data.getUTCMonth() + 1;
  const dia = (data.getUTCDate() >= 10) ? data.getUTCDate() : "0" + data.getUTCDate();
  return ano + "-" + mes + "-" + dia;
}

export const getDataFormatadaPtBr = (data) => {
  data = new Date(data);
  const ano = data.getUTCFullYear();
  const mes = (data.getUTCMonth() + 1 >= 10) ? data.getUTCMonth() + 1 : "0" + data.getUTCMonth() + 1;
  const dia = (data.getUTCDate() >= 10) ? data.getUTCDate() : "0" + data.getUTCDate();
  return `${dia}/${mes}/${ano}`;
}

export const getTempoEspera = (milisegundo, data) => {
  const tempo = new Date().getTime() - new Date(data).getTime()

  const msToTime = duration => {
    let minutes = parseInt((duration / (1000 * 60)) % 60, 10)
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    if (hours === "00")
      return `${minutes} ${(minutes === '01') ? 'minuto' : 'minutos'}`;
    return `${hours} ${(hours === '01') ? 'hora' : 'horas'} e ${minutes} ${(minutes === '01') ? 'minuto' : 'minutos'}`;
  }

  return msToTime(milisegundo - tempo)
} 