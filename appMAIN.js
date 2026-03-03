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

    // prevent input of a future date
    const today = (new Date().toLocaleDateString('en-CA'))
    console.log(`today is ${today}`)
    if (expenseDate > today) {
        alert('Date cannot be future date...')
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
    document.getElementById('otherDescription').style.display = 'none'

}

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


function PieChartTYPES() {
    const categoryData = getData();

    const categories = [
        'insurance', 'medical', 'subscriptions', 'shopping',
        'groceries', 'savings', 'diningOut', 'gifts', 'travel', 'other'
    ];

    const series = categories.map(category =>
        categoryData.reduce((count, item) => count + (item.expenseType === category ? 1 : 0), 0)
    );

    const options = {
        series,
        chart: { width: 555, type: 'donut' },
        colors: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#2ecc71',
            '#e74c3c',
            '#aa3b85',
            '#877d9b'],
        dataLabels: { enabled: false },
        labels: categories,
        responsive: [{
            breakpoint: 480,
            options: { chart: { width: 200 }, legend: { position: 'bottom' } }
        }]
    };

    new ApexCharts(document.querySelector("#pieChart"), options).render();
}


function barChart() {

    const categoryData = getData();
    let yearsArray = [];

    for (let i = 0; i < categoryData.length; i++) {
        let currentYear = new Date(categoryData[i].expenseDate).getFullYear();

        let yearData = yearsArray.find(y => y.year === currentYear);

        if (yearData) {
            yearData.count++;
        } else {
            yearsArray.push({ year: currentYear, count: 1 });
        }
    }

    yearsArray.sort((a, b) => a.year - b.year);

    const categories = yearsArray.map(y => y.year);
    const seriesData = yearsArray.map(y => y.count);

    var options = {
        series: [{
            name: 'Expenses',
            data: seriesData
        }],
        chart: {
            type: 'bar',
            height: 500,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%'
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: categories
        },
        yaxis: {
            title: {
                text: 'Count'
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
                plotOptions: {
                    bar: {
                        columnWidth: '70%'
                    }
                }
            }
        }]
    };

    var chart = new ApexCharts(document.querySelector("#barChart"), options);
    chart.render();
}

function pdfFile() {
    const categoryData = getData();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();



    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Expenses Report", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Type | Other | Description | Amount | Date", 10, y);
    y += 10;

    const pageHeight = doc.internal.pageSize.height;

    categoryData.forEach(info => {
        const line = [
            info.expenseType || "",
            info.otherDescription || "",
            info.expenseDescription || "",
            info.expenseAmount || "",
            info.expenseDate || ""
        ].join(" | ");

        if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }

        doc.text(line, 10, y);
        y += 10;
    });

    doc.save("expenses.pdf");
}
function downloadCSV() {
    const info = getData();

    const headers = ["Type", "Other", "Description", "Amount", "Date"];

    let csvContent = headers.join(",") + "\n";


    info.forEach(item => {

        const row = [
            item.expenseType || "",
            item.otherDescription || "",
            item.expenseDescription || "",
            item.expenseAmount || "",
            item.expenseDate || ""
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expenses.csv";
    link.click();

    URL.revokeObjectURL(link.href);
}


window.onload = function () {

    drawMenu();
    syncDataToDOM();
    if (document.getElementById('pieChart')) {
        PieChartTYPES();
        barChart();
    }

    const expenseType = document.getElementById('expenseType');
    const otherDesc = document.getElementById('otherDescription');

    if (expenseType && otherDesc) {
        expenseType.addEventListener('change', () => {
            if (expenseType.value === 'other') {
                otherDesc.style.display = 'block';
                otherDesc.required = true;
            } else {
                otherDesc.style.display = 'none';
                otherDesc.required = false;
            }
        });
    }
};


