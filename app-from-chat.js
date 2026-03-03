const LOCAL_STORAGE_KEY = "expenseInfo"
var currentRowId = null

function drawMenu() {
    document.getElementById('menu').innerHTML = `
        <a href="1-home-page.html">Home</a>
        <a href="2-filter-page.html">Filters</a>
        <a href="3-charts-page.html">Charts</a>
        <a href="4-about-page.html">About</a>
    `;
}

function saveInfo(data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

function deleteRowInfo(id) {
    if (confirm(`Are you certain you want to delete this?`)) {
        const data = getData()
        const index = data.findIndex(product => product.rowId === id)
        if (index !== -1) {
            data.splice(index, 1)
            saveInfo(data)
            syncDataToDOM()
        }
    }
}

function updateRow(id) {
    const data = getData()
    const item = data.find(product => product.rowId === id)
    if (!item) return alert("Item not found!")

    document.getElementById('expenseType').value = item.expenseType
    document.getElementById('expenseDescription').value = item.expenseDescription
    document.getElementById('otherDescription').value = item.otherDescription
    document.getElementById('expenseAmount').value = item.expenseAmount
    document.getElementById('expenseDate').value = item.expenseDate

    // ====== Show Other Description if type is "other" ======
    if (item.expenseType === 'other') {
        document.getElementById('otherDescription').style.display = 'block'
        document.getElementById('otherDescription').required = true
    } else {
        document.getElementById('otherDescription').style.display = 'none'
        document.getElementById('otherDescription').required = false
    }

    currentRowId = item.rowId

    const index = data.findIndex(product => product.rowId === id)
    data.splice(index, 1)
    saveInfo(data)
    syncDataToDOM()
}

function getData() {
    const formData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []
    return formData
}

function syncDataToDOM() {
    let htmlString = ''
    const data = getData()
    for (const product of data) {
        htmlString = htmlString + `
    <tr> 
        <td style="display:none">${product.rowId}</td>
        <td>${product.expenseType}</td>
        <td>${product.otherDescription}</td>
        <td>${product.expenseDescription}</td>
        <td>${product.expenseAmount}</td>
        <td>${product.expenseDate}</td>
        <td>
                <button onclick="deleteRowInfo(${product.rowId})">X</button>
                <button onclick="updateRow(${product.rowId})">↺</button>
        </td>
    </tr>  `
    }
    if (document.getElementById('formData') != null) {

        document.getElementById('formData').innerHTML = htmlString;
    }
}

function addToList(event) {
    event.preventDefault()

    const expenseType = document.getElementById('expenseType').value
    const expenseDescription = document.getElementById('expenseDescription').value
    const otherDescription = document.getElementById('otherDescription').value
    const expenseAmount = +document.getElementById('expenseAmount').value
    const expenseDate = document.getElementById('expenseDate').value

    const formData = getData()

    const rowId = currentRowId || (Date.now() + Math.floor(Math.random() * 1000000))

    if (expenseType === 'other' && !otherDescription) {
        alert('if you choose other you must describe it')
        return
    }

    const today = (new Date().toLocaleDateString('en-CA'))
      console.log(`today is ${today}`)
    if (expenseDate > today) {
        alert('you must not enter a date in the future...')
        return
    }

    formData.push({
        rowId,
        expenseType,
        expenseDescription,
        otherDescription,
        expenseAmount,
        expenseDate,
    })

    saveInfo(formData)
    syncDataToDOM()

    document.getElementById('expenseList').reset()
    currentRowId = null
    document.getElementById('otherDescription').style.display = 'none' // hide after submit
}

/////////////////////////////////// need more help with this 
const radios = document.querySelectorAll('input[name="filterType"]')
radios.forEach(radio => {
    radio.addEventListener('change', () => {
        const value = radio.value

        document.getElementById('yearDiv').style.display = 'none'
        document.getElementById('monthDiv').style.display = 'none'
        document.getElementById('dayDiv').style.display = 'none'
        document.getElementById('amountDiv').style.display = 'none'

        if (value === 'year') document.getElementById('yearDiv').style.display = 'block'
        if (value === 'month') document.getElementById('monthDiv').style.display = 'block'
        if (value === 'day') document.getElementById('dayDiv').style.display = 'block'
        if (value === 'amount') document.getElementById('amountDiv').style.display = 'block'
    })
})

function filter(event) {
    event.preventDefault();

    const filterTypeElem = document.querySelector('input[name="filterType"]:checked');
    if (!filterTypeElem) return alert('Please select a filter type');
    const filterType = filterTypeElem.value;

    let filterValue;
    if (filterType === 'year') filterValue = +document.getElementById('yearInput').value;
    if (filterType === 'month') filterValue = document.getElementById('monthInput').value;
    if (filterType === 'day') filterValue = document.getElementById('dayInput').value;
    if (filterType === 'amount') filterValue = +document.getElementById('amountInput').value;

    if (!filterValue) return alert('Please enter a value to filter');

    const filteredData = getData().filter(product => {
        if (filterType === 'year') {
            return new Date(product.expenseDate).getFullYear() === filterValue;
        }
        if (filterType === 'month') {
            return product.expenseDate.slice(0, 7) === filterValue;
        }
        if (filterType === 'day') {
            return product.expenseDate === filterValue;
        }
        if (filterType === 'amount') {
            return product.expenseAmount <= filterValue;
        }
    });

    let htmlString = '';
    for (const product of filteredData) {
        htmlString += `
        <tr> 
            <td>${product.expenseType}</td>
            <td>${product.otherDescription}</td>
            <td>${product.expenseDescription}</td>
            <td>${product.expenseAmount}</td>
            <td>${product.expenseDate}</td>
        </tr>
        `;
    }
    document.getElementById('formfilterData').innerHTML = htmlString;
}

// ... PieChartTYPES, barChart, pdfFile, downloadCSV נשארים כפי שהם שלך ...

window.onload = function () {
    drawMenu();
    syncDataToDOM();
    PieChartTYPES();
    barChart();

    // ====== Show/hide "Other" description dynamically ======
    const expenseType = document.getElementById('expenseType');
    const otherDesc = document.getElementById('otherDescription');

    expenseType.addEventListener('change', () => {
        if (expenseType.value === 'other') {
            otherDesc.style.display = 'block';
            otherDesc.required = true;
        } else {
            otherDesc.style.display = 'none';
            otherDesc.required = false;
        }
    });
};