const fs = require('fs');
const path = require('path');


function filewalker(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);

        list.forEach(function(file){
            file = path.resolve(dir, file);
            
            fs.stat(file, function(err, stat){
                if (stat && stat.isDirectory()) {
                    par = [];
                    results.push(file);
                    let nombre = file.substr(-7);
                    par.push(nombre)
                    par.push(0)
                    cantidades.push(par)

                    filewalker(file, function(err, res){
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    let name = file.substr(-19,7);

                    for(let i = 0; i < cantidades.length; i++) {
                        if(name == cantidades[i][0]){
                            cantidades[i][1] = cantidades[i][1] + 1;
                        }
                    }

                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

function save(dir, done) {

    let count = 1;
    let nombre = '';

    fs.readdir(dir, function(err, list) {
        if (err) console.log(err);

        list.forEach(function(file){
            file = path.resolve(dir, file);
            let name = dir.substr(-7)
            console.log(file)
            
            fs.stat(file, function(err, stat){
                if (stat && stat.isDirectory()) {
                    save(file, function(err, res){
                        if (err) console.log(err);
                    });
                } else {
                    let name = dir.substr(-7)
                    nombre = name + "_" + count
                    
                    for(let a = 0; a < cantidades.length; a++) {
                        if(cantidades[a][0] == name) {
                            if(count < cantidades[a][1]) {
                                fs.copyFileSync(file, `CARAS_TEST_OPENCV/` + nombre)
                                //console.log(`Imagen ${nombre} guardada en CARAS_TEST_OPENCV`)
                            }
                            else {
                                fs.copyFileSync(file, `CARAS_ENTRENAMIENTO_OPENCV/` + nombre)
                                //console.log(`Imagen ${nombre} guardada en CARAS_ENTRENAMIENTO_OPENCV`)
                            }
                        }
                    }
                    count++
                }
            });
        });
    });
};



let cantidades = [];
let par = [];

filewalker("./DATASET_CARAS", function(err, data){
    if(err){
        throw err;
    }

    //nombres.splice(0,1)
    //cantidades.splice(0,1)
    for(let i = 0; i < cantidades.length; i++) {
        cantidades[i][1] = Math.round(cantidades[i][1] * 0.2)
    }

    fs.mkdir(path.join(__dirname, 'CARAS_TEST_OPENCV'), {recursive: true}, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Se ha creado la carpeta CARAS_TEST_OPENCV');
    })

    fs.mkdir(path.join(__dirname, 'CARAS_ENTRENAMIENTO_OPENCV'), {recursive: true}, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Se ha creado la carpeta CARAS_ENTRENAMIENTO_OPENCV');
    })

    let dir = "./DATASET_CARAS"

    save(dir, function(error, data) {
        if(error){
            console.log(error)
        }
        console.log("\nYa esta")
    })
});