const { jsPDF } = window.jspdf;
let downloadPdf;
let uploaded = false;

$('#submitNum').click(() => {
    const numInput = $('#num').val();
    const numberOfCourses = Number(numInput);

    if(uploaded){
        // remove previously added rows
        document.querySelectorAll('.new-row').forEach(newRow => {
            newRow.remove()
        });
        
        addNumOfCourses(numberOfCourses);

        // scroll to the top of newly added rows
        const firstRowOfNewInputs = document.querySelectorAll('.new-row')[0];
        window.scrollTo(0,window.scrollY + firstRowOfNewInputs.getBoundingClientRect().top);

        document.getElementById('downloadbtn').disabled = true;
        $('#num').val('');
        return
    }

    // clear content of div.calculate 
    document.getElementById('courses-container').innerHTML = '';

    //clear content to display final result
    document.getElementById('result').innerText = '';

    // append number of inputs that corresponds to number of courses to calculate
    addNumOfCourses(numberOfCourses);

    document.getElementById('downloadbtn').disabled = true;
    $('#num').val('');
});

function addNumOfCourses(numberOfCourses) {
    //create clear button element
    const clearButton = document.createElement('button');
    clearButton.innerText = 'Clear a row';
    clearButton.style.backgroundColor = 'black';
    clearButton.style.color = 'white';
    clearButton.style.marginBottom = '15px';
    clearButton.classList.add('btn');
    clearButton.classList.add('new-row');
    clearButton.addEventListener('click', function(e){
        e.target.previousElementSibling.classList.add('animated');
        e.target.previousElementSibling.classList.add('fadeOut');
        setTimeout(() => {
            if(document.getElementById('courses-container').childElementCount == 2){
                e.target.previousElementSibling.remove();
                e.target.remove();
            }
            else{
                e.target.previousElementSibling.remove();
            }
        }, 500);
    });

    // add input rows with specified amount
    if(uploaded){
        for (let i = numCoursesInPDF; i < (numberOfCourses + numCoursesInPDF); i++) {
            document.getElementById('courses-container').insertAdjacentElement('beforeend', createRowElement(i));
        }
        document.getElementById('courses-container').insertAdjacentElement('beforeend', clearButton);
    }
    else{
        for (let i = 0; i < numberOfCourses; i++) {
            document.getElementById('courses-container').insertAdjacentElement('beforeend', createRowElement(i))
        }
        document.getElementById('courses-container').insertAdjacentElement('beforeend', clearButton);
    }
}

function createRowElement(i){
    const containerDiv = document.createElement('div');
    if(uploaded){
        containerDiv.classList.add('new-row');
    };
    const creditUnitInput = document.createElement('input');
    creditUnitInput.classList.add('grade');
    creditUnitInput.classList.add('animated');
    creditUnitInput.classList.add('fadeIn');
    creditUnitInput.setAttribute('type', 'text');
    creditUnitInput.setAttribute('placeholder', 'GRADE');
    creditUnitInput.addEventListener('change', function () {
        this.value = this.value.toUpperCase();
    });
    containerDiv.insertAdjacentHTML('beforeend', `<input class="course animated fadeIn" placeholder="COURSE ${i + 1}" type="text">  <input type="number" placeholder="CREDIT UNIT" class="credit-unit animated fadeIn">`);
    containerDiv.insertAdjacentElement('beforeend', creditUnitInput);
    containerDiv.insertAdjacentHTML('beforeend', '<hr/>');
    return containerDiv
}

$('#calculate-btn').click(function(){
    downloadPdf = calculateCGPA()
});

function calculateCGPA () {
    const creditPoints = [];
    const allCreditUnitInputs = [];
    const gradeValues = []
      
    for (var i = 0; i < document.getElementsByClassName('fadeIn').length; i++) {
        if (document.getElementsByClassName('fadeIn')[i].value == '') {
            swal('Fill in all inputs');
            return;
        }
    }

    const allGrades = $('.grade');
    for (let i = 0; i < allGrades.length; i++) {
        const creditUnits = document.getElementsByClassName('credit-unit');
        const grades = document.getElementsByClassName('grade');

        if (grades[i].value == 'a' || grades[i].value == 'A') {
            const gradeValue = 5;
            findQualityPoint(gradeValue, creditUnits[i])
        }
        else if (grades[i].value == 'b' || grades[i].value == 'B') {
            const gradeValue = 4;
            findQualityPoint(gradeValue, creditUnits[i])
        }
        else if (grades[i].value == 'c' || grades[i].value == 'C') {
            const gradeValue = 3;
            findQualityPoint(gradeValue, creditUnits[i])
        }
        else if (grades[i].value == 'd' || grades[i].value == 'D') {
            const gradeValue = 2;
            findQualityPoint(gradeValue, creditUnits[i])
        }
        else if (grades[i].value == 'e' || grades[i].value == 'E') {
            const gradeValue = 1;
            findQualityPoint(gradeValue, creditUnits[i])
        }
        else if (grades[i].value == 'f' || grades[i].value == 'F') {
            const gradeValue = 0;
            findQualityPoint(gradeValue,creditUnits[i])
        }
        else {
            swal('Invalid Entry');
            // reset all variables 
            creditPoints = [];
            allCreditUnitInputs = [];
            gradeValues = []
            return;
        }
    }

    const total = creditPoints.reduce((acc, next) => acc + next)
    const totalCreditUnit = allCreditUnitInputs.reduce((acc, next) => acc + next)
    
    const cgpa = total / totalCreditUnit;

    document.getElementById('result').innerText = cgpa.toFixed(2);
    document.getElementById('downloadbtn').disabled = false

    function findQualityPoint(gradeValue,creditUnit){
        gradeValues.push(gradeValue)
        allCreditUnitInputs.push(Number(creditUnit.value))
        const qualityPoint = Number(creditUnit.value) * gradeValue
        creditPoints.push(qualityPoint);
    }

    //download function below has closure on cgpa, gradeValues and creditPoints variables
    return function () {
        for (let i = 0; i < document.getElementsByClassName('fadeIn').length; i++) {
            if (document.getElementsByClassName('fadeIn')[i].value == '') {
                swal('Fill in inputs and calculate your cgpa first');
                return;
            }
        }
    
        // insert calculated values in a tabulated format
        const courses = document.getElementsByClassName('course');
        const creditUnits = document.getElementsByClassName('credit-unit');
        const grades = document.getElementsByClassName('grade');
    
        for (let i = 0; i <= courses.length; i++) {
            if (i === courses.length) {
                document.querySelector('tbody').insertAdjacentHTML('beforeend', `<tr><td>Your CGPA is ${cgpa.toFixed(2)}</td></tr>`);
                document.querySelector('tr').style.fontWeight = 'bold'
            }else {
              
                document.querySelector('tbody').insertAdjacentHTML('beforeend', `<tr><td>${courses[i].value}</td><td>${creditUnits[i].value}</td><td>${grades[i].value.toUpperCase()}</td><td>${gradeValues[i]}</td><td>${creditPoints[i]}</td></tr>`);
            }
        }
    
        const doc = new jsPDF()
        doc.autoTable({ html: '#myspreadsheet' })
        doc.save('mySpreadsheet.pdf')
    
        document.querySelector('tbody').textContent = ''
    }
}

$('#downloadbtn').click(function (){
    downloadPdf()
})


const BASE64_MARKER = ';base64,'

function extractText() {
    var input = document.getElementById("file-id");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function (event) {
        convertDataURIToBinary(event.target.result);
    }
}


function convertDataURIToBinary(dataURI) {

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array)

}

function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieved
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieved from the page
                resolve(finalString);
            });
        });
    });
}

function pdfAsArray(pdfAsArray) {

    PDFJS.getDocument(pdfAsArray).then(function (pdf) {

        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
            for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
                  const allValues =  pagesText[pageNum].split(' ')
                  const endValue = allValues.length - 9
                  const selectedValues = allValues.slice(6,endValue)
                  for(let i = 3; i<selectedValues.length; i += 3){
                      selectedValues.splice(i,2)
                  }
                   numCoursesInPDF = selectedValues.length / 3
                   document.getElementById('courses-container').innerHTML = '';

                  for (var i = 1; i <= numCoursesInPDF; i++) {
                    document.getElementById('courses-container').insertAdjacentHTML("beforeend", `<input class="course animated fadeIn" placeholder="COURSE ${i + 1}" type="text">  <input type="number" placeholder="CREDIT UNIT" class="credit-unit animated fadeIn">  <input type="text" placeholder="GRADE" class="grade animated fadeIn"<br/><hr/><br/>`);
                }
                 const inputs = document.querySelectorAll('.fadeIn')
                 for(let i = 0;i < inputs.length; i++){
                     inputs[i].value = selectedValues[i]
                 }
            }
        });
        uploaded = true
        document.getElementById('result').innerText = '';

    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}
