// URL JSON Datos
const url =
  "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json";

// Promesa para lectura  datos JSON
const promise = new Promise((resolve, reject) => {
  let req = new XMLHttpRequest();
  req.open("GET", url);
  req.onload = function () {
    if (req.status == 200) {
      resolve(req.response);
    } else {
      reject(req.statusText);
    }
  };
  req.send();
});

// JSON Parse
promise.then((result) => {
  let ln = JSON.parse(result);
  let tbody = document.getElementById("events");
  let corr = [];

  //---------------PARTE A----------------------------
  // Poblar eventos en la tabla
  for (let x of ln) {
    let i = 1;
    let fila = document.createElement("tr");
    let contador = document.createElement("th");
    contador.innerHTML = i;
    i += 1;
    fila.appendChild(contador);
    let events = document.createElement("td");
    events.innerHTML = x.events;
    fila.appendChild(events);
    let squirrel = document.createElement("td");
    squirrel.innerHTML = x.squirrel;

    //Condicion para pintar los true de rosado
    if (x.squirrel == true) {
      fila.style.backgroundColor = "pink";
    }
    fila.appendChild(squirrel);
    tbody.appendChild(fila);

    //---------------PARTE B--------------------------

    // Array con todos los Events
    for (let event of x.events) {
      let newEvent = true;
      for (let j = 0; j < corr.length; j++) {
        let sig = corr[j];
        if (sig.key == event) {
          newEvent = false;
          break;
        }
      }
      if (newEvent == true) {
        corr.push({
          key: event,
          TP: 0,
          TN: 0,
          FP: 0,
          FN: 0,
          MCC: 0,
        });
      }
    }
  }

  // Calcular TP y FN de todos los eventos
  for (let x of ln) {
    let calculados = [...corr];
    for (let event of x.events) {
      for (let j = 0; j < corr.length; j++) {
        let sig = corr[j];
        if (sig.key == event && x.squirrel == true) {
          sig.TP += 1;
          delete calculados[j];
        } else if (sig.key == event && x.squirrel == false) {
          sig.FN += 1;
          delete calculados[j];
        }
      }
    }
    for (let y of calculados) {
      if (y !== undefined) {
        if (x.squirrel == true) {
          y.FP += 1;
        } else {
          y.TN += 1;
        }
      }
    }
  }

  // Calcular MCC (Matthews Correlation Coefficient)
  for (let i = 0; i < corr.length; i++) {
    corr[i].MCC =
      (corr[i].TP * corr[i].TN - corr[i].FP * corr[i].FN) /
      Math.sqrt(
        (corr[i].TP + corr[i].FP) *
          (corr[i].TP + corr[i].FN) *
          (corr[i].TN + corr[i].FP) *
          (corr[i].TN + corr[i].FN),
      );
  }
  // Decsending Sort MCC
  corr.sort(function (a, b) {
    if (a.MCC > b.MCC) {
      return -1;
    } else if (a.MCC < b.MCC) {
      return 1;
    }
    return 0;
  });

  // Poblar eventos y correlaciones en la Tabla
  let tableBody = document.getElementById("correlation");
  let n = 1;
  for (let x of corr) {
    let fila = document.createElement("tr");
    let contador = document.createElement("th");
    contador.innerHTML = n;
    n += 1;
    fila.appendChild(contador);
    let events = document.createElement("td");
    events.innerHTML = x.key;
    fila.appendChild(events);
    let correlation = document.createElement("td");
    correlation.innerHTML = x.MCC;
    fila.appendChild(correlation);
    tableBody.appendChild(fila);
  }
});
