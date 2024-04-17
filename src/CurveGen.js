// ALL VALUES ARE IN mm

function mod(n, m) {
    return ((n % m) + m) % m;
}

function triangleFunction(x, f, h) {
    return h*2*Math.abs(2*mod(f/2*x - 0.25, 1) - 1) - h
}

function sinusFunction(x, f, h) {
    return h*Math.sin(f*x*Math.PI + 2*Math.PI)
}

function elipsoidFunction(x, f, h) {
    let width = 1/f
    let numerator = Math.pow((x - width / 2), 2);
    let denominator = Math.pow((width / 2), 2);
    let y = Math.sqrt(1 - (numerator / denominator)) * h;
    return y;
}


// this functione can be used to interpolate between a sine wave and a triangle wave
function InterpolatedFunction(x, sharpness, height, frequency, baseWave, mixedWave){
    let functions = [triangleFunction, elipsoidFunction, sinusFunction]
    return (1-sharpness) * functions[baseWave](x, frequency, height) + sharpness * functions[mixedWave](x, frequency, height)
}

function getPoints(height, width, sharpness, currentX, baseWave, mixedWave){
    var yValues = []
    var xValues = []
    let frequency = 1 / width
    let detail = 20

    for (var x = 0; x <= width; x += width/detail) {
        xValues.push(currentX + x)
        yValues.push(InterpolatedFunction(x, sharpness, height, frequency, baseWave, mixedWave));
    }
    return {x: xValues, y: yValues};
}


export default function curveGen(height1, width1, sharpness1, baseType1, mixedType1, height2, width2, sharpness2, baseType2, mixedType2, totalLength, smoothening){
    let totalYValues = []
    let totalXValues = []
    let lengthDone = 0
    let firstCurve = true
    let curvePoints = []
    
    while(lengthDone + (firstCurve?width1:width2) <= totalLength){
        if (firstCurve){
            curvePoints = getPoints(height1, width1, sharpness1, lengthDone, baseType1, mixedType1)
            totalYValues = [...totalYValues, ...curvePoints.y]
            totalXValues = [...totalXValues, ...curvePoints.x]
            lengthDone += width1
        }else{
            curvePoints = getPoints(height2, width2, sharpness2, lengthDone, baseType2, mixedType2)
            totalYValues = [...totalYValues, ...curvePoints.y]
            totalXValues = [...totalXValues, ...curvePoints.x]
            lengthDone += width2
        }

        firstCurve = !firstCurve
        
    }

    // calc how much percent we still need of the yValues and append them
    if (firstCurve){
        curvePoints = getPoints(height1, width1, sharpness1, lengthDone, baseType1, mixedType1)
    }else{
        curvePoints = getPoints(height2, width2, sharpness2, lengthDone, baseType2, mixedType2)
    }

    for(let i = 0; i <= curvePoints.x.length; i++){
        if (curvePoints.x[i] > totalLength){
            break
        }
        // TODO: optimize this since slicing might be better
        totalXValues = [...totalXValues, curvePoints.x[i]]
        totalYValues = [...totalYValues, curvePoints.y[i]]
    }
    return {x: totalXValues, y: totalYValues};
    
}
