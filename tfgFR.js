const path = require('path')
const fs = require('fs')
const fr = require('face-recognition')


function get_names(dir, done) {
    let nombres = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, nombres);

        list.forEach(function(file){
            file = path.resolve(dir, file);
            
            fs.stat(file, function(err, stat){
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    let nombre = file.substr(-7);
                    //console.log(`Nombre ${nombre}`)
                    nombres.push(nombre)

                    get_names(file, function(err, res){
                        nombres = nombres.concat(res);
                        if (!--pending) done(null, nombres);
                    });
                } else {

                    if (!--pending) done(null, nombres);
                }
            });
        });
    });
};


get_names("./DATASET_CARAS", function(err, nombres){
    if(err){
        throw err;
    }
    //console.log(`Nombre 1: ${nombres[0]}`)
    //nombres.splice(0,10)
    nombres.splice(0,1)
    //console.log(nombres)

    const dataTrainPath = path.resolve('./CARAS_ENTRENAMIENTO')

    const trainFiles = fs.readdirSync(dataTrainPath)
    const imagesTrainByClass = nombres.map(c =>
    trainFiles
        .filter(f => f.includes(c))
        .map(f => path.join(dataTrainPath, f))
        .map(fp => fr.loadImage(fp))
    )

    const dataTestPath = path.resolve('./CARAS_TEST')

    const testFiles = fs.readdirSync(dataTestPath)
    const imagesTestByClass = nombres.map(c =>
    testFiles
        .filter(f => f.includes(c))
        .map(f => path.join(dataTestPath, f))
        .map(fp => fr.loadImage(fp))
    )

    // Training the recognizer
    console.log("Entrenando reconocedor\n")
    let inicioEnt = Date.now()
    const recognizer = fr.FaceRecognizer()

    imagesTrainByClass.forEach((faces, label) => {
        const name = nombres[label]
        console.log(`training ${name}`)
        recognizer.addFaces(faces, name)
    })
    let finEnt = Date.now()
    let tiempoEnt = (finEnt - inicioEnt) / 1000
    console.log(`\nReconocedor entrenado. El proceso ha tardado ${tiempoEnt} segundos.`)


    
    // Recognizing new faces
    console.log("\n\nReconociendo caras\n")
    let inicioTest = Date.now()
    const errors = nombres.map(_ => [])
    imagesTestByClass.forEach((faces, label) => {
        const name = nombres[label]
        //console.log()
        console.log('testing %s', name)
        faces.forEach((face, i) => {
            const prediction = recognizer.predictBest(face)
            //console.log('%s (%s)', prediction.className, prediction.distance)

            // count number of wrong classifications
            if (prediction.className !== name) {
            errors[label] = errors[label] + 1
            }
        })
    })
    let finTest = Date.now()
    let tiempoTest = (finTest - inicioTest) / 1000
    console.log(`\nYa se han pasado todas las imágenes por el reconocedor. El proceso ha tardado ${tiempoTest} segundos.\n`)

    let people = []
    let person = []
    let contadorAciertos = 0
    let contadorCarasTest = 0
    // print the result
    const result = nombres.map((className, label) => {
        person.push(className)
        const numTestFaces = imagesTestByClass[label].length
        contadorCarasTest = contadorCarasTest + numTestFaces
        person.push(numTestFaces)
        const numCorrect = numTestFaces - errors[label].length
        contadorAciertos = contadorAciertos + numCorrect
        person.push(numCorrect)
        person.push(errors[label].length)
        const accuracy = parseInt((numCorrect / numTestFaces) * 10000) / 100
        person.push(accuracy)
        people.push(person)
        return `${className} ( ${accuracy}% ) : ${numCorrect} of ${numTestFaces} faces have been recognized correctly`
    })

    let accuracyGeneral = parseInt((contadorAciertos / contadorCarasTest) * 10000) / 100

    console.log('\nResults:')
    console.log(result)

    console.log('\nPeople:')
    console.log(person)

    console.log(`\nSe han identificado correctamente ${contadorAciertos} de ${contadorCarasTest} caras. Accuracy = ${accuracyGeneral}%.`)
});