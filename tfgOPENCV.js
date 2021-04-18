const path = require('path')
const fs = require('fs')
const cv = require('opencv4nodejs')


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

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const getFaceImage = (grayImg) => {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    console.log(faceRects)
    if (!faceRects.length) {
        throw new Error('failed to detect faces');
    }
    console.log(grayImg.getRegion(faceRects[0]))
    return grayImg.getRegion(faceRects[0]);
};


get_names("./DATASET_CARAS", function(err, nombres){
    if(err){
        throw err;
    }
    //console.log(`Nombre 1: ${nombres[0]}`)
    //nombres.splice(0,10)
    //console.log(nombres)
    nombres.splice(0,1)
    //console.log(nombres)


    const trainImgsPath = path.resolve(`./CARAS_ENTRENAMIENTO_OPENCV`);

    const trainFiles = fs.readdirSync(trainImgsPath);

    const trainImages = trainFiles
        // get absolute file path
        .map(file => path.resolve(trainImgsPath, file))
        // read image
        .map(filePath => cv.imread(filePath))
        // face recognizer works with gray scale images
        .map(img => img.bgrToGray())
        // detect and extract face
        .map(getFaceImage)
        // face images must be equally sized
        .map(faceImg => faceImg.resize(80, 80));
    
    // make labels
    const labels = trainFiles
    .map(file => nombres.findIndex(name => file.includes(name)));


    const testImgsPath = path.resolve(`./CARAS_TEST_OPENCV`);

    const testFiles = fs.readdirSync(testImgsPath);

    const testImages = testFiles
        // get absolute file path
        .map(file => path.resolve(testImgsPath, file))
        // read image
        .map(filePath => cv.imread(filePath))
        // face recognizer works with gray scale images
        .map(img => img.bgrToGray())
        // detect and extract face
        .map(getFaceImage)
        // face images must be equally sized
        .map(faceImg => faceImg.resize(80, 80));
    
    

    // Training the recognizers
    /*const eigen = new cv.EigenFaceRecognizer();
    const fisher = new cv.FisherFaceRecognizer();
    const lbph = new cv.LBPHFaceRecognizer();
    eigen.train(trainImages, labels);
    fisher.train(trainImages, labels);
    lbph.train(trainImages, labels);*/



    // Recognizing the faces
    /*const runPrediction = (recognizer) => {
        testImages.forEach((img) => {
        const result = recognizer.predict(img);
        console.log('predicted: %s, confidence: %s', nombres[result.label], result.confidence);
        cv.imshowWait('face', img);
        cv.destroyAllWindows();
        });
    };
    
    console.log('eigen:');
    runPrediction(eigen);
    
    console.log('fisher:');
    runPrediction(fisher);
    
    console.log('lbph:');
    runPrediction(lbph);*/

    
});